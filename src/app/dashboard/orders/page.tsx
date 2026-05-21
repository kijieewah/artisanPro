import { getCurrentUser } from "~/lib/auth1";

import OrdersPage from "./page.client";

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return <OrdersPage user={user} />;
}
