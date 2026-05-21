import SettingsPage1 from "./page.client";
import { getCurrentUser } from "~/lib/auth1";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }
  return <SettingsPage1 user={user} />;
}
