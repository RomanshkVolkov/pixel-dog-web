export const API_URL = "https://pixel-dog-posts.guz-studio.dev";
export const IMAGE_URL = "https://izeus20.blob.core.windows.net/pixel-dog";

export const getImageUrl = (pathname: string): string => {
  return `${IMAGE_URL}${pathname.replace(".jpg", ".webp")}`;
};
