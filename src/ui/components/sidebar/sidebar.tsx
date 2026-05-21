// ui/components/sidebar/sidebar.tsx
"use client";

import {
  LayoutDashboard,
  Users,
  CreditCard,
  ShoppingCart,
  LineChart,
  Settings,
  X,
  Building2,
  Bookmark,
  Package,
  FileText,
  Award,
  GraduationCap,
  Upload,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  LogOut,
  Bell,
  Shield,
  Star,
  TrendingUp,
  Calendar,
  Briefcase,
  MessageSquare,
  PieChart,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "~/lib/cn";
import { useState } from "react";
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
  children?: NavItem[];
}

export default function Sidebar({
  isMobileMenuOpen,
  toggleMobileMenu,
  user,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    certification: true,
    business: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

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

  const primaryNavItems: NavItem[] = [
    {
      href: "/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
    },
  ];

  const certificationNavItems: NavItem[] = [
    {
      href: "/dashboard/profile",
      icon: Building2,
      label: "My Profile",
    },
    {
      href: "/dashboard/services",
      icon: Briefcase,
      label: "My Services",
    },
    {
      href: "/dashboard/requirements",
      icon: Upload,
      label: "Document Requirements",
      badge: 3,
      badgeColor: "bg-red-500",
    },
    {
      href: "/dashboard/application",
      icon: FileText,
      label: "My Application",
    },
    {
      href: "/dashboard/certificate",
      icon: Award,
      label: "My Certificate",
    },
  ];

  const trainingNavItems: NavItem[] = [
    {
      href: "/dashboard/training",
      icon: GraduationCap,
      label: "Find Training",
    },
  
  ];

  const businessNavItems: NavItem[] = [
    {
      href: "/dashboard/payments",
      icon: CreditCard,
      label: "Payments",
    },
    {
      href: "/dashboard/subscription",
      icon: LineChart,
      label: "Subscription",
    },
  ];

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

  const NavLink = ({ item, depth = 0 }: { item: NavItem; depth?: number }) => {
    const active = isActive(item.href);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSections[item.label];

    if (hasChildren) {
      return (
        <div>
          <button
            onClick={() => toggleSection(item.label)}
            className={cn(
              "w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors duration-200",
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
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          {isExpanded && (
            <div className="ml-6 mt-1 space-y-1">
              {item.children?.map((child) => (
                <NavLink key={child.label} item={child} depth={depth + 1} />
              ))}
            </div>
          )}
        </div>
      );
    }

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
            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50",
          depth > 0 && "pl-9"
        )}
      >
        <div className="flex items-center space-x-3">
          <item.icon className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{item.label}</span>
        </div>
        {item.badge && (
          <span
            className={cn(
              "ml-2 rounded-full px-2 py-0.5 text-xs font-medium text-white",
              item.badgeColor || "bg-primary"
            )}
          >
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

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
        {/* Header with Logo only */}
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
              {/* Profile Icon - Using brand blue color */}
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

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          {/* Primary Navigation */}
          <div className="mb-6">
            <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Main
            </div>
            {primaryNavItems.map((item) => (
              <NavLink key={item.label} item={item} />
            ))}
          </div>

          {/* Certification Section */}
          <div className="mb-6">
            <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Certification
            </div>
            {certificationNavItems.map((item) => (
              <NavLink key={item.label} item={item} />
            ))}
          </div>

          {/* Training Section */}
          <div className="mb-6">
            <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Training
            </div>
            {trainingNavItems.map((item) => (
              <NavLink key={item.label} item={item} />
            ))}
          </div>

          {/* Business Section */}
          <div className="mb-6">
            <button
              onClick={() => toggleSection("business")}
              className="mb-2 flex w-full items-center justify-between px-3 text-xs font-semibold uppercase tracking-wider text-gray-400"
            >
              <span>Business</span>
              {expandedSections.business ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
            {expandedSections.business && (
              <div className="space-y-1">
                {businessNavItems.map((item) => (
                  <NavLink key={item.label} item={item} />
                ))}
              </div>
            )}
          </div>

          {/* Support Section */}
          <div className="mb-6">
            <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Support
            </div>
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