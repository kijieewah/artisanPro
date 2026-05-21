import { getCurrentUser } from "~/lib/auth1";

import DocumentationPage from "./page.client";

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return <DocumentationPage user={user} />;
}
