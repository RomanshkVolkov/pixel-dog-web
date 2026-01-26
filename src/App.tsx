import { useState, useEffect, useRef, useCallback } from 'react';
import type { Post, PaginatedResponse } from './types';
import { API_URL, getImageUrl } from './constants';

function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchPosts = useCallback(async (cursor: string | null = null) => {
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
        setPosts(prev => cursor ? [...prev, ...data.data!] : data.data!);
        setNextCursor(data.next_cursor);
        setHasMore(data.has_more);
      } else {
        setError('Failed to load posts');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [loading]);

  // Initial load
  useEffect(() => {
    fetchPosts();
  }, []);

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
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
      {/* Header */}
      <header className="sticky top-0 z-50 px-6 py-8 text-center bg-[rgba(20,27,61,0.4)] backdrop-blur-md border-b border-indigo-500/20">
        <h1 className="text-4xl md:text-5xl font-semibold mb-2 bg-linear-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          🐕 Pixel Dog Gallery
        </h1>
        <p className="text-slate-400">Discover amazing images from our community</p>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        {/* Error State */}
        {error && !posts.length && (
          <div className="text-center py-12 text-slate-400">
            <h2 className="text-2xl font-semibold mb-4 text-slate-100">Oops! Something went wrong</h2>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-fadeIn">
            {posts.map((post, index) => (
              <article 
                key={`${post.pathname}-${index}`} 
                className="group bg-[rgba(20,27,61,0.6)] rounded-2xl overflow-hidden border border-indigo-500/20 backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3),0_0_20px_rgba(99,102,241,0.3)] hover:border-indigo-500 cursor-pointer"
              >
                <div className="relative w-full pt-[100%] overflow-hidden bg-linear-to-br from-slate-800 to-slate-700">
                  <img
                    src={getImageUrl(post.pathname)}
                    alt={post.description || 'Post image'}
                    className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                {post.description && (
                  <div className="p-6">
                    <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">
                      {post.description}
                    </p>
                  </div>
                )}
              </article>
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
    </div>
  );
}

export default App;
