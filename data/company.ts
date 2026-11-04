import type { NavItem, Platform, ProcessStep } from '../types/content';

export const contact = {
  email: 'sales@mdt.co.ke',
  phoneDisplay: '0748 489 784',
  phoneIntl: '+254748489784',
  whatsapp: 'https://wa.me/254748489784',
  address: 'Sound Plaza, 3rd Floor, Suite D6',
  addressLine2: 'Woodvale Grove, Westlands, Nairobi',
  postal: 'P.O. Box 198, Nairobi, Kenya',
  hoursWeekday: 'Monday – Friday, from 8:00 am',
  hoursSaturday: 'Saturday, 10:00 am – 2:00 pm',
  mapUrl:
  'https://www.google.com/maps/search/?api=1&query=Sound+Plaza+Woodvale+Grove+Westlands+Nairobi',
  linkedin: 'https://www.linkedin.com/company/micro-depth-technologies-limited'
};

export const mainNav: NavItem[] = [
{ label: 'About', href: '#about' },
{ label: 'Solutions', href: '#solutions', hasMenu: true },
{ label: 'Platforms', href: '#platforms' },
{ label: 'Approach', href: '#approach' },
{ label: 'Partners', href: '#partners' }];


export const platforms: Platform[] = [
{
  id: 'hq',
  name: 'MDT Group',
  domain: 'mdt.co.ke',
  href: '#top',
  role: 'Corporate HQ',
  description: 'Solutions, partnerships and enterprise engagements.'
},
{
  id: 'retail',
  name: 'MDT Retail',
  domain: 'mdtretail.co.ke',
  href: 'https://mdtretail.co.ke/',
  role: 'Shop online',
  description: 'Hardware, accessories and genuine licences, priced and in stock.'
},
{
  id: 'repairs',
  name: 'MDT Repairs',
  domain: 'mdtrepairs.co.ke',
  href: 'https://www.mdtrepairs.co.ke/',
  role: 'Book & track repairs',
  description: 'Intake, diagnostics and live job-card tracking for every device.'
}];


export const retailCategories: string[] = [
'Laptops & Desktops',
'Networking',
'Servers & Storage',
'Printers & Scanners',
'Security',
'Audio-Visual',
'Point of Sale',
'Power Solutions',
'Smart Devices',
'Telephony',
'Software & Licences'];


export const repairServices: string[] = [
'Hardware repairs',
'Software & OS',
'Data recovery',
'Upgrades',
'Maintenance',
'Diagnostics'];


export const partners: string[] = [
'NetApp',
'Infoblox',
'Veritas',
'Forcepoint',
'Imperva',
'Digiglass',
'Logitech',
'Anker',
'JBL',
'Harman Kardon'];


export const pillarsOfEngagement = [
{
  title: 'Consult',
  description:
  'Strategic IT advice that aligns every technology investment with where your business is going.'
},
{
  title: 'Supply',
  description:
  'Genuine hardware, software and licences from reputable manufacturers — specified, sourced and delivered.'
},
{
  title: 'Support',
  description:
  'Certified engineers who install, maintain and repair, so your systems keep earning their keep.'
}];


export const processSteps: ProcessStep[] = [
{
  title: 'Discover',
  description:
  'We sit with your team to understand objectives, constraints and the systems you already run.'
},
{
  title: 'Design',
  description:
  'A tailored architecture and bill of materials, scoped to your budget with no unnecessary extras.'
},
{
  title: 'Deploy',
  description:
  'Supply, installation and configuration by certified engineers, documented and handed over cleanly.'
},
{
  title: 'Support',
  description:
  'Ongoing maintenance, licence renewals and repairs through one accountable point of contact.'
}];


export const teamDisciplines: string[] = [
'Network engineers',
'System administrators',
'Cybersecurity specialists',
'Software developers',
'Cloud practitioners',
'Hardware technicians'];