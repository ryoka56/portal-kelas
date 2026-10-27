import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { countPendingTickets } from "@/lib/data";
import { avatarPublicUrl } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();
  if (user.is_first_login) redirect("/ganti-password");

  const pendingTickets = await countPendingTickets();

  return (
    <AdminShell
      user={{ nama: user.nama, nim: user.nim }}
      avatarUrl={avatarPublicUrl(user.foto_path)}
      pendingTickets={pendingTickets}
    >
      {children}
    </AdminShell>
  );
}
