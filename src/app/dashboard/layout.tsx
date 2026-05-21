// app/dashboard/layout.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "~/lib/auth";
import DashboardLayoutClient from "./layout.client";
import { prisma } from "~/lib/db";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/sign-in");
  }

  // Fetch user data for sidebar/header
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      phone: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  });

  if (!user) {
    redirect("/auth/sign-in");
  }

  // Prepare user data for client components
  const userData = {
    id: user.id,
    email: user.email,
    phone: user.phone || "",
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    name: `${user.firstName} ${user.lastName}`,
  };

  return (
    <DashboardLayoutClient user={userData}>
      {children}
    </DashboardLayoutClient>
  );
}