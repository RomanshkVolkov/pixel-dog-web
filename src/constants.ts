export const AUTH_API_URL = "http://localhost:8082"//  "https://pixel-dog.guz-studio.dev/api/auth-service";
export const PAYMENT_API_URL =
  "http://localhost:8081"; // "https://pixel-dog.guz-studio.dev/api/payment-service";
export const POST_API_URL = "http://localhost:8080"; // "https://pixel-dog.guz-studio.dev/api/post-service";
export const IMAGE_URL = "https://izeus20.blob.core.windows.net/pixel-dog";

export const getImageUrl = (pathname: string): string => {
  const isPost = pathname.startsWith("/posts/");
  const renamePathname = isPost ? pathname : pathname.replace(".jpg", ".webp");
  return `${IMAGE_URL}${renamePathname}`;
};
