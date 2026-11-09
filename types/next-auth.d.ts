import type { UserRole } from "@/lib/auth";
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: UserRole;
      provider?: string;
    };
  }
  interface User {
    passwordVersion?: number;
    id?: string;
    role?: UserRole;
    provider?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    passwordVersion?: number;
    role?: UserRole;
    provider?: string;
  }
}
