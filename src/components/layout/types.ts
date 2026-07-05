export interface ShellUser {
  name: string;
  email: string;
  initials: string;
}

export interface ShellNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
}
