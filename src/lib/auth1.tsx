import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "./auth";

interface UserDbType {
  email: string;
  id: string;
  phone: null | string;
  // Add any other user properties you need
}

export const getCurrentUser = async (): Promise<null | UserDbType> => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return null;
  }

  return {
    email: session.user.email || '',
    id: session.user.id,
    phone: session.user.phone || null,
    // Add any other properties from session.user you need
  };
};

export const getCurrentUserOrRedirect = async (
  forbiddenUrl = "/auth/sign-in",
  okUrl = "",
  ignoreForbidden = false,
): Promise<null | UserDbType> => {
  const user = await getCurrentUser();

  // If no user is found
  if (!user) {
    // Redirect to forbidden url unless explicitly ignored
    if (!ignoreForbidden) {
      redirect(forbiddenUrl);
    }
    // If ignoring forbidden, return the null user immediately
    return user;
  }

  // If user is found and an okUrl is provided, redirect there
  if (okUrl) {
    redirect(okUrl);
  }

  // If user is found and no okUrl is provided, return the user
  return user;
};