import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function getInitials(name: string | undefined): string {
  if (!name) return "?";

  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
}

function getAvatarColor(name: string | undefined): string {
  if (!name) return "bg-gray-400";

  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-amber-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-green-500",
    "bg-emerald-500",
    "bg-teal-500",
    "bg-cyan-500",
    "bg-sky-500",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-violet-500",
    "bg-purple-500",
    "bg-fuchsia-500",
    "bg-pink-500",
    "bg-rose-500",
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

export function UserMenu() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
  };

  const menuItems = [
    { label: t("userMenu.myProfile"), icon: "person", to: "/profile" },
    { label: t("userMenu.myPosts"), icon: "photo_library", to: "/my-posts" },
    { label: t("userMenu.myDonations"), icon: "favorite", to: "/my-donations" },
  ];

  const menuActions = [
    {
      label: t("userMenu.signOut"),
      icon: "logout",
      onClick: handleLogout,
      className: "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20",
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {user.picture && !imageError ? (
          <img
            src={user.picture}
            alt={getInitials(user.name)}
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-9 h-9 rounded-full border-2 border-primary/20 object-cover"
          />
        ) : (
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm ${getAvatarColor(user.name)}`}
          >
            {getInitials(user.name)}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <p className="font-medium text-gray-900 dark:text-white truncate">
              {user.name}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {user.email}
            </p>
          </div>

          <div className="py-1">
            {menuItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 pt-1">
            {menuActions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                className={`flex items-center gap-3 w-full px-4 py-2 text-sm transition-colors ${action.className}`}
              >
                <span className="material-symbols-outlined text-lg">
                  {action.icon}
                </span>
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
