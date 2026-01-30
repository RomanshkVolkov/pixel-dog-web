import { useCallback, useEffect, useRef, useState } from "react";
import Footer from "@/components/footer";
import HorizontalScrollGallery from "@/components/gallery/HorizontalScrollGallery";
import { API_URL } from "@/constants";
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

  return (
    <div className="min-h-screen w-full">
      <main className="w-full flex gap-4 py-12 px-4">
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

        {/* Horizontal Scroll Gallery */}
        {!error && (posts.length > 0 || initialLoad) && (
          <HorizontalScrollGallery posts={posts} isLoading={loading} loadMoreRef={observerTarget} />
        )}
      </main>
      <Footer />
    </div>
  );
}
