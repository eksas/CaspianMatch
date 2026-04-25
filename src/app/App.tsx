import { RouterProvider } from "react-router";
import { useEffect } from "react";
import { router } from "./routes";
import { AuthProvider } from "./lib/auth";

export default function App() {
  useEffect(() => {
    // Log app version to help debug cache issues
    console.log('🌊 Caspian App loaded - Version: 2024-04-24');
  }, []);

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
