import "server-only";

import {
  createAttachmentSignedUrl,
  getSupabaseAdmin,
} from "./supabase";
import type {
  AcademicTask,
  Announcement,
  AnnouncementCategory,
  ProfileDetail,
  ProfileSummary,
  Schedule,
  StudentStatus,
  Ticket,
  TicketStatus,
} from "./types";

export const PER_PAGE = 10;
export const DIRECTORY_PER_PAGE = 12;

function sanitizeSearch(value: string) {
  return value.trim().replace(/[,()%_]/g, " ").replace(/\s+/g, " ");
}

export type PagedResult<T> = {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
};

function paged<T>(
  items: T[],
  total: number,
  page: number,
  perPage: number,
): PagedResult<T> {
  return {
    items,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

const taskSelect = `
  id, matakuliah, judul, deskripsi, deadline, status, created_at,
  task_completions(
    user_id,
    completed_at,
    profiles!task_completions_user_fkey(id,nama,nim,foto_path)
  )
`;

const announcementSelect = `
  id, judul, slug, konten, kategori, lampiran_path, is_pinned, created_at, created_by,
  profiles!announcements_created_by_fkey(nama)
`;

const ticketSelect = `
  id, ticket_code, user_id, kategori, subjek, pesan, status, balasan_admin, replied_at, created_at,
  profiles!tickets_user_fkey(nim,nama,program_studi,email,no_hp)
`;

function normalizeTask(row: Record<string, unknown>): AcademicTask {
  const completions = Array.isArray(row.task_completions)
    ? row.task_completions
    : [];

  return {
    ...(row as unknown as AcademicTask),
    task_completions: completions.map((completion) => {
      const item = completion as Record<string, unknown>;
      return {
        user_id: String(item.user_id),
        completed_at: String(item.completed_at),
        profiles: (item.profiles ?? null) as AcademicTask["task_completions"][number]["profiles"],
      };
    }),
  };
}

function normalizeAnnouncement(row: Record<string, unknown>): Announcement {
  return row as unknown as Announcement;
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
export async function countActiveStudents() {
  const { count } = await getSupabaseAdmin()
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "mahasiswa")
    .eq("status", "aktif")
    .is("deleted_at", null);
  return count ?? 0;
}

export async function countAnnouncements() {
  const { count } = await getSupabaseAdmin()
    .from("announcements")
    .select("*", { count: "exact", head: true })
    .is("deleted_at", null);
  return count ?? 0;
}

export async function countActiveTasks() {
  const { count } = await getSupabaseAdmin()
    .from("academic_tasks")
    .select("*", { count: "exact", head: true })
    .eq("status", "aktif");
  return count ?? 0;
}

export async function countPendingTickets() {
  const { count } = await getSupabaseAdmin()
    .from("tickets")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");
  return count ?? 0;
}

export async function getStudentDashboard(userId: string) {
  const supabase = getSupabaseAdmin();

  const [
    studentCount,
    announcementCount,
    taskCount,
    ticketCount,
    pinnedResult,
    latestResult,
    tasksResult,
  ] = await Promise.all([
    countActiveStudents(),
    countAnnouncements(),
    countActiveTasks(),
    supabase
      .from("tickets")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .in("status", ["pending", "diproses"]),
    supabase
      .from("announcements")
      .select(announcementSelect)
      .is("deleted_at", null)
      .eq("is_pinned", true)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("announcements")
      .select(announcementSelect)
      .is("deleted_at", null)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("academic_tasks")
      .select(taskSelect)
      .eq("status", "aktif")
      .order("deadline", { ascending: true })
      .limit(4),
  ]);

  const pinned = (pinnedResult.data ?? []).map((row) =>
    normalizeAnnouncement(row as Record<string, unknown>),
  );
  const latest = (latestResult.data ?? []).map((row) =>
    normalizeAnnouncement(row as Record<string, unknown>),
  );
  const tasks = (tasksResult.data ?? []).map((row) =>
    normalizeTask(row as Record<string, unknown>),
  );

  return {
    studentCount,
    announcementCount,
    taskCount,
    openTicketCount: ticketCount.count ?? 0,
    pinned,
    latest,
    tasks,
    completedTaskIds: tasks
      .filter((task) =>
        task.task_completions.some((item) => item.user_id === userId),
      )
      .map((task) => task.id),
  };
}

export async function getPublicLandingData() {
  const [students, announcements, activeTasks, schedules] = await Promise.all([
    countActiveStudents(),
    listAnnouncements({ page: 1 }),
    countActiveTasks(),
    listSchedules(),
  ]);

  return {
    studentCount: students,
    announcementCount: announcements.total,
    activeTaskCount: activeTasks,
    announcements: announcements.items.slice(0, 3),
    schedules: schedules.slice(0, 4),
    scheduleCount: schedules.length,
  };
}

export async function getStudentTaskProgress(userId: string) {
  const supabase = getSupabaseAdmin();

  const { data: tasks } = await supabase
    .from("academic_tasks")
    .select("id")
    .eq("status", "aktif");

  const taskIds = (tasks ?? []).map((task) => task.id as string);
  if (taskIds.length === 0) {
    return { completed: 0, total: 0, percent: 0 };
  }

  const { count } = await supabase
    .from("task_completions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .in("academic_task_id", taskIds);

  const completed = count ?? 0;
  return {
    completed,
    total: taskIds.length,
    percent: Math.round((completed / taskIds.length) * 100),
  };
}

export async function getAdminDashboard() {
  const supabase = getSupabaseAdmin();

  const [
    students,
    announcements,
    tasks,
    pendingTickets,
    latestAnnouncements,
    latestTickets,
    upcomingTasks,
  ] = await Promise.all([
    countActiveStudents(),
    countAnnouncements(),
    countActiveTasks(),
    countPendingTickets(),
    supabase
      .from("announcements")
      .select(announcementSelect)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("tickets")
      .select(ticketSelect)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("academic_tasks")
      .select(taskSelect)
      .eq("status", "aktif")
      .order("deadline", { ascending: true })
      .limit(5),
  ]);

  return {
    students,
    announcements,
    tasks,
    pendingTickets,
    latestAnnouncements: (latestAnnouncements.data ?? []).map((row) =>
      normalizeAnnouncement(row as Record<string, unknown>),
    ),
    latestTickets: (latestTickets.data ?? []) as unknown as Ticket[],
    upcomingTasks: (upcomingTasks.data ?? []).map((row) =>
      normalizeTask(row as Record<string, unknown>),
    ),
  };
}

// ---------------------------------------------------------------------------
// Direktori mahasiswa
// ---------------------------------------------------------------------------
export async function listStudents({
  q = "",
  page = 1,
}: {
  q?: string;
  page?: number;
}): Promise<PagedResult<ProfileSummary>> {
  const supabase = getSupabaseAdmin();
  const from = (page - 1) * DIRECTORY_PER_PAGE;
  const to = from + DIRECTORY_PER_PAGE - 1;
  const search = sanitizeSearch(q);

  let query = supabase
    .from("profiles")
    .select(
      "id,nim,nama,program_studi,status,email,no_hp,foto_path,is_phone_visible,is_email_visible",
      { count: "exact" },
    )
    .eq("role", "mahasiswa")
    .eq("status", "aktif")
    .is("deleted_at", null)
    .order("nama", { ascending: true })
    .range(from, to);

  if (search) {
    query = query.or(`nama.ilike.%${search}%,nim.ilike.%${search}%`);
  }

  const { data, count, error } = await query;
  if (error) {
    console.error("Gagal memuat direktori:", error.message);
    return paged([], 0, page, DIRECTORY_PER_PAGE);
  }

  return paged(
    (data ?? []) as unknown as ProfileSummary[],
    count ?? 0,
    page,
    DIRECTORY_PER_PAGE,
  );
}

export async function getStudentProfile(id: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("profiles")
    .select(
      "id,nim,nama,program_studi,status,email,no_hp,foto_path,is_phone_visible,is_email_visible",
    )
    .eq("id", id)
    .eq("role", "mahasiswa")
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    console.error("Gagal memuat profil mahasiswa:", error.message);
    return null;
  }

  return data as unknown as ProfileSummary | null;
}

// ---------------------------------------------------------------------------
// Pengumuman
// ---------------------------------------------------------------------------
export async function listAnnouncements({
  q = "",
  category,
  page = 1,
}: {
  q?: string;
  category?: AnnouncementCategory;
  page?: number;
}): Promise<PagedResult<Announcement>> {
  const supabase = getSupabaseAdmin();
  const from = (page - 1) * PER_PAGE;
  const to = from + PER_PAGE - 1;
  const search = sanitizeSearch(q);

  let query = supabase
    .from("announcements")
    .select(announcementSelect, { count: "exact" })
    .is("deleted_at", null)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (category) query = query.eq("kategori", category);
  if (search) {
    query = query.or(`judul.ilike.%${search}%,konten.ilike.%${search}%`);
  }

  const { data, count, error } = await query;
  if (error) {
    console.error("Gagal memuat pengumuman:", error.message);
    return paged([], 0, page, PER_PAGE);
  }

  return paged(
    (data ?? []).map((row) => normalizeAnnouncement(row as Record<string, unknown>)),
    count ?? 0,
    page,
    PER_PAGE,
  );
}

export async function getAnnouncementBySlug(slug: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("announcements")
    .select(announcementSelect)
    .eq("slug", slug)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("Gagal memuat pengumuman:", error.message);
    return null;
  }

  const announcement = normalizeAnnouncement(data as Record<string, unknown>);
  const attachmentUrl = await createAttachmentSignedUrl(
    announcement.lampiran_path,
  );

  return { ...announcement, attachmentUrl };
}

export async function listAdminAnnouncements({
  q = "",
  page = 1,
}: {
  q?: string;
  page?: number;
}): Promise<PagedResult<Announcement>> {
  const supabase = getSupabaseAdmin();
  const from = (page - 1) * PER_PAGE;
  const to = from + PER_PAGE - 1;
  const search = sanitizeSearch(q);

  let query = supabase
    .from("announcements")
    .select(announcementSelect, { count: "exact" })
    .is("deleted_at", null)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search) query = query.ilike("judul", `%${search}%`);

  const { data, count, error } = await query;
  if (error) {
    console.error("Gagal memuat pengumuman admin:", error.message);
    return paged([], 0, page, PER_PAGE);
  }

  return paged(
    (data ?? []).map((row) => normalizeAnnouncement(row as Record<string, unknown>)),
    count ?? 0,
    page,
    PER_PAGE,
  );
}

export async function getAnnouncementById(id: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("announcements")
    .select(announcementSelect)
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("Gagal memuat pengumuman:", error.message);
    return null;
  }

  return normalizeAnnouncement(data as Record<string, unknown>);
}

// ---------------------------------------------------------------------------
// Jadwal
// ---------------------------------------------------------------------------
export async function listSchedules(): Promise<Schedule[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("schedules")
    .select("*")
    .order("hari", { ascending: true })
    .order("jam_mulai", { ascending: true });

  if (error) {
    console.error("Gagal memuat jadwal:", error.message);
    return [];
  }

  return (data ?? []) as unknown as Schedule[];
}

export async function getSchedule(id: string) {
  const { data } = await getSupabaseAdmin()
    .from("schedules")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  return (data ?? null) as unknown as Schedule | null;
}

// ---------------------------------------------------------------------------
// Tugas
// ---------------------------------------------------------------------------
export async function listTasksForUser(userId: string) {
  const supabase = getSupabaseAdmin();
  const [tasksResult, studentsResult] = await Promise.all([
    supabase
      .from("academic_tasks")
      .select(taskSelect)
      .order("status", { ascending: true })
      .order("deadline", { ascending: true }),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "mahasiswa")
      .eq("status", "aktif")
      .is("deleted_at", null),
  ]);

  if (tasksResult.error) {
    console.error("Gagal memuat tugas:", tasksResult.error.message);
    return { tasks: [] as AcademicTask[], totalStudents: 0, completedIds: [] as string[] };
  }

  const tasks = (tasksResult.data ?? []).map((row) =>
    normalizeTask(row as Record<string, unknown>),
  );

  return {
    tasks,
    totalStudents: studentsResult.count ?? 0,
    completedIds: tasks
      .filter((task) =>
        task.task_completions.some((item) => item.user_id === userId),
      )
      .map((task) => task.id),
  };
}

export async function getTaskForUser(taskId: string, userId: string) {
  const supabase = getSupabaseAdmin();
  const [taskResult, studentsResult] = await Promise.all([
    supabase
      .from("academic_tasks")
      .select(taskSelect)
      .eq("id", taskId)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "mahasiswa")
      .eq("status", "aktif")
      .is("deleted_at", null),
  ]);

  if (taskResult.error || !taskResult.data) {
    if (taskResult.error) {
      console.error("Gagal memuat detail tugas:", taskResult.error.message);
    }
    return null;
  }

  const task = normalizeTask(taskResult.data as Record<string, unknown>);
  const currentCompleted = task.task_completions.some(
    (item) => item.user_id === userId,
  );

  return {
    task,
    totalStudents: studentsResult.count ?? 0,
    currentCompleted,
    completedStudents: task.task_completions.filter(
      (item) => item.profiles !== null,
    ),
  };
}

export async function listAdminTasks() {
  const supabase = getSupabaseAdmin();
  const [tasksResult, studentsResult] = await Promise.all([
    supabase
      .from("academic_tasks")
      .select(taskSelect)
      .order("status", { ascending: true })
      .order("deadline", { ascending: false }),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "mahasiswa")
      .eq("status", "aktif")
      .is("deleted_at", null),
  ]);

  if (tasksResult.error) {
    console.error("Gagal memuat tugas admin:", tasksResult.error.message);
    return { tasks: [] as AcademicTask[], totalStudents: 0 };
  }

  return {
    tasks: (tasksResult.data ?? []).map((row) =>
      normalizeTask(row as Record<string, unknown>),
    ),
    totalStudents: studentsResult.count ?? 0,
  };
}

export async function getAdminTask(taskId: string) {
  const supabase = getSupabaseAdmin();
  const [taskResult, studentsResult] = await Promise.all([
    supabase
      .from("academic_tasks")
      .select(taskSelect)
      .eq("id", taskId)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("id,nim,nama,program_studi,status,foto_path")
      .eq("role", "mahasiswa")
      .eq("status", "aktif")
      .is("deleted_at", null)
      .order("nama", { ascending: true }),
  ]);

  if (taskResult.error || !taskResult.data) {
    if (taskResult.error) {
      console.error("Gagal memuat detail tugas admin:", taskResult.error.message);
    }
    return null;
  }

  const task = normalizeTask(taskResult.data as Record<string, unknown>);
  const completionMap = new Map(
    task.task_completions.map((item) => [item.user_id, item.completed_at]),
  );

  const students = (
    (studentsResult.data ?? []) as unknown as ProfileSummary[]
  ).map((student) => ({
    ...student,
    completed_at: completionMap.get(student.id) ?? null,
  }));

  return { task, students };
}

export async function getTaskById(id: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("academic_tasks")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Gagal memuat tugas:", error.message);
    return null;
  }

  return (data ?? null) as unknown as AcademicTask | null;
}

// ---------------------------------------------------------------------------
// Tiket
// ---------------------------------------------------------------------------
export async function listTicketsForUser(userId: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("tickets")
    .select(ticketSelect)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Gagal memuat tiket:", error.message);
    return [];
  }

  return (data ?? []) as unknown as Ticket[];
}

export async function getTicketForUser(id: string, userId: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("tickets")
    .select(ticketSelect)
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Gagal memuat tiket:", error.message);
    return null;
  }

  return (data ?? null) as unknown as Ticket | null;
}

export async function listAdminTickets({
  status,
  page = 1,
}: {
  status?: TicketStatus;
  page?: number;
}): Promise<PagedResult<Ticket>> {
  const supabase = getSupabaseAdmin();
  const from = (page - 1) * PER_PAGE;
  const to = from + PER_PAGE - 1;

  let query = supabase
    .from("tickets")
    .select(ticketSelect, { count: "exact" })
    .order("status", { ascending: true })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status) query = query.eq("status", status);

  const { data, count, error } = await query;
  if (error) {
    console.error("Gagal memuat tiket admin:", error.message);
    return paged([], 0, page, PER_PAGE);
  }

  return paged((data ?? []) as unknown as Ticket[], count ?? 0, page, PER_PAGE);
}

export async function getAdminTicket(id: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("tickets")
    .select(ticketSelect)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Gagal memuat tiket admin:", error.message);
    return null;
  }

  return (data ?? null) as unknown as Ticket | null;
}

// ---------------------------------------------------------------------------
// Admin mahasiswa
// ---------------------------------------------------------------------------
export async function listAdminStudents({
  q = "",
  status,
  page = 1,
}: {
  q?: string;
  status?: StudentStatus;
  page?: number;
}): Promise<PagedResult<ProfileDetail>> {
  const supabase = getSupabaseAdmin();
  const from = (page - 1) * PER_PAGE;
  const to = from + PER_PAGE - 1;
  const search = sanitizeSearch(q);

  let query = supabase
    .from("profiles")
    .select(
      "id,nim,nama,program_studi,status,role,email,no_hp,foto_path,is_phone_visible,is_email_visible,is_first_login,created_at",
      { count: "exact" },
    )
    .eq("role", "mahasiswa")
    .is("deleted_at", null)
    .order("nama", { ascending: true })
    .range(from, to);

  if (status) query = query.eq("status", status);
  if (search) {
    query = query.or(`nama.ilike.%${search}%,nim.ilike.%${search}%`);
  }

  const { data, count, error } = await query;
  if (error) {
    console.error("Gagal memuat data mahasiswa:", error.message);
    return paged([], 0, page, PER_PAGE);
  }

  return paged(
    (data ?? []) as unknown as ProfileDetail[],
    count ?? 0,
    page,
    PER_PAGE,
  );
}

export async function getAdminStudent(id: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("profiles")
    .select(
      "id,nim,nama,program_studi,status,role,email,no_hp,foto_path,is_phone_visible,is_email_visible,is_first_login,created_at",
    )
    .eq("id", id)
    .eq("role", "mahasiswa")
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    console.error("Gagal memuat mahasiswa:", error.message);
    return null;
  }

  return (data ?? null) as unknown as ProfileDetail | null;
}

export async function getProfileForEdit(id: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("profiles")
    .select(
      "id,nim,nama,program_studi,status,role,email,no_hp,foto_path,is_phone_visible,is_email_visible,is_first_login,created_at",
    )
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    console.error("Gagal memuat profil:", error.message);
    return null;
  }

  return (data ?? null) as unknown as ProfileDetail | null;
}

export async function getAdminContact() {
  const { data } = await getSupabaseAdmin()
    .from("profiles")
    .select("nama,email,no_hp")
    .eq("role", "admin")
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return {
    nama: data?.nama ?? "Admin Kelas",
    email: data?.email ?? process.env.ADMIN_EMAIL ?? null,
    no_hp: data?.no_hp ?? process.env.ADMIN_WHATSAPP ?? null,
  };
}
