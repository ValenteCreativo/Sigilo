// Report types
export type ReportRole = "Journalist" | "Public official" | "Citizen";
export type ReportStatus = "Pending" | "Stored";

export interface Report {
  id: string;
  role: ReportRole;
  description: string;
  status: ReportStatus;
  cid?: string;
  createdAt: string;
  evidenceFileName?: string;
  // Enhanced security fields
  txHash?: string;
  virtualChainId?: string;
  encryptedHash?: string;
  zkProofId?: string;
}

// App state types
export type AppMode = "calculator" | "dashboard";

export interface AppState {
  mode: AppMode;
  pinSet: boolean;
  storedPin: string | null;
  isVerifyingPin: boolean;
  reports: Report[];
  isRoleVerified: boolean;
}

// Component prop types
export interface CalculatorProps {
  onUnlockAttempt: () => void;
}

export interface DashboardProps {
  reports: Report[];
  isRoleVerified: boolean;
  onAddReport: (report: Omit<Report, "id" | "createdAt">) => void;
  onVerifyRole: () => void;
  onLock: () => void;
}

export interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md";
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
  glow?: boolean;
}
