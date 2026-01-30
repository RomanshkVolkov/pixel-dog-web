import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomeLayout from "./routes/home/layout";
import HomePage from "./routes/home/page";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
