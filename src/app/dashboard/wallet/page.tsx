import { getCurrentUser } from "~/lib/auth1";

import WalletActivationPage from "./page.client";
export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  // Create a complete UserData object with default values for missing properties
  const userD = {
    phone: user.phone || "",
    email: user.email || "",
  };

  return <WalletActivationPage  />;
}
