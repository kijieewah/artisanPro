// app/dashboard/layout.client.tsx
"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Header from "~/ui/components/header";
import Sidebar from "~/ui/components/sidebar/sidebar";

interface UserData {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: string;
  name: string;
}

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  user: UserData;
}

export default function DashboardLayoutClient({
  children,
  user,
}: DashboardLayoutClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prepare notifications (can be fetched from API)
  const notifications = [
    { id: "1", text: "Your document upload is pending review", time: "2 hours ago", read: false },
    { id: "2", text: "New training courses available", time: "1 day ago", read: true },
  ];

  // Prepare user data for header
  const userDataForHeader = {
    name: user.name,
    email: user.email,
    phone: user.phone,
    avatar: null,
  };

  // Prepare user data for sidebar
  const userDataForSidebar = {
    name: user.name,
    email: user.email,
    role: user.role,
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      <Header
        userData={userDataForHeader}
        notifications={notifications}
        isNotificationOpen={isNotificationOpen}
        setIsNotificationOpen={setIsNotificationOpen}
        isProfileOpen={isProfileOpen}
        setIsProfileOpen={setIsProfileOpen}
        toggleMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      <div className="flex flex-1">
        <Sidebar
          isMobileMenuOpen={isMobileMenuOpen}
          toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          user={userDataForSidebar}
        />

        <main className="flex-1 p-4 pb-24 transition-all duration-300 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}