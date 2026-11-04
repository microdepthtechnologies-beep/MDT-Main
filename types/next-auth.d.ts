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
    id?: string;
    role?: UserRole;
    provider?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    provider?: string;
  }
}
