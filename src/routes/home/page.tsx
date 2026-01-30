import { useCallback, useEffect, useRef, useState } from "react";
import Footer from "@/components/footer";
import PostCard from "@/components/posts/card";
import { API_URL, getImageUrl } from "@/constants";
import type { PaginatedResponse, Post } from "@/types";

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchPosts = useCallback(
    async (cursor: string | null = null) => {
      if (loading) return;

      setLoading(true);
      setError(null);

      try {
        const url = cursor
          ? `${API_URL}/posts?cursor=${encodeURIComponent(cursor)}`
          : `${API_URL}/posts`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: PaginatedResponse<Post[]> = await response.json();

        if (data.success && data.data) {
          setPosts((prev) => (cursor ? [...prev, ...(data.data || [])] : data.data || []));
          setNextCursor(data.next_cursor);
          setHasMore(data.has_more);
        } else {
          setError("Failed to load posts");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching posts:", err);
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    },
    [loading]
  );

  // Initial load
  useEffect(() => {
    fetchPosts();
  }, []);

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && nextCursor) {
          fetchPosts(nextCursor);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, nextCursor, fetchPosts]);

  const SkeletonCard = () => (
    <div className="bg-[rgba(20,27,61,0.6)] rounded-2xl overflow-hidden border border-indigo-500/20 backdrop-blur-md">
      <div className="w-full pt-[100%] bg-linear-to-br from-slate-800 to-slate-700 animate-shimmer bg-size-[200%_100%]"></div>
      <div className="h-4 mx-6 my-6 bg-linear-to-r from-slate-800 to-slate-700 rounded animate-shimmer bg-size-[200%_100%]"></div>
    </div>
  );

  return (
    <div className="min-h-screen w-full">
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        {/* Error State */}
        {error && !posts.length && (
          <div className="text-center py-12 text-slate-400">
            <h2 className="text-2xl font-semibold mb-4 text-slate-100">
              Oops! Something went wrong
            </h2>
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-red-300 max-w-md mx-auto">
              {error}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!error && posts.length === 0 && !initialLoad && (
          <div className="text-center py-12 text-slate-400">
            <h2 className="text-2xl font-semibold mb-2 text-slate-100">No posts yet</h2>
            <p>Be the first to share something amazing!</p>
          </div>
        )}

        {/* Gallery Grid */}
        {posts.length > 0 && (
          <div className="masonry-grid">
            {posts.map((post, index) => (
              <PostCard
                key={`${post.pathname}-${index}`}
                image={getImageUrl(post.pathname)}
                alt={post.description || "Post image"}
                amountDonated={1}
              />
            ))}
          </div>
        )}

        {/* Initial Loading Skeletons */}
        {initialLoad && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Loading More Spinner */}
        {loading && !initialLoad && (
          <div className="flex justify-center items-center py-12">
            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Intersection Observer target */}
        <div ref={observerTarget} className="h-5" />
      </main>
      <Footer />
    </div>
  );
}
