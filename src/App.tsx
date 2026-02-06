import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import AuthCallback from "./routes/auth/callback";
import AuthError from "./routes/auth/error";
import DonationCancelPage from "./routes/donation/cancel";
import DonatePage from "./routes/donation/page";
import DonationSuccessPage from "./routes/donation/success";
import HomeLayout from "./routes/home/layout";
import HomePage from "./routes/home/page";
import UploadPage from "./routes/upload/page";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/donate",
        element: <DonatePage />,
      },
      {
        path: "/donation/success",
        element: <DonationSuccessPage />,
      },
      {
        path: "/donation/cancel",
        element: <DonationCancelPage />,
      },
      {
        path: "/upload",
        element: <UploadPage />,
      },
    ],
  },
  {
    path: "/auth/callback",
    element: <AuthCallback />,
  },
  {
    path: "/auth/error",
    element: <AuthError />,
  },
]);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
