import React from "react";
import { VirtuosoGrid } from "react-virtuoso";

interface VirtualResponsiveGridProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  itemClassName?: string;
  gap?: string;
  emptyComponent?: React.ReactNode;
}

function VirtualResponsiveGridInner<T>({
  data,
  renderItem,
  className = "",
  itemClassName = "",
  gap = "gap-4",
  emptyComponent,
}: VirtualResponsiveGridProps<T>) {
  if (data.length === 0) {
    return <div className="w-full text-center py-12">{emptyComponent || 'Currently no data available.'}</div>;
  }
  return (
    <VirtuosoGrid
      totalCount={data.length}
      itemContent={(index) => renderItem(data[index], index)}
      components={{
        Scroller: React.forwardRef((props, ref) => {
          const { style, children } =
            props as React.HTMLAttributes<HTMLDivElement>;
          return (
            <div
              ref={ref as React.RefObject<HTMLDivElement>}
              style={style}
              className="scrollbar-hide"
            >
              {children}
            </div>
          );
        }),
        List: React.forwardRef((props, ref) => {
          const { style, children } =
            props as React.HTMLAttributes<HTMLDivElement>;
          return (
            <div
              ref={ref as React.RefObject<HTMLDivElement>}
              style={style}
              className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${gap} ${className}`}
            >
              {children}
            </div>
          );
        }),
        Item: ({ children, ...props }) => (
          <div {...props} className={itemClassName}>
            {children}
          </div>
        ),
      }}
    />
  );
}

const VirtualResponsiveGrid = React.memo(
  VirtualResponsiveGridInner
) as typeof VirtualResponsiveGridInner;
export default VirtualResponsiveGrid;
