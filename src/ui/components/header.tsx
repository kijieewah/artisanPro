// ui/components/header.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Bell,
  Menu,
  User,
  Settings,
  LogOut,
  HelpCircle,
  ChevronDown,
  Mail,
  Phone,
  Award,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

// Brand Colors
const colors = {
  primary: "#16507b",
  secondary: "#2c8cba",
  accent: "#f8b400",
  light: "#f8f9fa",
  dark: "#343a40",
};

interface HeaderProps {
  userData: {
    name: string;
    email: string;
    phone: string;
    avatar: string | null;
  };
  notifications: Array<{
    id: string;
    text: string;
    time: string;
    read: boolean;
  }>;
  isNotificationOpen: boolean;
  setIsNotificationOpen: (open: boolean) => void;
  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;
  toggleMenu: () => void;
}

export default function Header({
  userData,
  notifications,
  isNotificationOpen,
  setIsNotificationOpen,
  isProfileOpen,
  setIsProfileOpen,
  toggleMenu,
}: HeaderProps) {
  const router = useRouter();
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsNotificationOpen, setIsProfileOpen]);

  const handleLogout = () => {
    signOut({
      redirect: true,
      callbackUrl: `${window.location.origin}/auth/sign-in`,
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm dark:bg-gray-900">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left section - Mobile menu button */}
        <button
          onClick={toggleMenu}
          className="rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Desktop placeholder for spacing */}
        <div className="hidden md:block md:w-10" />

        {/* Right section - Notifications & Profile */}
        <div className="flex items-center space-x-3">
          {/* Notifications Dropdown */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-lg border bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <div className="border-b p-3 dark:border-gray-700">
                  <h3 className="font-semibold">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No notifications</div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`border-b p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 ${
                          !notification.read ? "bg-blue-50 dark:bg-blue-900/20" : ""
                        }`}
                      >
                        <p className="text-sm">{notification.text}</p>
                        <p className="mt-1 text-xs text-gray-500">{notification.time}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="border-t p-2 dark:border-gray-700">
                  <Link
                    href="/dashboard/notifications"
                    className="block rounded-md p-2 text-center text-sm text-primary hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setIsNotificationOpen(false)}
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 rounded-md p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {/* Profile Avatar - Using brand blue color */}
              <div 
                className="flex h-8 w-8 items-center justify-center rounded-full text-white font-medium"
                style={{ backgroundColor: colors.primary }}
              >
                <span className="text-sm font-medium">{userData.name.charAt(0)}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-lg border bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <div className="border-b p-3 dark:border-gray-700">
                  <p className="font-medium">{userData.name}</p>
                  <p className="text-xs text-gray-500">{userData.email}</p>
                  <p className="mt-1 text-xs text-gray-500">{userData.phone}</p>
                </div>
                <div className="py-1">
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    My Profile
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <Link
                    href="/dashboard/help"
                    className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <HelpCircle className="h-4 w-4" />
                    Help Center
                  </Link>
                  <div className="border-t my-1 dark:border-gray-700" />
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}