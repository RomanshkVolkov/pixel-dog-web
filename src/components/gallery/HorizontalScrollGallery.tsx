import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { getImageUrl } from "@/constants";
import type { Post } from "@/types";
import PostCard from "../posts/card";

interface HorizontalScrollGalleryProps {
  posts: Post[];
  isLoading?: boolean;
  loadMoreRef?: React.Ref<HTMLDivElement>;
}

export default function HorizontalScrollGallery({
  posts,
  isLoading,
  loadMoreRef,
}: HorizontalScrollGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const columns = useMemo(() => {
    const chunks = [];
    for (let i = 0; i < posts.length; i += 2) {
      chunks.push(posts.slice(i, i + 2));
    }
    return chunks;
  }, [posts]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      container.scrollLeft += e.deltaY;
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseDown = (e: MouseEvent) => {
      setIsDragging(true);
      setStartX(e.pageX - container.offsetLeft);
      setScrollLeft(container.scrollLeft);
      container.style.cursor = "grabbing";
      container.style.userSelect = "none";
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 2;
      container.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUpOrLeave = () => {
      setIsDragging(false);
      container.style.cursor = "grab";
      container.style.userSelect = "auto";
    };

    container.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUpOrLeave);
    container.addEventListener("mouseleave", handleMouseUpOrLeave);

    return () => {
      container.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUpOrLeave);
      container.removeEventListener("mouseleave", handleMouseUpOrLeave);
    };
  }, [isDragging, startX, scrollLeft]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const scrollAmount = 350;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
          break;
        case "ArrowRight":
          e.preventDefault();
          container.scrollBy({ left: scrollAmount, behavior: "smooth" });
          break;
        case "Home":
          e.preventDefault();
          container.scrollTo({ left: 0, behavior: "smooth" });
          break;
        case "End":
          e.preventDefault();
          container.scrollTo({ left: container.scrollWidth, behavior: "smooth" });
          break;
      }
    };

    container.setAttribute("tabindex", "0");
    container.addEventListener("keydown", handleKeyDown);

    return () => container.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative w-full h-[calc(100vh-200px)] min-h-[500px] bg-slate-900/5 rounded-3xl border-b border-solid border-[#f3ede7] dark:border-[#2d241d] backdrop-blur-sm overflow-hidden">
      <div
        ref={containerRef}
        className="w-full h-full overflow-x-auto overflow-y-hidden flex flex-row p-4 gap-4 scrollbar-hide md:p-6 cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-slate-500/50"
        style={{ scrollBehavior: "auto" }}
      >
        {columns.map((column, colIndex) => (
          <motion.div
            key={`col-${colIndex}`}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "0px 100px 0px 0px" }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="flex flex-col gap-4 min-w-[300px] md:min-w-[350px] shrink-0 h-full snap-start"
          >
            {column.map((post, postIndex) => {
              const isSingle = column.length === 1;
              const isTop = postIndex === 0;
              const heightClass = isSingle ? "h-full" : isTop ? "h-[48%]" : "h-[48%]";

              return (
                <div
                  key={`${post.pathname}-${colIndex}-${postIndex}`}
                  className={`${heightClass} w-full relative`}
                  style={{ pointerEvents: isDragging ? "none" : "auto" }}
                >
                  <PostCard
                    image={getImageUrl(post.pathname)}
                    alt={post.description || "Post image"}
                    amountDonated={1}
                    className="h-full [&_img]:object-contain [&_img]:w-full [&_img]:h-full [&_.image-container]:bg-gradient-to-br [&_.image-container]:from-slate-900/20 [&_.image-container]:to-slate-800/10"
                  />
                </div>
              );
            })}
          </motion.div>
        ))}

        {isLoading &&
          [...Array(3)].map((_, i) => (
            <div
              key={`skeleton-col-${i}`}
              className="flex flex-col gap-4 min-w-[300px] md:min-w-[350px] shrink-0 h-full animate-pulse"
            >
              <div className="h-[48%] w-full bg-slate-800/30 rounded-xl" />
              <div className="h-[48%] w-full bg-slate-800/30 rounded-xl" />
            </div>
          ))}

        <div ref={loadMoreRef} className="w-1 h-full shrink-0" />
      </div>
    </div>
  );
}
