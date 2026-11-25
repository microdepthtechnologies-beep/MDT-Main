import Image from "next/image";
export function Logo({ tone = "dark" }: { tone?: "light" | "dark" }) {
  return <span className={`brand-logo ${tone === "light" ? "brand-logo-light" : ""}`}>
    <Image src="/wp-content/uploads/2026/12/retail-logo.png"
      alt="Micro Depth Technologies" width={640} height={262} sizes="160px" className="h-auto w-full" />
  </span>;
}
