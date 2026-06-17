// ui/components/sidebar/sidebar.tsx
"use client";

import {
  LayoutDashboard,
  CreditCard,
  ShoppingCart,
  LineChart,
  Settings,
  X,
  Building2,
  Package,
  FileText,
  Award,
  GraduationCap,
  Upload,
  ChevronRight,
  HelpCircle,
  LogOut,
  Shield,
  Briefcase,
  UserCheck,
  FileCheck,
  ScrollText,
  BadgeCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "~/lib/cn";
import { useState, useEffect } from "react";
import { toast } from "sonner";

// Brand Colors
const colors = {
  primary: "#16507b",
  secondary: "#2c8cba",
  accent: "#f8b400",
  light: "#f8f9fa",
  dark: "#343a40",
};

interface SidebarProps {
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  user?: {
    name?: string;
    email?: string;
    role?: string;
  };
}

interface NavItem {
  href: string;
  icon: any;
  label: string;
  badge?: number;
  badgeColor?: string;
}

// Define response type
interface CartResponse {
  success: boolean;
  cart?: {
    itemCount: number;
    items?: any[];
    total?: number;
  };
  error?: string;
}

export default function Sidebar({
  isMobileMenuOpen,
  toggleMobileMenu,
  user,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [cartItemCount, setCartItemCount] = useState(0);

  // Fetch cart count
  const fetchCartCount = async () => {
    try {
      const response = await fetch("/api/artisan/cart");
      const data = (await response.json()) as CartResponse;
      if (data.success) {
        setCartItemCount(data.cart?.itemCount || 0);
      }
    } catch (error) {
      console.error("Failed to fetch cart count:", error);
    }
  };

  useEffect(() => {
    fetchCartCount();
    
    // Listen for cart updates
    const handleCartUpdate = () => {
      fetchCartCount();
    };
    
    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, []);

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (response.ok) {
        toast.success("Logged out successfully");
        router.push("/auth/sign-in");
      } else {
        throw new Error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  // Main Navigation
  const mainNavItems: NavItem[] = [
    {
      href: "/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
    },
  ];

  // Shopping Section
  const shoppingNavItems: NavItem[] = [
    {
      href: "/dashboard/orders",
      icon: ShoppingCart,
      label: "My Orders",
      badge: cartItemCount,
      badgeColor: "bg-primary",
    },
  ];

  // Certification Section - Your own certification journey
  const certificationNavItems: NavItem[] = [
    {
      href: "/dashboard/requirements",
      icon: FileCheck,
      label: "Document Requirements",
    },
    {
      href: "/dashboard/application",
      icon: ScrollText,
      label: "My Application",
    },
    {
      href: "/dashboard/certificate",
      icon: BadgeCheck,
      label: "My Certificate",
    },
  ];

  // Training Section - Find training providers and certification bodies
  const trainingNavItems: NavItem[] = [
    {
      href: "/dashboard/training",
      icon: GraduationCap,
      label: "Find Training",
    },
    {
      href: "/dashboard/certification-partners",
      icon: Award,
      label: "Certification Partners",
    },
  ];

  // Support Section
  const supportNavItems: NavItem[] = [
    {
      href: "/dashboard/help",
      icon: HelpCircle,
      label: "Help Center",
    },
    {
      href: "/dashboard/settings",
      icon: Settings,
      label: "Settings",
    },
  ];

  const NavLink = ({ item }: { item: NavItem }) => {
    const active = isActive(item.href);

    return (
      <Link
        href={item.href}
        onClick={() => {
          if (isMobileMenuOpen) toggleMobileMenu();
        }}
        className={cn(
          "flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors duration-200",
          "hover:bg-gray-100 dark:hover:bg-gray-800",
          active
            ? "bg-primary/10 text-primary dark:bg-primary/20"
            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50"
        )}
      >
        <div className="flex items-center space-x-3">
          <item.icon className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{item.label}</span>
        </div>
        {item.badge && item.badge > 0 && (
          <span
            className={cn(
              "ml-2 rounded-full px-2 py-0.5 text-xs font-medium text-white animate-pulse",
              item.badgeColor || "bg-primary"
            )}
          >
            {item.badge > 9 ? "9+" : item.badge}
          </span>
        )}
      </Link>
    );
  };

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
      {title}
    </div>
  );

  return (
    <>
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-80 transform flex-col border-r bg-white transition-all duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900",
          "md:relative md:translate-x-0",
          isMobileMenuOpen
            ? "translate-x-0 shadow-xl"
            : "-translate-x-full md:translate-x-0 md:shadow-none"
        )}
      >
        {/* Header with Logo */}
        <div className="flex h-16 items-center justify-center border-b px-4 dark:border-gray-800">
          <Link
            href="/dashboard"
            className="flex items-center justify-center"
            onClick={() => {
              if (isMobileMenuOpen) toggleMobileMenu();
            }}
          >
            <div className="relative h-12 w-36">
              <Image
                src="/uploads/artisanPro.png"
                alt="ArtisanPro Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Close button for mobile */}
          <button
            onClick={toggleMobileMenu}
            className="absolute right-4 rounded-md p-1 hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Profile Section */}
        {user && (
          <div className="border-b p-4 dark:border-gray-800">
            <div className="flex items-center space-x-3">
              <div 
                className="flex h-10 w-10 items-center justify-center rounded-full text-white font-medium"
                style={{ backgroundColor: colors.primary }}
              >
                <span className="text-sm font-medium">
                  {user.name?.charAt(0) || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                  {user.name || "Artisan"}
                </p>
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                  {user.role || "Artisan"}
                </p>
              </div>
              <button
                onClick={() => router.push("/dashboard/settings")}
                className="rounded-md p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Settings className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>
        )}

        {/* Navigation - All sections always visible */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          {/* Main Section */}
          <div className="mb-6">
            <SectionHeader title="Main" />
            {mainNavItems.map((item) => (
              <NavLink key={item.label} item={item} />
            ))}
          </div>

          {/* Shopping Section */}
          <div className="mb-6">
            <SectionHeader title="Shopping" />
            {shoppingNavItems.map((item) => (
              <NavLink key={item.label} item={item} />
            ))}
          </div>

          {/* Certification Section - Your own certification journey */}
          <div className="mb-6">
            <SectionHeader title="Certification" />
            {certificationNavItems.map((item) => (
              <NavLink key={item.label} item={item} />
            ))}
          </div>

          {/* Training Section - Find training providers and certification bodies */}
          <div className="mb-6">
            <SectionHeader title="Training & Partners" />
            {trainingNavItems.map((item) => (
              <NavLink key={item.label} item={item} />
            ))}
          </div>

          {/* Support Section */}
          <div className="mb-6">
            <SectionHeader title="Support" />
            {supportNavItems.map((item) => (
              <NavLink key={item.label} item={item} />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 dark:border-gray-800">
          <button
            onClick={handleLogout}
            className="flex w-full items-center space-x-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-colors duration-200 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            <span>Logout</span>
          </button>

          <div className="mt-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Verified & Secure
              </p>
            </div>
            <p className="mt-1 text-[10px] text-gray-400">
              © 2024 ArtisanPro. All rights reserved.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}