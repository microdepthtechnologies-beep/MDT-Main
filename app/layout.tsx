import type { Metadata } from "next";
import { Jost, Sora } from "next/font/google";
import "./globals.css";
import "./identity.css";
import "./palette.css";
import "./catalogue-controls.css";
import "./account.css";
import "./marketing.css";
import { Providers } from "@/components/Providers";

const sans = Jost({ variable: "--font-body", subsets: ["latin"], display: "swap" });
const display = Sora({ variable: "--font-display", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Micro Depth Technologies - Your Partner in Technology",
    template: "%s | MDT",
  },
  description:
    "MDT is a leading Information and Communication Technology (ICT) company that specializes in delivering innovative solutions to all businesses",
  metadataBase: new URL("https://mdt.co.ke"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <Providers><div id="main-content" className="flex-1 flex flex-col">{children}</div></Providers>
      </body>
    </html>
  );
}
