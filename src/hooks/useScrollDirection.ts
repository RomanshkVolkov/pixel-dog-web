import { useEffect, useRef, useState } from "react";

export type ScrollDirection = "vertical" | "horizontal" | null;

interface ScrollDetectionResult {
  direction: ScrollDirection;
  isNearBottom: boolean;
  isNearRight: boolean;
}

/**
 * Hook to detect scroll direction and proximity to edges
 * @param threshold - Distance from edge to trigger (in pixels)
 */
export function useScrollDirection(
  containerRef: React.RefObject<HTMLElement | null>,
  threshold = 100
): ScrollDetectionResult {
  const [direction, setDirection] = useState<ScrollDirection>(null);
  const [isNearBottom, setIsNearBottom] = useState(false);
  const [isNearRight, setIsNearRight] = useState(false);

  const lastScrollTop = useRef(0);
  const lastScrollLeft = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const currentScrollTop = container.scrollTop;
      const currentScrollLeft = container.scrollLeft;

      const deltaY = Math.abs(currentScrollTop - lastScrollTop.current);
      const deltaX = Math.abs(currentScrollLeft - lastScrollLeft.current);

      // Determine primary scroll direction based on larger delta
      if (deltaY > deltaX && deltaY > 5) {
        setDirection("vertical");
      } else if (deltaX > deltaY && deltaX > 5) {
        setDirection("horizontal");
      }

      // Check proximity to bottom edge
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      const distanceFromBottom = scrollHeight - (currentScrollTop + clientHeight);
      setIsNearBottom(distanceFromBottom < threshold);

      // Check proximity to right edge
      const scrollWidth = container.scrollWidth;
      const clientWidth = container.clientWidth;
      const distanceFromRight = scrollWidth - (currentScrollLeft + clientWidth);
      setIsNearRight(distanceFromRight < threshold);

      lastScrollTop.current = currentScrollTop;
      lastScrollLeft.current = currentScrollLeft;
    };

    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [containerRef, threshold]);

  return { direction, isNearBottom, isNearRight };
}
