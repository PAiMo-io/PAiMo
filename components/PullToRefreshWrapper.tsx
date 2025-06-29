import React, { useState, useRef, useEffect } from 'react';
import { TopLoader } from './ui/top-loader';
import { useHaptic } from 'use-haptic';

interface PullToRefreshWrapperProps {
    onRefresh: () => Promise<void>;
    children: React.ReactNode;
    threshold?: number;
    debounceMs?: number;
    className?: string;
}

export const PullToRefreshWrapper: React.FC<PullToRefreshWrapperProps> = ({
    onRefresh,
    children,
    threshold = 60,
    debounceMs = 1500,
    className = '',
}) => {
    const [refreshing, setRefreshing] = useState(false);
    const [pulling, setPulling] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const startYRef = useRef<number | null>(null);
    const lastRefreshTimeRef = useRef<number>(0);
    const deltaYRef = useRef(0);
    const hasTriggeredHaptic = useRef(false);
    const { triggerHaptic } = useHaptic();

    const now = () => Date.now();

    const canTrigger = () => {
        return now() - lastRefreshTimeRef.current >= debounceMs && !refreshing;
    };

    const triggerRefresh = async () => {
        if (!canTrigger()) return;
        lastRefreshTimeRef.current = now();
        setRefreshing(true);
        await onRefresh();
        setRefreshing(false);
    };

    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        const isElementAtTop = (el: HTMLElement | null): boolean => {
            while (el) {
                if (el.scrollHeight > el.clientHeight && el.scrollTop > 0) {
                    return false;
                }
                el = el.parentElement;
            }
            return true;
        };

        const handleTouchStart = (e: TouchEvent) => {
            const target = e.target as HTMLElement;
            if (isElementAtTop(target)) {
                startYRef.current = e.touches[0].clientY;
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (startYRef.current === null) return;

            const delta = e.touches[0].clientY - startYRef.current;
            deltaYRef.current = delta;

            if (delta > threshold) {
                setPulling(true);

                if (!hasTriggeredHaptic.current) {
                    triggerHaptic();
                    hasTriggeredHaptic.current = true;
                }
            } else {
                setPulling(false);
                hasTriggeredHaptic.current = false;
            }
        };

        const handleTouchEnd = () => {
            if (deltaYRef.current > threshold && canTrigger()) {
                triggerRefresh();
            }
            startYRef.current = null;
            deltaYRef.current = 0;
            setPulling(false);
            hasTriggeredHaptic.current = false;
        };

        const handleWheel = (e: WheelEvent) => {
            if (wrapper.scrollTop === 0 && e.deltaY < -threshold) {
                triggerRefresh();
            }
        };

        wrapper.addEventListener('touchstart', handleTouchStart, { passive: true });
        wrapper.addEventListener('touchmove', handleTouchMove, { passive: true });
        wrapper.addEventListener('touchend', handleTouchEnd);
        wrapper.addEventListener('wheel', handleWheel);

        return () => {
            wrapper.removeEventListener('touchstart', handleTouchStart);
            wrapper.removeEventListener('touchmove', handleTouchMove);
            wrapper.removeEventListener('touchend', handleTouchEnd);
            wrapper.removeEventListener('wheel', handleWheel);
        };
    }, [onRefresh, refreshing, debounceMs, threshold]);

    return (
        <div ref={wrapperRef} className={`overflow-y-auto h-full scrollbar-hide ${className}`}>
            <div className='sticky top-0 z-10'>{(pulling || refreshing) && <TopLoader />}</div>
            {children}
        </div>
    );
};
