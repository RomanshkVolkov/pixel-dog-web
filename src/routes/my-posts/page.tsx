import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { getImageUrl, POST_API_URL } from "@/constants";
import { useAuth } from "@/contexts/AuthContext";
import type { APIResponse, Post } from "@/types";

export default function MyPostsPage() {
  const { isAuthenticated, isLoading: authLoading, accessToken } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    const fetchMyPosts = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${POST_API_URL}/posts/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: APIResponse<Post[]> = await response.json();

        if (data.success && data.data) {
          setPosts(data.data);
        } else {
          setError(data.error?.message || "Failed to load posts");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t("common.error"));
      } finally {
        setLoading(false);
      }
    };

    fetchMyPosts();
  }, [authLoading, isAuthenticated, accessToken, t]);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1b140d] dark:text-white">
              {t("myPosts.title")}
            </h1>
            <p className="text-[#9a734c] dark:text-[#c0a080] mt-1">
              {t("myPosts.subtitle")}
            </p>
          </div>
          <Link
            to="/donate"
            className="flex items-center gap-2 bg-primary hover:bg-[#d97b1f] text-white px-4 py-2 rounded-full text-sm font-bold shadow-sm transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            {t("myPosts.newPost")}
          </Link>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-red-600 dark:text-red-300 mb-6">
            {error}
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="bg-white dark:bg-[#2d241d] rounded-2xl overflow-hidden shadow-sm"
              >
                <div className="aspect-square bg-gray-200 dark:bg-gray-700 animate-pulse" />
                <div className="p-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-6xl text-[#9a734c]/40 mb-4 block">
              photo_library
            </span>
            <h2 className="text-xl font-semibold text-[#1b140d] dark:text-white mb-2">
              {t("myPosts.emptyTitle")}
            </h2>
            <p className="text-[#9a734c] dark:text-[#c0a080] mb-6">
              {t("myPosts.emptySubtitle")}
            </p>
            <Link
              to="/donate"
              className="inline-flex items-center gap-2 bg-primary hover:bg-[#d97b1f] text-white px-6 py-3 rounded-full font-bold transition-all"
            >
              <span className="material-symbols-outlined">favorite</span>
              {t("common.donateAndUpload")}
            </Link>
          </div>
        )}

        {!loading && posts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white dark:bg-[#2d241d] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={getImageUrl(post.pathname)}
                    alt={post.description}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                {post.description && (
                  <div className="p-4">
                    <p className="text-sm text-[#1b140d] dark:text-white line-clamp-2">
                      {post.description}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
