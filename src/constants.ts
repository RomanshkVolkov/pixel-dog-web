export const API_URL = "http://localhost:8080";
export const AUTH_API_URL = "http://localhost:8082";
export const PAYMENT_API_URL = "http://localhost:8081";
export const IMAGE_URL = "https://izeus20.blob.core.windows.net/pixel-dog";

export const getImageUrl = (pathname: string): string => {
  const isPost = pathname.startsWith("/posts/");
  const renamePathname = isPost ? pathname : pathname.replace(".jpg", ".webp");
  return `${IMAGE_URL}${renamePathname}`;
};
