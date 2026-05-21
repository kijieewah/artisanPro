// app/dashboard/profile/page.tsx
import { getCurrentUser } from "~/lib/auth1";
import { prisma } from "~/lib/db";
import { redirect } from "next/navigation";
// import ProfileClient from "./page.client";
import ProfileClient from "./page.client";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user || !user.id) {
    redirect("/auth/sign-in");
  }

  // Fetch user with artisan profile
  const userWithProfile = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      artisanProfile: {
        include: {
          state: true,
          localGovernment: true,
          artisanServices: {
            include: {
              service: {
                include: {
                  industry: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!userWithProfile) {
    redirect("/auth/sign-in");
  }

  // Fetch all states for dropdown
  const states = await prisma.state.findMany({
    include: {
      localGovts: true,
    },
    orderBy: { name: "asc" },
  });

  // Fetch all services for service selection
  const services = await prisma.service.findMany({
    where: { status: true },
    include: {
      industry: true,
    },
    orderBy: { name: "asc" },
  });

  const artisanProfile = userWithProfile.artisanProfile;

  const userData = {
    id: userWithProfile.id,
    email: userWithProfile.email,
    phone: userWithProfile.phone || "",
    firstName: userWithProfile.firstName,
    lastName: userWithProfile.lastName,
    role: userWithProfile.role,
  };

  const profileData = artisanProfile
    ? {
        id: artisanProfile.id,
        gender: artisanProfile.gender,
        dateOfBirth: artisanProfile.dateOfBirth,
        address: artisanProfile.address,
        city: artisanProfile.city,
        stateId: artisanProfile.stateId,
        stateName: artisanProfile.state?.name,
        localGovernmentId: artisanProfile.localGovernmentId,
        localGovernmentName: artisanProfile.localGovernment?.name,
        workingAddress: artisanProfile.workingAddress,
        yearsOfExperience: artisanProfile.yearsOfExperience,
        bio: artisanProfile.bio,
        skills: artisanProfile.skills as string[],
        verificationStatus: artisanProfile.verificationStatus,
        permitStatus: artisanProfile.permitStatus,
        approvalStatus: artisanProfile.approvalStatus,
        artisanServices: artisanProfile.artisanServices.map((as) => ({
          id: as.id,
          serviceId: as.serviceId,
          serviceName: as.service.name,
          industryName: as.service.industry?.name,
          experience: as.experience,
        })),
      }
    : null;

  return (
    <ProfileClient
      user={userData}
      profile={profileData}
      states={states}
      services={services}
    />
  );
}