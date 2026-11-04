"use client";
import React from "react";
import { KeyRoundIcon, LaptopIcon, NetworkIcon, ShieldCheckIcon, VideoIcon, WrenchIcon, BoxIcon } from "lucide-react";
import { SolutionIconKey } from "../types/content";
const icons: Record<SolutionIconKey, typeof BoxIcon> = {
  network: NetworkIcon,
  security: ShieldCheckIcon,
  hardware: LaptopIcon,
  software: KeyRoundIcon,
  av: VideoIcon,
  support: WrenchIcon
};
type SolutionIconProps = {
  name: SolutionIconKey;
  className?: string;
};
export function SolutionIcon({
  name,
  className = 'h-5 w-5'
}: SolutionIconProps) {
  const Icon = icons[name];
  return <Icon className={className} strokeWidth={1.6} aria-hidden="true" />;
}