// User related types
export interface User {
  id: string;
  email: string;
  username: string;
  walletAddress?: string;
  isVerified: boolean;
  createdAt: Date;
}

// Authentication related types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

// Comic submission related types
export interface ComicSubmission {
  id: string;
  title: string;
  publisher: string;
  issueNumber: string;
  year: number;
  condition: string;
  imageUrl: string;
  status: "pending" | "approved" | "rejected";
  submittedBy: string;
  submittedAt: Date;
}

// Component prop types
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: React.ReactNode;
}

export interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}
