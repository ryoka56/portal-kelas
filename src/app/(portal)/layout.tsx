import { redirect } from "next/navigation";

import { PortalShell } from "@/components/portal-shell";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  if (user.role === "admin") redirect("/admin");
  if (user.is_first_login) redirect("/ganti-password");

  return <PortalShell user={user}>{children}</PortalShell>;
}
