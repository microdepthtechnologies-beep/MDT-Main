import Image from "next/image";
export function Logo({ tone = "dark" }: { tone?: "light" | "dark" }) {
  return <span className={`brand-logo ${tone === "light" ? "brand-logo-light" : ""}`}>
    <Image src="/wp-content/uploads/2024/09/MDT-Logo-Red-1680px-613px.webp"
      alt="Micro Depth Technologies" width={1680} height={613} sizes="160px" className="h-auto w-full" />
  </span>;
}
