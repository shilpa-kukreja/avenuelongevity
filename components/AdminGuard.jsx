"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../app/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== "admin") {
        // If not logged in or not an admin, kick them to the admin login page
        router.push("/admin/login");
      } else {
        setIsAuthorized(true);
      }
    }
  }, [user, loading, router]);

  // Show a luxury loading screen while verifying
  if (loading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-[#080906] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-2 border-[#C9944A]/20 border-t-[#C9944A] rounded-full animate-spin mb-6" />
        <p className="text-[#C9944A] font-serif tracking-widest text-lg">Verifying Admin Access...</p>
      </div>
    );
  }

  return <>{children}</>;
}