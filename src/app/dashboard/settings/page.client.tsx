// app/dashboard/settings/page.client.tsx (FIXED SECTION)
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  Lock,
  Bell,
  Shield,
  Key,
  Globe,
  Moon,
  Sun,
  Monitor,
  Smartphone,
  Laptop,
  Tablet,
  Save,
  Edit2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Plus,
  LogOut,
  RefreshCw,
  Fingerprint,
  Clock,
  MapPin,
  Building2,
  Calendar,
  Briefcase,
  Award,
  ChevronRight,
  Loader2,
  ExternalLink,
  QrCode,
} from "lucide-react";

const colors = {
  primary: "#16507b",
  secondary: "#2c8cba",
  accent: "#f8b400",
  light: "#f8f9fa",
  dark: "#343a40",
};

// Define response types
interface ApiResponse {
  success?: boolean;
  error?: string;
  message?: string;
}

interface ProfileResponse extends ApiResponse {
  user?: any;
}

interface PasswordResponse extends ApiResponse {
  success?: boolean;
}

interface SessionResponse extends ApiResponse {
  success?: boolean;
}

interface ApiKeyResponse extends ApiResponse {
  apiKey?: string;
  keyInfo?: any;
}

interface UserProfile {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
  artisanProfile: {
    id: string;
    gender: string | null;
    dateOfBirth: Date | null;
    address: string | null;
    state: string | null;
    localGovernment: string | null;
    yearsOfExperience: number | null;
    bio: string | null;
    skills: any;
  } | null;
}

interface Session {
  id: string;
  sessionToken: string;
  createdAt: Date;
  expiresAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: Date;
  expiresAt: Date | null;
  lastUsedAt: Date | null;
}

interface SettingsClientProps {
  user: UserProfile;
  sessions: Session[];
  apiKeys: ApiKey[];
  notificationSettings: any;
}

export default function SettingsClient({
  user: initialUser,
  sessions: initialSessions,
  apiKeys: initialApiKeys,
  notificationSettings: initialNotificationSettings,
}: SettingsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: initialUser.firstName,
    lastName: initialUser.lastName,
    email: initialUser.email,
    phone: initialUser.phone,
    gender: initialUser.artisanProfile?.gender || "",
    dateOfBirth: initialUser.artisanProfile?.dateOfBirth 
      ? new Date(initialUser.artisanProfile.dateOfBirth).toISOString().split("T")[0]
      : "",
    address: initialUser.artisanProfile?.address || "",
    yearsOfExperience: initialUser.artisanProfile?.yearsOfExperience || 0,
    bio: initialUser.artisanProfile?.bio || "",
    skills: initialUser.artisanProfile?.skills 
      ? (Array.isArray(initialUser.artisanProfile.skills) 
          ? initialUser.artisanProfile.skills.join(", ")
          : initialUser.artisanProfile.skills)
      : "",
  });
  
  const [isEditing, setIsEditing] = useState(false);
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  // API key form state
  const [apiKeyForm, setApiKeyForm] = useState({
    name: "",
  });
  
  // Notification settings state
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    orderUpdates: true,
    certificateAlerts: true,
    courseReminders: true,
    systemAnnouncements: true,
  });
  
  // Theme preference
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  
  // Local state for sessions and API keys
  const [sessions, setSessions] = useState(initialSessions);
  const [apiKeys, setApiKeys] = useState(initialApiKeys);
  const [revokingSession, setRevokingSession] = useState<string | null>(null);
  const [deletingApiKey, setDeletingApiKey] = useState<string | null>(null);
  const [generatingApiKey, setGeneratingApiKey] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" || "light";
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (themeValue: "light" | "dark" | "system") => {
    const isDark = themeValue === "dark" || 
      (themeValue === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
    toast.success(`Theme changed to ${newTheme}`);
  };

  // Update profile
  const handleUpdateProfile = async () => {
    setIsLoading(true);
    try {
      // Fix: Properly type the skills mapping with explicit parameter type
      const skillsArray = profileForm.skills 
        ? profileForm.skills.split(",").map((s: string) => s.trim()).filter((s: string) => s !== "")
        : [];
      
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: profileForm.firstName,
          lastName: profileForm.lastName,
          phone: profileForm.phone,
          gender: profileForm.gender,
          dateOfBirth: profileForm.dateOfBirth,
          address: profileForm.address,
          yearsOfExperience: profileForm.yearsOfExperience,
          bio: profileForm.bio,
          skills: skillsArray,
        }),
      });
      
      const data = (await response.json()) as ProfileResponse;
      
      if (response.ok) {
        toast.success("Profile updated successfully");
        setIsEditing(false);
        router.refresh();
      } else {
        toast.error(data.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      
      const data = (await response.json()) as PasswordResponse;
      
      if (response.ok) {
        toast.success("Password changed successfully");
        setShowPasswordModal(false);
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast.error(data.error || "Failed to change password");
      }
    } catch (error) {
      console.error("Change password error:", error);
      toast.error("Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  // Revoke session
  const handleRevokeSession = async (sessionId: string) => {
    setRevokingSession(sessionId);
    try {
      const response = await fetch(`/api/user/sessions/${sessionId}`, {
        method: "DELETE",
      });
      
      const data = (await response.json()) as SessionResponse;
      
      if (response.ok) {
        toast.success("Session revoked successfully");
        setSessions(sessions.filter(s => s.id !== sessionId));
      } else {
        toast.error(data.error || "Failed to revoke session");
      }
    } catch (error) {
      console.error("Revoke session error:", error);
      toast.error("Failed to revoke session");
    } finally {
      setRevokingSession(null);
    }
  };

  // Revoke all other sessions
  const handleRevokeAllSessions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/sessions/revoke-all", {
        method: "POST",
      });
      
      const data = (await response.json()) as SessionResponse;
      
      if (response.ok) {
        toast.success("All other sessions revoked");
        setSessions(sessions.filter(s => s.id === sessions[0]?.id));
      } else {
        toast.error(data.error || "Failed to revoke sessions");
      }
    } catch (error) {
      console.error("Revoke all sessions error:", error);
      toast.error("Failed to revoke sessions");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate API key
  const handleGenerateApiKey = async () => {
    if (!apiKeyForm.name.trim()) {
      toast.error("Please enter a name for your API key");
      return;
    }
    
    setGeneratingApiKey(true);
    try {
      const response = await fetch("/api/user/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: apiKeyForm.name }),
      });
      
      const data = (await response.json()) as ApiKeyResponse;
      
      if (response.ok) {
        setNewApiKey(data.apiKey || null);
        if (data.keyInfo) {
          setApiKeys([data.keyInfo, ...apiKeys]);
        }
        toast.success("API key generated successfully");
        setApiKeyForm({ name: "" });
      } else {
        toast.error(data.error || "Failed to generate API key");
      }
    } catch (error) {
      console.error("Generate API key error:", error);
      toast.error("Failed to generate API key");
    } finally {
      setGeneratingApiKey(false);
    }
  };

  // Delete API key
  const handleDeleteApiKey = async (keyId: string) => {
    setDeletingApiKey(keyId);
    try {
      const response = await fetch(`/api/user/api-keys/${keyId}`, {
        method: "DELETE",
      });
      
      const data = (await response.json()) as ApiResponse;
      
      if (response.ok) {
        toast.success("API key deleted successfully");
        setApiKeys(apiKeys.filter(k => k.id !== keyId));
      } else {
        toast.error(data.error || "Failed to delete API key");
      }
    } catch (error) {
      console.error("Delete API key error:", error);
      toast.error("Failed to delete API key");
    } finally {
      setDeletingApiKey(null);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  // Update notification settings
  const handleUpdateNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/notifications/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notifications),
      });
      
      const data = (await response.json()) as ApiResponse;
      
      if (response.ok) {
        toast.success("Notification settings updated");
      } else {
        toast.error(data.error || "Failed to update settings");
      }
    } catch (error) {
      console.error("Update notifications error:", error);
      toast.error("Failed to update settings");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/delete-account", {
        method: "DELETE",
      });
      
      const data = (await response.json()) as ApiResponse;
      
      if (response.ok) {
        toast.success("Account deleted successfully");
        setTimeout(() => {
          window.location.href = "/auth/sign-in";
        }, 2000);
      } else {
        toast.error(data.error || "Failed to delete account");
      }
    } catch (error) {
      console.error("Delete account error:", error);
      toast.error("Failed to delete account");
    } finally {
      setIsLoading(false);
      setShowDeleteAccountModal(false);
    }
  };

  // Tabs configuration
  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "api", label: "API Keys", icon: Key },
    { id: "preferences", label: "Preferences", icon: Globe },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-1 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                style={activeTab === tab.id ? { borderColor: colors.primary, color: colors.primary } : {}}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold">Profile Information</h2>
                <p className="text-sm text-gray-500">Update your personal information</p>
              </div>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border hover:bg-gray-50"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 text-sm rounded-lg border hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateProfile}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg text-white hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: colors.primary }}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  />
                </div>
                {initialUser.isEmailVerified ? (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Verified
                  </p>
                ) : (
                  <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Not verified
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  />
                </div>
                {initialUser.isPhoneVerified ? (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Verified
                  </p>
                ) : (
                  <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Not verified
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  value={profileForm.gender}
                  onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                >
                  <option value="">Select gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={profileForm.dateOfBirth}
                  onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  disabled={!isEditing}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  value={profileForm.yearsOfExperience}
                  onChange={(e) => setProfileForm({ ...profileForm, yearsOfExperience: parseInt(e.target.value) || 0 })}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skills (comma separated)
                </label>
                <input
                  type="text"
                  value={profileForm.skills}
                  onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                  disabled={!isEditing}
                  placeholder="e.g., Carpentry, Welding, Plumbing"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  disabled={!isEditing}
                  rows={3}
                  placeholder="Tell us about yourself and your expertise..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Account Stats */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Account Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="font-medium">
                  {new Date(initialUser.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Login</p>
                <p className="font-medium">
                  {initialUser.lastLoginAt 
                    ? new Date(initialUser.lastLoginAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Account Role</p>
                <p className="font-medium capitalize">{initialUser.role.toLowerCase()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Sessions</p>
                <p className="font-medium">{sessions.length}</p>
              </div>
            </div>
          </div>

          {/* Delete Account */}
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Delete Account</h2>
            <p className="text-sm text-red-700 mb-4">
              Once you delete your account, there is no going back. This action is permanent and will remove all your data.
            </p>
            <button
              onClick={() => setShowDeleteAccountModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </button>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="space-y-6">
          {/* Change Password */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Change Password</h2>
                <p className="text-sm text-gray-500">Update your password to keep your account secure</p>
              </div>
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              Change Password
            </button>
          </div>

          {/* Two-Factor Authentication */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Two-Factor Authentication</h2>
                <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
              </div>
              <Fingerprint className="h-5 w-5 text-gray-400" />
            </div>
            <button
              onClick={() => setShow2FAModal(true)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              Enable 2FA
            </button>
          </div>

          {/* Active Sessions */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Active Sessions</h2>
                <p className="text-sm text-gray-500">Manage where you're logged in</p>
              </div>
              <button
                onClick={handleRevokeAllSessions}
                disabled={isLoading || sessions.length <= 1}
                className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                Revoke All
              </button>
            </div>
            <div className="space-y-3">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-full">
                      <Smartphone className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {session.userAgent?.split(" ").slice(0, 2).join(" ") || "Unknown Device"}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <span>IP: {session.ipAddress || "Unknown"}</span>
                        <span>•</span>
                        <span>Last active: {new Date(session.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  {sessions[0]?.id !== session.id && (
                    <button
                      onClick={() => handleRevokeSession(session.id)}
                      disabled={revokingSession === session.id}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      {revokingSession === session.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Revoke"
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="space-y-6">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold">Notification Preferences</h2>
                <p className="text-sm text-gray-500">Choose what notifications you want to receive</p>
              </div>
              <Bell className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, emailNotifications: !notifications.emailNotifications })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.emailNotifications ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.emailNotifications ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-gray-500">Receive push notifications in browser</p>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, pushNotifications: !notifications.pushNotifications })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.pushNotifications ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.pushNotifications ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">SMS Notifications</p>
                  <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, smsNotifications: !notifications.smsNotifications })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.smsNotifications ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.smsNotifications ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Notification Types</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Order Updates</span>
                    <button
                      onClick={() => setNotifications({ ...notifications, orderUpdates: !notifications.orderUpdates })}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        notifications.orderUpdates ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          notifications.orderUpdates ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Certificate Alerts</span>
                    <button
                      onClick={() => setNotifications({ ...notifications, certificateAlerts: !notifications.certificateAlerts })}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        notifications.certificateAlerts ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          notifications.certificateAlerts ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Course Reminders</span>
                    <button
                      onClick={() => setNotifications({ ...notifications, courseReminders: !notifications.courseReminders })}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        notifications.courseReminders ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          notifications.courseReminders ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t">
              <button
                onClick={handleUpdateNotifications}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: colors.primary }}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Keys Tab */}
      {activeTab === "api" && (
        <div className="space-y-6">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold">API Keys</h2>
                <p className="text-sm text-gray-500">Manage your API keys for external integrations</p>
              </div>
              <button
                onClick={() => setShowApiKeyModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg text-white hover:opacity-90"
                style={{ backgroundColor: colors.primary }}
              >
                <Plus className="h-4 w-4" />
                Generate API Key
              </button>
            </div>
            
            {apiKeys.length === 0 ? (
              <div className="text-center py-8">
                <Key className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No API keys generated yet</p>
                <p className="text-sm text-gray-400">Create an API key to integrate with external services</p>
              </div>
            ) : (
              <div className="space-y-3">
                {apiKeys.map((key) => (
                  <div key={key.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{key.name}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Active</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-xs text-gray-500">{key.key.substring(0, 20)}...</code>
                        <button
                          onClick={() => copyToClipboard(key.key)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                        <span>Created: {new Date(key.createdAt).toLocaleDateString()}</span>
                        {key.lastUsedAt && <span>Last used: {new Date(key.lastUsedAt).toLocaleDateString()}</span>}
                        {key.expiresAt && <span>Expires: {new Date(key.expiresAt).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteApiKey(key.id)}
                      disabled={deletingApiKey === key.id}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      {deletingApiKey === key.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === "preferences" && (
        <div className="space-y-6">
          {/* Theme Preference */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Theme Preference</h2>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => handleThemeChange("light")}
                className={`flex flex-col items-center gap-2 p-4 border rounded-lg transition-all ${
                  theme === "light" ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
                }`}
              >
                <Sun className="h-6 w-6" />
                <span className="text-sm">Light</span>
                {theme === "light" && <CheckCircle className="h-4 w-4 text-blue-500" />}
              </button>
              
              <button
                onClick={() => handleThemeChange("dark")}
                className={`flex flex-col items-center gap-2 p-4 border rounded-lg transition-all ${
                  theme === "dark" ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
                }`}
              >
                <Moon className="h-6 w-6" />
                <span className="text-sm">Dark</span>
                {theme === "dark" && <CheckCircle className="h-4 w-4 text-blue-500" />}
              </button>
              
              <button
                onClick={() => handleThemeChange("system")}
                className={`flex flex-col items-center gap-2 p-4 border rounded-lg transition-all ${
                  theme === "system" ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
                }`}
              >
                <Monitor className="h-6 w-6" />
                <span className="text-sm">System</span>
                {theme === "system" && <CheckCircle className="h-4 w-4 text-blue-500" />}
              </button>
            </div>
          </div>
          
          {/* Language Preference */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Language</h2>
            <select className="px-3 py-2 border rounded-lg w-full max-w-xs">
              <option value="en">English</option>
              <option value="ha">Hausa</option>
              <option value="ig">Igbo</option>
              <option value="yo">Yoruba</option>
            </select>
          </div>
          
          {/* Timezone */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Timezone</h2>
            <select className="px-3 py-2 border rounded-lg w-full max-w-xs">
              <option value="Africa/Lagos">West Africa Time (GMT+1)</option>
              <option value="Africa/Cairo">Eastern European Time (GMT+2)</option>
              <option value="Africa/Johannesburg">South Africa Standard Time (GMT+2)</option>
            </select>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowPasswordModal(false)}>
          <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Change Password</h3>
              <button onClick={() => setShowPasswordModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <XCircle className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                disabled={isLoading}
                className="flex-1 px-4 py-2 rounded-lg text-white hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: colors.primary }}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowApiKeyModal(false)}>
          <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Generate API Key</h3>
              <button onClick={() => setShowApiKeyModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <XCircle className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            
            {newApiKey ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800 font-medium mb-2">Your API Key has been generated!</p>
                  <code className="block bg-white p-2 rounded text-sm font-mono break-all">{newApiKey}</code>
                  <p className="text-xs text-green-700 mt-2">Save this key now. You won't be able to see it again.</p>
                </div>
                <button
                  onClick={() => {
                    copyToClipboard(newApiKey);
                    setNewApiKey(null);
                    setShowApiKeyModal(false);
                  }}
                  className="w-full px-4 py-2 rounded-lg text-white hover:opacity-90"
                  style={{ backgroundColor: colors.primary }}
                >
                  Copy and Close
                </button>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Key Name</label>
                  <input
                    type="text"
                    value={apiKeyForm.name}
                    onChange={(e) => setApiKeyForm({ name: e.target.value })}
                    placeholder="e.g., Production API, Mobile App"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowApiKeyModal(false)}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGenerateApiKey}
                    disabled={generatingApiKey}
                    className="flex-1 px-4 py-2 rounded-lg text-white hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: colors.primary }}
                  >
                    {generatingApiKey ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Generate Key"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowDeleteAccountModal(false)}>
          <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-red-600">Delete Account</h3>
              <button onClick={() => setShowDeleteAccountModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <XCircle className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-700">Are you sure you want to delete your account? This action cannot be undone.</p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">This will permanently remove:</p>
                <ul className="text-sm text-red-700 mt-2 space-y-1 list-disc list-inside">
                  <li>Your profile information</li>
                  <li>All your applications</li>
                  <li>Certificates and achievements</li>
                  <li>Course enrollments</li>
                </ul>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDeleteAccountModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}