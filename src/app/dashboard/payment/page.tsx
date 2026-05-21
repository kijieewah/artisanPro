// app/payment/page.tsx
import { getCurrentUser } from "~/lib/auth1";
import { prisma } from "~/lib/db";
import { redirect } from "next/navigation";
import PaymentClient from "./page.client";

interface PaymentPageProps {
  searchParams: Promise<{
    applicationId?: string;
    amount?: string;
    serviceName?: string;
  }>;
}

export default async function PaymentPage({ searchParams }: PaymentPageProps) {
  const user = await getCurrentUser();
  
  if (!user || !user.id) {
    redirect("/auth/sign-in");
  }

  const params = await searchParams;
  const { applicationId, amount, serviceName } = params;

  if (!applicationId) {
    redirect("/dashboard");
  }

  // Fetch full user details from database
  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      phone: true,
      firstName: true,
      lastName: true,
    },
  });

  if (!fullUser) {
    redirect("/auth/sign-in");
  }

  // Fetch application details
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      service: true,
      artisan: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!application) {
    redirect("/dashboard");
  }

  // Verify ownership
  if (application.artisan.userId !== user.id) {
    redirect("/dashboard");
  }

  // Check if payment already completed
  if (application.paymentStatus === "COMPLETED") {
    redirect(`/payment/success?applicationId=${applicationId}`);
  }

  const userData = {
    name: `${fullUser.firstName} ${fullUser.lastName}`,
    email: fullUser.email,
    phone: fullUser.phone,
  };

  const paymentAmount = amount ? parseInt(amount) : 5000; // Default ₦5,000

  return (
    <PaymentClient
      user={userData}
      application={application}
      amount={paymentAmount}
      serviceName={serviceName || application.service.name}
    />
  );
}