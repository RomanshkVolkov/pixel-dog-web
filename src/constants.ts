export const API_URL = "http://localhost:8080";
export const AUTH_API_URL = "http://localhost:8082";
export const PAYMENT_API_URL = "http://localhost:8081";
export const IMAGE_URL = "https://izeus20.blob.core.windows.net/pixel-dog";

export const getImageUrl = (pathname: string): string => {
  return `${IMAGE_URL}${pathname.replace(".jpg", ".webp")}`;
};
