export type Theme = "system" | "light" | "dark";
export type UserRole = "admin" | "manager" | "user";

export type PrayerName = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";
export type PrayerStatus = "pending" | "onTime" | "late" | "qada" | "missed";

export type NamazTrackerSettings = {
  enabled: boolean;
  calculationMethod: string;
  madhab: "shafi" | "hanafi";
  location: {
    lat: number | null;
    lng: number | null;
    label: string;
  };
};

export type PrayerLog = {
  _id?: string;
  userId: string;
  date: string; // "YYYY-MM-DD"
  month: number;
  year: number;
  fajr: PrayerStatus;
  dhuhr: PrayerStatus;
  asr: PrayerStatus;
  maghrib: PrayerStatus;
  isha: PrayerStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type User = {
  _id: string;
  fullName: string;
  email: string;
  role: UserRole;
  theme: Theme;
  notificationPreferences: {
    monthlyReport: boolean;
    overdueTasks: boolean;
    quietMode: boolean;
  };
  namazTracker: NamazTrackerSettings;
  createdAt: string;
  updatedAt: string;
};


export type AnnouncementTone = "info" | "success" | "warning";

export type AnnouncementAuthor = {
  _id: string;
  fullName: string;
  email: string;
  role: UserRole;
};

export type Announcement = {
  _id: string;
  title: string;
  message: string;
  tone: AnnouncementTone;
  active: boolean;
  createdBy: string | AnnouncementAuthor;
  updatedBy: string | AnnouncementAuthor | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateAnnouncementInput = {
  title: string;
  message: string;
  tone: AnnouncementTone;
  active?: boolean;
};

export type UpdateAnnouncementInput = Partial<CreateAnnouncementInput> & {
  active?: boolean;
};

export type Priority = "low" | "medium" | "high";
export type TaskStatus = "inbox" | "active" | "completed" | "archived";
export type RecurringType = "none" | "daily" | "weekly" | "monthly";

export type Task = {
  _id: string;
  userId: string;
  title: string;
  description: string;
  dueDate: string | null;
  priority: Priority;
  status: TaskStatus;
  recurring: boolean;
  recurringType: RecurringType;
  tags: string[];
  cycleMonth: number;
  cycleYear: number;
  archived: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Note = {
  _id: string;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  archived: boolean;
  cycleMonth: number;
  cycleYear: number;
  createdAt: string;
  updatedAt: string;
};

export type Project = {
  _id: string;
  userId: string;
  title: string;
  description: string;
  status: "planning" | "active" | "paused" | "completed" | "archived";
  progress: number;
  cycleMonth: number;
  cycleYear: number;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MonthlyReport = {
  _id: string;
  userId: string;
  month: number;
  year: number;
  type: "automatic" | "manual";
  completedTasks: number;
  pendingTasks: number;
  notesCreated: number;
  projectsCompleted: number;
  productivityScore: number;
  summaryJson: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};
