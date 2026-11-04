export type SolutionIconKey =
'network' |
'security' |
'hardware' |
'software' |
'av' |
'support';

export type Solution = {
  id: string;
  icon: SolutionIconKey;
  title: string;
  tagline: string;
  description: string;
  capabilities: string[];
  image: string;
  imageAlt: string;
  link: {label: string;href: string;};
};

export type Platform = {
  id: string;
  name: string;
  domain: string;
  href: string;
  role: string;
  description: string;
};

export type ProcessStep = {
  title: string;
  description: string;
};

export type NavItem = {
  label: string;
  href: string;
  hasMenu?: boolean;
};