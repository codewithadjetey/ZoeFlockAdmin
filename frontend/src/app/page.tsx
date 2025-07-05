"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    
    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/auth/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 dark:from-blue-600 dark:via-purple-700 dark:to-pink-700 transition-all duration-500">
      <div className="text-center text-white">
        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl border border-white/30">
          <i className="fas fa-church text-2xl text-white"></i>
        </div>
        <h1 className="text-2xl font-bold mb-2 text-white">Zoe Flock Admin</h1>
        <p className="text-blue-100 dark:text-blue-200 transition-colors duration-300">Loading...</p>
      </div>
    </div>
  );
}
