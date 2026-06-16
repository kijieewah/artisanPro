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

  const userProfile = {
    id: userData.id,
    email: userData.email,
    phone: userData.phone,
    firstName: userData.firstName,
    lastName: userData.lastName,
    role: userData.role,
    isEmailVerified: userData.isEmailVerified,
    isPhoneVerified: userData.isPhoneVerified,
    createdAt: userData.createdAt,
    lastLoginAt: userData.lastLoginAt,
    artisanProfile: userData.artisanProfile
      ? {
          id: userData.artisanProfile.id,
          gender: userData.artisanProfile.gender,
          dateOfBirth: userData.artisanProfile.dateOfBirth,
          address: userData.artisanProfile.address,
          state: userData.artisanProfile.state?.name,
          localGovernment: userData.artisanProfile.localGovernment?.name,
          yearsOfExperience: userData.artisanProfile.yearsOfExperience,
          bio: userData.artisanProfile.bio,
          skills: userData.artisanProfile.skills,
        }
      : null,
  };

  const sessions = userData.sessions.map((session) => ({
    id: session.id,
    sessionToken: session.sessionToken,
    createdAt: session.createdAt,
    expiresAt: session.expiresAt,
    ipAddress: session.ipAddress,
    userAgent: session.userAgent,
  }));

  const userApiKeys = apiKeys.map((key) => ({
    id: key.id,
    name: key.name,
    key: key.key,
    createdAt: key.createdAt,
    expiresAt: key.expiresAt,
    lastUsedAt: key.lastUsedAt,
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