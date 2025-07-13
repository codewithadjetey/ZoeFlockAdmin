"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  // useEffect(() => {
  //   // Redirect to login page for now
  //   router.push("/auth/login");
  // }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-all duration-500">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
          <i className="fas fa-church text-2xl text-white"></i>
        </div>
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Zoe Flock Admin</h1>
        <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">Redirecting to login...</p>
      </div>
    </div>
  );
}
