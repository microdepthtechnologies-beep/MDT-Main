"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/lib/cart";
import type { ReactNode } from "react";
import { SessionTimeout } from "./SessionTimeout";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>{children}</CartProvider>
      <SessionTimeout />
    </SessionProvider>
  );
}
