import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
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

  // Map vertical scroll to horizontal scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // If we are over the container, translate vertical scroll to horizontal
      if (e.deltaY === 0) return;

      // Prevent default vertical scroll behavior
      e.preventDefault();

      // Improve scroll speed/feel
      container.scrollLeft += e.deltaY;
    };

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <div className="relative w-full h-[calc(100vh-200px)] min-h-[500px] bg-slate-900/5 rounded-3xl border border-slate-800/50 backdrop-blur-sm overflow-hidden">
      <div
        ref={containerRef}
        className="w-full h-full overflow-x-auto overflow-y-hidden flex flex-col flex-wrap content-start p-4 gap-4 scrollbar-hide md:p-6"
        style={{ scrollBehavior: "auto" }} // 'auto' allows instant updates from wheel event without conflict
      >
        {posts.map((post, index) => (
          <motion.div
            key={`${post.pathname}-${index}`}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "0px -50px 0px 0px" }}
            transition={{ duration: 0.5, delay: (index % 5) * 0.05 }}
            className="w-[300px] md:w-[350px] shrink-0 grow basis-auto"
          >
            <PostCard
              image={getImageUrl(post.pathname)}
              alt={post.description || "Post image"}
              amountDonated={1}
              className="h-full"
            />
          </motion.div>
        ))}

        {/* Loading skeletons also flowing in the masonry */}
        {isLoading &&
          [...Array(6)].map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="w-[300px] md:w-[350px] h-[300px] shrink-0 grow basis-auto bg-slate-800/30 rounded-xl animate-pulse"
            />
          ))}

        {/* Sentinel for infinite scroll */}
        <div ref={loadMoreRef} className="w-10 h-full shrink-0" />
      </div>
    </div>
  );
}
