import type { Solution } from '../types/content';
import { editorialMedia } from './editorial-media';

export const solutions: Solution[] = [
{
  id: 'network',
  icon: 'network',
  title: 'Network Infrastructure',
  tagline: 'Connectivity built to carry a business for years.',
  description:
  'From structured cabling to core switching and enterprise wireless, we design and deploy networks that stay fast, stable and easy to manage as you grow.',
  capabilities: [
  'Switches, routers & wireless access points',
  'Structured cabling & fibre',
  'Server & data-centre networking',
  'Network monitoring & administration'],

  image: editorialMedia.network,

  imageAlt: 'Organised network switch with patch cables in a server rack',
  link: { label: 'Shop networking', href: 'https://mdtretail.co.ke/' }
},
{
  id: 'security',
  icon: 'security',
  title: 'Security Solutions',
  tagline: 'Layered protection for data, networks and premises.',
  description:
  'Firewalls, intrusion prevention, VPN appliances and surveillance — combined into one security posture that keeps threats out and your operations running.',
  capabilities: [
  'Firewalls & intrusion detection / prevention',
  'VPN appliances & encryption',
  'CCTV, surveillance & access control',
  'Antivirus & endpoint protection'],

  image: editorialMedia.security,

  imageAlt: 'Security analyst monitoring surveillance screens',
  link: { label: 'Shop security', href: 'https://mdtretail.co.ke/' }
},
{
  id: 'hardware',
  icon: 'hardware',
  title: 'ICT Hardware Supply',
  tagline: 'The right machines, specified and sourced for you.',
  description:
  'Laptops, desktops, workstations, servers, storage and peripherals from reputable manufacturers — matched to the work your people actually do.',
  capabilities: [
  'Laptops, desktops & workstations',
  'Servers, NAS & SAN storage',
  'Printers, scanners & consumables',
  'Monitors, peripherals & accessories'],

  image: editorialMedia.workspace,

  imageAlt: 'Laptop, monitor, keyboard and printer arranged on a desk',
  link: { label: 'Browse MDT Retail', href: 'https://mdtretail.co.ke/' }
},
{
  id: 'software',
  icon: 'software',
  title: 'Software & Licences',
  tagline: 'Genuine licensing and the cloud tools to match.',
  description:
  'Operating systems, productivity suites, security software and cloud services — licensed correctly, deployed properly and renewed on time.',
  capabilities: [
  'Operating systems & productivity suites',
  'Security & backup software',
  'Cloud computing services',
  'Licence management & renewals'],

  image: editorialMedia.software,

  imageAlt: 'Developer working on two monitors in a Nairobi office',
  link: { label: 'Shop software', href: 'https://mdtretail.co.ke/' }
},
{
  id: 'av',
  icon: 'av',
  title: 'Audio-Visual & Collaboration',
  tagline: 'Rooms where meetings simply work.',
  description:
  'Displays, projectors, video conferencing and sound systems for boardrooms, training spaces and multimedia setups — installed and tuned for clarity.',
  capabilities: [
  'Video conferencing systems',
  'Displays & projectors',
  'Sound & speaker systems',
  'Telephony & unified communications'],

  image: editorialMedia.collaboration,

  imageAlt: 'Boardroom meeting with a video conferencing display',
  link: { label: 'Shop audio-visual', href: 'https://mdtretail.co.ke/' }
},
{
  id: 'support',
  icon: 'support',
  title: 'IT Support & Repairs',
  tagline: 'Certified hands when something stops working.',
  description:
  'Diagnostics, hardware repair, data recovery and preventive maintenance — tracked end to end through our dedicated repair platform.',
  capabilities: [
  'Screen, keyboard & battery repairs',
  'OS installation & virus removal',
  'Data recovery for lost or corrupted files',
  'Upgrades & preventive maintenance'],

  image: editorialMedia.repair,

  imageAlt: 'Technician repairing a laptop motherboard',
  link: { label: 'Book a repair', href: 'https://www.mdtrepairs.co.ke/' }
}];