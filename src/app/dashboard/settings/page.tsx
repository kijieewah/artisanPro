// app/dashboard/settings/page.tsx
import { getCurrentUser } from "~/lib/auth1";
import { prisma } from "~/lib/db";
import { redirect } from "next/navigation";
import SettingsClient from "./page.client";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user || !user.id) {
    redirect("/auth/sign-in");
  }

  // Fetch complete user data
  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      artisanProfile: {
        include: {
          state: true,
          localGovernment: true,
        },
      },
      sessions: {
        where: { isRevoked: false },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!userData) {
    redirect("/auth/sign-in");
  }

  // Fetch notification settings
  const notificationSettings = await prisma.systemSetting.findFirst({
    where: { key: "notification_settings_" + user.id },
  });

  // Fetch API keys
  const apiKeys = await prisma.apiKey.findMany({
    where: { userId: user.id, isActive: true },
    orderBy: { createdAt: "desc" },
  });

  // Build user profile with proper null/undefined handling
  const userProfile = {
    id: userData.id,
    email: userData.email || "",
    phone: userData.phone || "",
    firstName: userData.firstName || "",
    lastName: userData.lastName || "",
    role: userData.role,
    isEmailVerified: userData.isEmailVerified || false,
    isPhoneVerified: userData.isPhoneVerified || false,
    createdAt: userData.createdAt,
    lastLoginAt: userData.lastLoginAt || null,
    artisanProfile: userData.artisanProfile
      ? {
          id: userData.artisanProfile.id,
          gender: userData.artisanProfile.gender || null,
          dateOfBirth: userData.artisanProfile.dateOfBirth || null,
          address: userData.artisanProfile.address || null,
          state: userData.artisanProfile.state?.name || null,
          localGovernment: userData.artisanProfile.localGovernment?.name || null,
          yearsOfExperience: userData.artisanProfile.yearsOfExperience || null,
          bio: userData.artisanProfile.bio || null,
          skills: userData.artisanProfile.skills || null,
        }
      : null,
  };

  const sessions = userData.sessions.map((session) => ({
    id: session.id,
    sessionToken: session.sessionToken,
    createdAt: session.createdAt,
    expiresAt: session.expiresAt,
    ipAddress: session.ipAddress || null,
    userAgent: session.userAgent || null,
  }));

  const userApiKeys = apiKeys.map((key) => ({
    id: key.id,
    name: key.name,
    key: key.key,
    createdAt: key.createdAt,
    expiresAt: key.expiresAt || null,
    lastUsedAt: key.lastUsedAt || null,
  }));

  return (
    <SettingsClient
      user={userProfile}
      sessions={sessions}
      apiKeys={userApiKeys}
      notificationSettings={notificationSettings?.value as any || null}
    />
  );
}