"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Save,
  User,
  Mail,
  Phone,
  Settings as SettingsIcon,
  Bell,
  Shield,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Building,
  Link as LinkIcon,
  Menu,
  X,
} from "lucide-react";
import Sidebar from "~/ui/components/sidebar/sidebar";
import { Button } from "~/ui/primitives/button";

interface UserData {
  id: string;
  name: string;
  phone: string;
  email: string;
  bussiness: string;
  link: string;
  mplink: string;
  bussinessId: string;
  type: string;
  address: string;
}

interface SettingsPageProps {
  user: any;
}

export default function SettingsPage1({ user }: SettingsPageProps) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  // Notification settings
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    marketing: false,
  });

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/user?phone=${encodeURIComponent(user.phone)}`,
        );
        if (response.ok) {
          const data = await response.json();
          const normalizedData = normalizeUserData(data);
          setUserData(normalizedData);
          setFormData((prev) => ({
            ...prev,
            name: normalizedData.name || "",
            email: normalizedData.email || "",
            phone: normalizedData.phone || "",
          }));
        } else {
          throw new Error("Failed to fetch user data");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load user data",
        );
        toast.error("Failed to load user data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user.phone]);

  const normalizeUserData = (data: any): UserData => ({
    id: data.id || "",
    name: data.name || "",
    phone: data.phone || user.phone,
    email: data.email || "",
    bussiness: data.bussiness?.[0]?.bussines_name || "",
    link: data.bussiness?.[0]?.link || "",
    mplink: data.bussiness?.[0]?.mplink || "",
    bussinessId: data.bussiness?.[0]?.bussinesId || "",
    type: data.bussiness?.[0]?.type || "",
    address: data.bussiness?.[0]?.address || "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
    toast.success("Notification settings updated");
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: user.phone,
          updates: {
            name: formData.name,
            email: formData.email,
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      // Refresh user data
      const updatedResponse = await fetch(
        `/api/user?phone=${encodeURIComponent(user.phone)}`,
      );
      if (updatedResponse.ok) {
        const data = await updatedResponse.json();
        setUserData(normalizeUserData(data));
      }

      toast.success("Profile updated successfully!");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update profile";
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setSubmitError("New passwords do not match");
      toast.error("New passwords do not match");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: user.phone,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      if (!response.ok) throw new Error("Failed to update password");

      // Reset password fields
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

      toast.success("Password updated successfully!");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update password";
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportData = async () => {
    try {
      toast.info("Preparing your data export...");
      // Simulate export process
      setTimeout(() => {
        toast.success("Data export ready! Check your email.");
      }, 2000);
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data");
    }
  };

  const requestDataDeletion = async () => {
    if (
      !confirm(
        "Are you sure you want to request data deletion? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      toast.info("Processing your data deletion request...");
      // Simulate deletion request process
      setTimeout(() => {
        toast.success(
          "Data deletion request submitted. You will receive a confirmation email.",
        );
      }, 2000);
    } catch (error) {
      console.error("Error requesting data deletion:", error);
      toast.error("Failed to request data deletion");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900 md:flex-row dark:bg-gray-950 dark:text-gray-50">
      {/* Mobile Header */}
      <header className="flex items-center justify-between border-b bg-white p-4 md:hidden dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center space-x-2">
          <SettingsIcon className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Settings</span>
        </div>
        <button
          className="p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </header>

      {/* Sidebar */}
      <Sidebar
        isMobileMenuOpen={isMobileMenuOpen}
        toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Main Content */}
      <main className="flex-1 p-4 pb-20 md:p-6 md:pb-6">
        {/* Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <h1 className="text-2xl font-bold md:text-3xl">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Settings Content */}
        <div className="grid gap-6">
          {/* Profile Settings */}
          <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Profile Information</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Update your personal information
              </p>
            </div>

            <form onSubmit={handleProfileUpdate} className="space-y-6">
              {submitError && (
                <div className="rounded-lg bg-red-100 p-3 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  {submitError}
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
                  <label className="mb-2 block text-sm font-medium">
                    Full Name*
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      className="w-full rounded-lg border bg-white py-2 pl-10 pr-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                      required
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
                  <label className="mb-2 block text-sm font-medium">
                    Email Address*
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      className="w-full rounded-lg border bg-white py-2 pl-10 pr-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
                  <label className="mb-2 block text-sm font-medium">
                    Phone Number*
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      className="w-full rounded-lg border bg-white py-2 pl-10 pr-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                      required
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Password Settings */}
          <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Password</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Update your password
              </p>
            </div>

            <form onSubmit={handlePasswordUpdate} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Current Password*
                  </label>
                  <div className="relative">
                    <input
                      className="w-full rounded-lg border bg-white py-2 px-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                      required
                      type={showPassword ? "text" : "password"}
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      placeholder="Enter current password"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    New Password*
                  </label>
                  <div className="relative">
                    <input
                      className="w-full rounded-lg border bg-white py-2 px-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                      required
                      type={showPassword ? "text" : "password"}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      placeholder="Enter new password"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Confirm Password*
                  </label>
                  <div className="relative">
                    <input
                      className="w-full rounded-lg border bg-white py-2 px-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                      required
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showPassword"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label
                  htmlFor="showPassword"
                  className="text-sm text-gray-600 dark:text-gray-400"
                >
                  Show passwords
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </form>
          </div>

          {/* Notification Settings */}
          <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Notifications</h2>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage your notification preferences
              </p>
            </div>

            <div className="space-y-6">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">
                      {key.charAt(0).toUpperCase() + key.slice(1)} Notifications
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {key === "email" && "Receive email notifications"}
                      {key === "sms" && "Receive SMS notifications"}
                      {key === "push" && "Receive push notifications"}
                      {key === "marketing" &&
                        "Receive marketing communications"}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) =>
                        handleNotificationChange(key, e.target.checked)
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-11 h-6 rounded-full transition-colors ${
                        value ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 bg-white border rounded-full h-5 w-5 transition-transform ${
                          value ? "transform translate-x-5" : ""
                        }`}
                      ></div>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Business Information */}
          {/* {userData?.bussiness && (
            <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">
                    Business Information
                  </h2>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Your business details
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Business Name</label>
                  <p className="text-sm">{userData.bussiness}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Business Type</label>
                  <p className="text-sm">{userData.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Address</label>
                  <p className="text-sm">{userData.address}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Store Link</label>
                  <a
                    href={userData.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    <LinkIcon className="h-4 w-4" />
                    Visit Store
                  </a>
                </div>
              </div>
            </div>
          )} */}

          {/* Data Management */}
          <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Data & Privacy</h2>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage your personal data
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Export Data</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Download a copy of your personal data
                  </p>
                </div>
                <Button onClick={exportData} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Data Deletion</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Request permanent deletion of your data
                  </p>
                </div>
                <Button
                  onClick={requestDataDeletion}
                  variant="outline"
                  className="text-red-600 hover:text-red-700 dark:text-red-400"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Request Deletion
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
