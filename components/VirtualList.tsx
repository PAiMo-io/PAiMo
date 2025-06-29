import React from 'react';
import { VirtuosoGrid } from 'react-virtuoso';
import PageSkeleton from './PageSkeleton';

interface VirtualResponsiveGridProps<T> {
    data: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    className?: string;
    itemClassName?: string;
    gap?: string;
    emptyComponent?: React.ReactNode;
}

const Scroller = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => {
    const { style, children } = props as React.HTMLAttributes<HTMLDivElement>;

    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        const el = e.currentTarget;
        const atTop = el.scrollTop === 0;
        const atBottom = el.scrollHeight - el.scrollTop === el.clientHeight;
        const scrollingDown = e.deltaY > 0;

        if ((scrollingDown && atBottom) || (!scrollingDown && atTop)) {
            return;
        }

        e.stopPropagation();
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        e.stopPropagation();
    };

    return (
        <div
            ref={ref as React.RefObject<HTMLDivElement>}
            style={style}
            className='scrollbar-hide'
            onWheel={handleWheel}
            onTouchMove={handleTouchMove}
        >
            {children}
        </div>
    );
});
Scroller.displayName = 'Scroller';

const List = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ style, children, className = '', ...rest }, ref) => {
        return (
            <div
                ref={ref}
                style={style}
                className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}
                {...rest}
            >
                {children}
            </div>
        );
    }
);
List.displayName = 'List';

function VirtualResponsiveGridInner<T>({
    data,
    renderItem,
    className = '',
    itemClassName = '',
    gap = 'gap-4',
    emptyComponent,
}: VirtualResponsiveGridProps<T>) {
    if (data.length === 0) {
        return <div className='w-full text-center py-12'>{emptyComponent || 'Currently no data available.'}</div>;
    }

    return (
        <VirtuosoGrid
            totalCount={data.length + 1}
            itemContent={(index) => {
                if (index === data.length) {
                    return <div style={{ height: '48px' }} />;
                }
                return renderItem(data[index], index);
            }}
            components={{
                Scroller,
                List,
                Item: ({ children, ...props }) => (
                    <div {...props} className={itemClassName}>
                        {children}
                    </div>
                ),
                ScrollSeekPlaceholder: () => (
                    <div className='border rounded-md p-4 space-y-1 bg-white shadow min-h-[206px]'>
                        <PageSkeleton />
                    </div>
                ),
            }}
            scrollSeekConfiguration={{
                enter: (velocity) => Math.abs(velocity) > 200,
                exit: (velocity) => Math.abs(velocity) < 30,
            }}
        />
    );
}

const VirtualResponsiveGrid = React.memo(VirtualResponsiveGridInner) as typeof VirtualResponsiveGridInner;
export default VirtualResponsiveGrid;
