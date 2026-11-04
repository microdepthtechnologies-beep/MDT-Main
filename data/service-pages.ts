import { editorialMedia as images } from "./editorial-media";

type ServiceContent = { path: string; title: string; description: string; image: string; imageAlt: string; paragraphs: string[]; capabilities: { title: string; text: string }[]; catalogueHref: string };
export const servicePages: Record<string, ServiceContent> = {
  "our-services/it-support-services": {
    path: "/our-services/it-support-services/", title: "IT support services", description: "Practical IT support for the people, applications and systems that keep your business moving.", image: images.repair, imageAlt: "Technical support and computer diagnostics",
    paragraphs: ["From everyday user questions to infrastructure planning, Micro Depth Technologies helps organisations manage the technology behind their work.", "Tell us about your users, equipment, locations and support priorities. We’ll help define an appropriate scope, with clear responsibilities and agreed arrangements."],
    capabilities: [
      { title: "Helpdesk & user support", text: "Assistance with day-to-day device, connectivity and application issues, with diagnostics to identify the next step." },
      { title: "System maintenance & monitoring", text: "Review system health, updates and maintenance requirements to help keep your environment reliable." },
      { title: "Software & application support", text: "Installation, configuration, troubleshooting and guidance on the applications your team uses." },
      { title: "IT consulting & cloud", text: "Plan improvements, review infrastructure requirements and explore cloud solutions suited to your operations." },
    ], catalogueHref: "/shop/",
  },
  "our-services/repair-and-maintenance": {
    path: "/our-services/repair-and-maintenance/", title: "Repairs & maintenance", description: "Care for the technology you already own. Diagnose the issue, restore performance and plan the next step.", image: images.repair, imageAlt: "Technician working on a laptop motherboard",
    paragraphs: ["Hardware problems interrupt work. MDT provides repair and maintenance support for computers, printers, network equipment and storage systems.", "Assessment comes first. We confirm the fault, available repair options and the agreed scope before proceeding. For dedicated repair enquiries, visit MDT Repairs."],
    capabilities: [
      { title: "Computers & laptops", text: "Hardware diagnostics, component replacement, software troubleshooting and upgrades." },
      { title: "Printers & scanners", text: "Help with paper handling, print quality, mechanical faults and connectivity." },
      { title: "Networks, servers & storage", text: "Assess equipment faults, replacement requirements and the condition of critical infrastructure." },
      { title: "Preventive maintenance", text: "Equipment inspections, cleaning, component checks and maintenance planning." },
    ], catalogueHref: "https://www.mdtrepairs.co.ke/",
  },
  "network-infrastructure": {
    path: "/network-infrastructure/", title: "Network infrastructure", description: "The connections behind every productive business. Designed with your environment in mind.", image: images.network, imageAlt: "Structured network cabling and switching",
    paragraphs: ["From a single office to multiple sites, your network is the foundation for communication, applications and shared resources.", "We help plan and supply networking equipment, structured cabling and infrastructure, with installation and support scoped around your requirements."],
    capabilities: [
      { title: "Routing & switching", text: "Select equipment and configurations that suit your users, traffic and operational priorities." },
      { title: "Wireless networking", text: "Consider coverage, capacity, access management and the way users move around your premises." },
      { title: "Structured cabling & fibre", text: "Connect workspaces and equipment with a practical physical infrastructure." },
      { title: "Servers & infrastructure", text: "Bring networking, servers, storage and monitoring into one considered plan." },
    ], catalogueHref: "/shop/?category=networking-infrastructure",
  },
  "security-solutions": {
    path: "/security-solutions/", title: "Security solutions", description: "Protection that considers your devices, your network and your physical environment.", image: images.security, imageAlt: "Security monitoring and surveillance technology",
    paragraphs: ["Business security depends on several layers working together. We help you consider the equipment, software and controls that suit your environment.", "Discuss your existing setup and priorities with our team to define a practical scope for supply, configuration and ongoing support."],
    capabilities: [
      { title: "Network protection", text: "Firewalls, VPN requirements and network access controls." },
      { title: "Endpoint security", text: "Software protection and licensing requirements for computers and other endpoints." },
      { title: "CCTV & surveillance", text: "Cameras, recording equipment and monitoring requirements for your premises." },
      { title: "Access & recovery", text: "Access control and backup requirements to support a broader security plan." },
    ], catalogueHref: "/shop/?category=security-solutions",
  },
  "hardware": {
    path: "/hardware/", title: "ICT hardware solutions", description: "Equip your people with hardware that fits the work they do—and the work ahead.", image: images.workspace, imageAlt: "Business computing equipment in a workspace",
    paragraphs: ["Micro Depth Technologies supplies ICT hardware for offices, institutions and business environments.", "We help you compare specifications, consider compatibility and include installation or support requirements in your quotation."],
    capabilities: [
      { title: "Computers & workstations", text: "Laptops, desktops and specialist workstations matched to everyday and demanding workloads." },
      { title: "Servers & storage", text: "Equipment for business applications, shared information and infrastructure." },
      { title: "Peripherals & accessories", text: "Monitors, keyboards, docking and other essentials that complete a workspace." },
      { title: "Meeting & collaboration", text: "Displays, conferencing equipment and audio-visual tools for connected teams." },
    ], catalogueHref: "/shop/",
  },
  "printing-solutions": {
    path: "/printing-solutions/", title: "Printing solutions", description: "Printing and scanning equipment chosen around your documents, volumes and working environment.", image: images.workspace, imageAlt: "Office workspace with printing equipment",
    paragraphs: ["Choose printing and scanning tools with the capabilities your team actually needs.", "Tell us about colour requirements, document sizes, expected volumes, connectivity and consumables so we can prepare a suitable recommendation."],
    capabilities: [{ title: "Office printers", text: "Desktop and shared printers for your document workflows." }, { title: "Multifunction equipment", text: "Printing, scanning and copying requirements considered together." }, { title: "Scanners & consumables", text: "Document capture and supplies for compatible equipment." }, { title: "Support & maintenance", text: "Configuration, diagnostics and maintenance scoped around your devices." }], catalogueHref: "/shop/?q=printer",
  },
  "point-of-sale": {
    path: "/point-of-sale/", title: "Point of Sale solutions", description: "Bring sales, stock and customer service together with suitable POS hardware and software.", image: images.software, imageAlt: "Business software and computing tools",
    paragraphs: ["MDT helps businesses consider the hardware and software needed for point-of-sale operations.", "Share your store setup, transaction workflows, existing systems and integration requirements so we can help define the solution."],
    capabilities: [{ title: "POS terminals", text: "Computing equipment and terminals for your point of service." }, { title: "Barcode & receipt tools", text: "Scanners, receipt printers and compatible accessories." }, { title: "Sales & inventory software", text: "Software requirements for transactions, reporting and stock workflows." }, { title: "Deployment support", text: "Installation, configuration and support requirements included in the agreed scope." }], catalogueHref: "/shop/?q=barcode",
  },
  "telephone-infrastructure": {
    path: "/telephone-infrastructure/", title: "Telephone infrastructure", description: "Communication systems that connect teams, customers and locations.", image: images.collaboration, imageAlt: "Business meeting and communication environment",
    paragraphs: ["A clear communication plan considers the equipment, network and users together.", "MDT helps you define business telephony and communication requirements, from endpoints to the infrastructure supporting them."],
    capabilities: [{ title: "Business telephony", text: "Telephone equipment and systems for office communication." }, { title: "IP & voice networking", text: "Network and voice requirements assessed together." }, { title: "Unified communications", text: "Consider meetings, collaboration and communication tools across teams." }, { title: "Installation & support", text: "Deployment, configuration and support as part of an agreed scope." }], catalogueHref: "/shop/?q=telephone",
  },
  "power-solutions": {
    path: "/power-solutions/", title: "Power solutions", description: "Support your ICT equipment with power protection and backup suited to the load.", image: images.hero, imageAlt: "Equipment infrastructure in a data centre",
    paragraphs: ["Power requirements deserve attention alongside the equipment itself.", "Share the devices you need to protect, their load and your runtime expectations. Our team can help assess suitable UPS and power-related requirements."],
    capabilities: [{ title: "UPS systems", text: "Backup power equipment selected around capacity and runtime requirements." }, { title: "Power protection", text: "Consider protection and distribution requirements for connected equipment." }, { title: "Infrastructure planning", text: "Include power needs in server room and office equipment planning." }, { title: "Maintenance requirements", text: "Review the condition and service requirements of existing equipment." }], catalogueHref: "/shop/?q=UPS",
  },
  "customer-electronics": {
    path: "/customer-electronics/", title: "Consumer electronics", description: "Everyday technology for connected people, productive spaces and better experiences.", image: images.collaboration, imageAlt: "Display and collaboration technology",
    paragraphs: ["Explore personal and workplace electronics through MDT’s product catalogue.", "From display and audio requirements to connected accessories, our team can help identify options for your intended use."],
    capabilities: [{ title: "Displays & visual technology", text: "Screen and display requirements for work and shared spaces." }, { title: "Audio equipment", text: "Speakers, headsets and audio tools for communication and everyday use." }, { title: "Connected accessories", text: "Useful accessories that complement your existing devices." }, { title: "Product guidance", text: "Compare compatibility, specifications and support requirements before requesting a quote." }], catalogueHref: "/shop/",
  },
};
