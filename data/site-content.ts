import { editorialMedia as images } from "./editorial-media";
import { solutions } from "./solutions";
import { processSteps } from "./company";

// These defaults are also the field contract for the future page editor.
// Published documents in `sitePages` override these fields without a deployment.
export const siteContent = {
  home: {
    seo: { title: "ICT Products, Solutions & IT Support in Kenya | Micro Depth Technologies", description: "Equip your business with Micro Depth Technologies. Explore ICT hardware, software licences, networking, security and IT support from our Nairobi team." },
    hero: { eyebrow: "NAIROBI ROOTS. FORWARD THINKING.", title: "Technology.\nPeople.\nPossibilities.", description: "The right technology can change everything. We bring the expertise, equipment and human support to make it happen.", image: images.hero, imageAlt: "Technology infrastructure in a data centre", primaryLabel: "Explore our services", primaryHref: "/our-services/", secondaryLabel: "Discover our products", secondaryHref: "/shop/", caption: "THE DETAILS MAKE THE DIFFERENCE.", noteTitle: "From idea to everyday.", noteText: "Consulting · Supply · Support" },
    brands: { title: "GOOD COMPANY.", subtitle: "Great technology.", items: ["HP", "Lenovo", "Cisco", "Dell", "Microsoft", "Logitech"] },
    about: { eyebrow: "01 / THE BIGGER PICTURE", title: "Your ambition.\nOur attention\nto every detail.", lead: "A capable team needs capable technology. And a partner who understands both.", description: "At Micro Depth Technologies, we connect the dots between your business and the technology that moves it forward. From equipping a single desk to building the infrastructure behind an entire organisation, we help you make the right decisions—and make them work.", pillars: ["Consult.", "Supply.", "Support."], linkLabel: "Get to know MDT", linkHref: "/about/" },
    services: { eyebrow: "02 / BUILT AROUND YOU", title: "Good technology.\nEven better together.", description: "Products are only part of the story. Put the right expertise behind them.", items: solutions },
    collections: { eyebrow: "03 / THE MDT COLLECTION", title: "Tools for what’s next.", description: "For the work you do. And the work you’re growing into.", items: [
      { eyebrow: "COMPUTING & WORKSPACES", title: "Make your\neveryday exceptional.", image: images.workspace, imageAlt: "Desktop computing workspace", href: "/product-category/pcs-desktops/", label: "Explore computing" },
      { eyebrow: "AUDIO, VISUAL & COLLABORATION", title: "Bring every\nidea closer.", image: images.collaboration, imageAlt: "A connected meeting room", href: "/product-category/audio-visual-solutions/", label: "Explore collaboration" },
    ] },
    platforms: { eyebrow: "04 / THE MDT FAMILY", title: "One MDT.\nMore ways forward.", description: "Shop, solve, repair. The right team is always within reach.", items: [
      { title: "Everyday technology.\nA few clicks away.", description: "Explore hardware, accessories and software through our dedicated retail platform.", label: "Visit MDT Retail", href: "https://mdtretail.co.ke/", domain: "mdtretail.co.ke" },
      { title: "Give your technology\na second chapter.", description: "Find specialist diagnostics, repairs, upgrades and maintenance through MDT Repairs.", label: "Visit MDT Repairs", href: "https://www.mdtrepairs.co.ke/", domain: "mdtrepairs.co.ke" },
    ] },
    approach: { eyebrow: "05 / HOW WE MAKE IT HAPPEN", title: "A clear path.\nFrom “what if” to “it works”.", steps: processSteps },
    journal: { eyebrow: "06 / THE MDT JOURNAL", title: "A little insight.\nA better next move.", description: "Ideas, industry developments and projects from the world of business technology." },
    contact: { eyebrow: "07 / YOUR NEXT CHAPTER", title: "Let’s make\ngood things\nhappen.", description: "Tell us what you’re working towards. We’ll help you get there." },
  },
  about: {
    seo: { title: "About Micro Depth Technologies | Your ICT Partner in Kenya", description: "Meet Micro Depth Technologies, a Nairobi ICT company connecting businesses with the right hardware, software, infrastructure and ongoing technical support." },
    hero: { eyebrow: "ABOUT MICRO DEPTH TECHNOLOGIES", title: "The whole picture.\nEvery little detail.", description: "Technology works best when the people behind it understand your business. That’s where we come in.", image: images.workspace, imageAlt: "A workspace equipped for everyday business", note: "CONSULT. SUPPLY. SUPPORT.", primaryLabel: "Let’s work together", primaryHref: "/contact/" },
    story: { eyebrow: "01 / A PARTNER, IN DEPTH", title: "We connect technology\nto what matters.", lead: "Your people. Your operations. Your next opportunity.", paragraphs: [
      "Micro Depth Technologies Limited is an Information and Communication Technology company based in Westlands, Nairobi. We help businesses and organisations select, deploy and support the technology they depend on.",
      "Our work spans ICT hardware, network infrastructure, software licensing, security, communication systems and technical support. Bringing those disciplines together means we can look beyond an individual product to the environment it needs to work in.",
      "Whether you’re refreshing a team’s laptops, connecting multiple locations or planning an entirely new workspace, we start with a conversation—and stay involved after the equipment arrives.",
    ] },
    purpose: { title: "A clear purpose.\nA practical approach.", items: [
      { title: "Our mission", text: "To be a trusted ICT partner: connecting businesses with suitable technology, thoughtful advice and dependable support." },
      { title: "Our approach", text: "Understand the requirement, recommend the right fit and support it through its working life. Good technology decisions should make business simpler." },
    ] },
    values: { eyebrow: "02 / WHAT YOU CAN EXPECT", title: "Good work starts\nwith good principles.", items: [
      { title: "Listen first.", text: "We take time to understand your environment, priorities and constraints before recommending a solution." },
      { title: "Be clear.", text: "We explain the options, the scope and the next steps so you can make an informed decision." },
      { title: "Look deeper.", text: "Compatibility, licensing, deployment and support matter just as much as the specification on the box." },
      { title: "Stay connected.", text: "We value long-term relationships and the practical support that keeps your technology useful." },
    ] },
    expertise: { eyebrow: "03 / THE PEOPLE BEHIND THE TECHNOLOGY", title: "Different disciplines.\nOne connected team.", description: "The right answer often lives between disciplines. We bring infrastructure, systems, software and hardware knowledge into the same conversation.", image: images.network, imageAlt: "Network equipment and structured cabling", disciplines: ["Network infrastructure", "Systems administration", "Cybersecurity", "Software & cloud", "Hardware & diagnostics", "Technical support"] },
    sectors: { eyebrow: "04 / BUILT AROUND YOUR WORLD", title: "Your industry.\nYour way of working.", items: [
      { title: "Business & professional services", text: "Connected workplaces, productivity tools and dependable day-to-day IT." },
      { title: "Education", text: "Campus connectivity, computing labs and software for teaching and learning." },
      { title: "Financial services", text: "Branch networking, secure systems and technology that supports distributed teams." },
      { title: "Retail & hospitality", text: "Point-of-sale systems, guest connectivity, communication and surveillance." },
      { title: "Healthcare", text: "Networks, workstations and storage supporting information-intensive environments." },
      { title: "Public & community organisations", text: "Practical infrastructure, equipment supply and support for service delivery." },
    ] },
    cta: { eyebrow: "YOUR NEXT TECHNOLOGY PARTNER", title: "Let’s get to\nknow your business.", description: "Bring your questions, your project brief or just an idea. We’ll help you work out the next step.", label: "Start a conversation", href: "/contact/" },
  },
  services: {
    seo: { title: "ICT Services & IT Support in Kenya | Micro Depth Technologies", description: "Explore MDT’s IT support, network infrastructure, cybersecurity, software, cloud, hardware repair and maintenance services for businesses in Kenya." },
    hero: { eyebrow: "OUR SERVICES", title: "Better systems.\nFewer interruptions.", description: "The expertise behind the equipment. From planning and installation to everyday support, we help your technology work together.", image: images.network, imageAlt: "Organised cabling and business network infrastructure", note: "THINK IT THROUGH. MAKE IT WORK.", primaryLabel: "Discuss your requirements", primaryHref: "/contact/" },
    intro: { eyebrow: "01 / EXPERTISE THAT CONNECTS", title: "From the first question\nto the everyday details.", description: "Choose a focused service or bring us the bigger picture. We’ll help define a practical scope around your systems, your people and your priorities." },
    items: [
      { id: "it-support", title: "IT support & consulting", description: "Help your team keep moving with troubleshooting, systems support and informed technology advice.", image: images.repair, imageAlt: "Hands-on technical support for computer equipment", bullets: ["Helpdesk & user support", "System monitoring & maintenance", "Software & application support", "IT planning & consulting"], href: "/our-services/it-support-services/", label: "Explore IT support" },
      { id: "networks", title: "Networks & infrastructure", description: "Build the connections your business depends on, from the desk to the server room and beyond.", image: images.network, imageAlt: "Business network switches and patch cables", bullets: ["Structured cabling & fibre", "Switching, routing & Wi-Fi", "Server & storage infrastructure", "Network deployment & administration"], href: "/network-infrastructure/", label: "Explore infrastructure" },
      { id: "security", title: "Security solutions", description: "Bring together the tools and controls that help protect your data, network and premises.", image: images.security, imageAlt: "Security monitoring systems", bullets: ["Firewall & endpoint protection", "Network access & VPN", "CCTV & access control", "Backup & recovery planning"], href: "/security-solutions/", label: "Explore security" },
      { id: "software", title: "Software, cloud & licensing", description: "Choose the right tools and licences, then make them useful in your working environment.", image: images.software, imageAlt: "Software running on a professional workstation", bullets: ["Business productivity tools", "Cloud solutions & deployment", "Business application requirements", "Licence selection & renewals"], href: "/software-licenses/", label: "Explore software & licences" },
      { id: "workspaces", title: "Connected workspaces", description: "Equip workstations and meeting spaces with hardware, audio-visual systems and communication tools.", image: images.collaboration, imageAlt: "Meeting room with collaboration technology", bullets: ["ICT hardware specification & supply", "Video conferencing & displays", "Telephony & communication", "Installation & configuration"], href: "/hardware/", label: "Explore workplace technology" },
      { id: "repairs", title: "Repairs & maintenance", description: "Find the fault, restore performance and get more useful life from the equipment you already own.", image: images.repair, imageAlt: "Repairing computer hardware", bullets: ["Computers & laptops", "Printers & scanners", "Networking & storage equipment", "Preventive maintenance & upgrades"], href: "/our-services/repair-and-maintenance/", label: "Explore repairs & maintenance" },
    ],
    engagement: { eyebrow: "02 / THE RIGHT KIND OF SUPPORT", title: "One project.\nOr the long run.", items: [
      { title: "A defined project", text: "Planning a rollout, a new office or a system upgrade? We’ll help establish the requirements, scope and handover." },
      { title: "Ongoing support", text: "Discuss a support and maintenance arrangement shaped around your equipment, users and operational needs." },
      { title: "A problem to solve", text: "Something isn’t working? Tell us what’s happening so we can agree the next diagnostic or support step." },
    ] },
    process: { eyebrow: "03 / A CLEAR WAY FORWARD", title: "Considered from\nthe very beginning.", steps: processSteps },
    faqs: { title: "A few useful answers.", items: [
      { question: "Can you support equipment we already own?", answer: "Yes. Share the equipment models, current setup and issue or requirement. We’ll assess the work and confirm what support or repair is appropriate." },
      { question: "Do you handle both supply and installation?", answer: "We can scope equipment supply, installation and configuration together. Tell us about the site and your requirements so the quotation includes the work you need." },
      { question: "How do we get a service quotation?", answer: "Send your project brief or contact our team. For product-led requirements, add items to the quote cart and include installation or support needs in your request." },
      { question: "Can you help with an ongoing maintenance plan?", answer: "Contact us with your equipment list, locations and support priorities. Coverage, response arrangements and schedules are agreed as part of the scope." },
    ] },
    cta: { eyebrow: "LET’S MAKE IT WORK", title: "Your next challenge.\nOur full attention.", description: "Tell us about your systems and where you want to go. We’ll help you plan the way forward.", label: "Talk to the MDT team", href: "/contact/" },
  },
  software: {
    seo: { title: "Software & Licenses in Kenya | Micro Depth Technologies", description: "Find business software and licensing support with MDT: productivity tools, operating systems, security, cloud, ERP, CRM and licence renewals in Kenya." },
    hero: { eyebrow: "SOFTWARE & LICENSES", title: "The right tools.\nRoom to do more.", description: "Equip your people with software that fits the way they work. We help you navigate licences, applications and the details in between.", image: images.software, imageAlt: "Business software on a dual-monitor workstation", note: "CHOOSE WELL. WORK BETTER.", primaryLabel: "Find your software solution", primaryHref: "#software-solutions" },
    intro: { eyebrow: "01 / MORE THAN A LICENCE KEY", title: "Software with\na bigger purpose.", description: "The right choice depends on your users, devices, workloads and existing systems. We help clarify those requirements before recommending a licensing or deployment approach." },
    categories: [
      { id: "productivity", title: "Productivity & collaboration", text: "Microsoft Office, Microsoft 365, Google Workspace and communication tools for documents, teamwork and everyday work.", bullets: ["Office applications", "Email & team collaboration", "User and subscription requirements"] },
      { id: "operating-systems", title: "Operating systems", text: "Windows desktop and server licensing, alongside guidance on deployment and support requirements across your environment.", bullets: ["Desktop operating systems", "Server licensing", "Edition & compatibility checks"] },
      { id: "security", title: "Security & recovery", text: "Endpoint security, backup and recovery software to help protect devices and keep important information recoverable.", bullets: ["Endpoint & antivirus protection", "Backup & recovery applications", "Renewals & coverage reviews"] },
      { id: "business-applications", title: "Business applications", text: "ERP, CRM, point-of-sale and workflow software requirements shaped around your processes and your team.", bullets: ["ERP & customer management", "Payment & POS systems", "Workflow & automation needs"] },
      { id: "design-data", title: "Design, development & data", text: "Tools for creative work, software development, reporting and data analysis—matched to the workloads that matter.", bullets: ["Design & development applications", "Data analytics & reporting", "Specialist user requirements"] },
      { id: "cloud", title: "Cloud & communications", text: "Cloud services and communication software that support connected teams, applications and information.", bullets: ["Cloud computing requirements", "Voice & communication software", "Deployment & integration planning"] },
    ],
    products: { eyebrow: "02 / SOFTWARE FOR YOUR BUSINESS", title: "Find your next\nessential tool.", description: "Explore available software, add it to your quote request and let our team confirm the right edition and licensing terms.", categorySlugs: ["software-licenses", "software-products", "software-and-licenses", "software-licences"], productIds: [0], emptyTitle: "Tell us what you need to run.", emptyText: "Looking for a particular application or renewal? Share the product, edition, number of users or devices, and your current setup. We’ll help identify the right licence.", emptyLabel: "Ask about software", emptyHref: "/contact/?interest=Software%20%26%20Licences" },
    checklist: { eyebrow: "03 / THE DETAILS MAKE THE DIFFERENCE", title: "A better brief.\nA better fit.", description: "A few details help us prepare a useful recommendation and quotation.", items: [
      { title: "Your people & devices", text: "How many users, computers or servers need the software? Include shared devices and remote users." },
      { title: "Your current setup", text: "Tell us about existing subscriptions, editions, systems and the software you need to integrate with." },
      { title: "Your next milestone", text: "A new deployment, an expansion or a renewal? Include the required date and the support you need." },
    ] },
    faqs: { title: "Licensing, made clearer.", items: [
      { question: "Can you help us choose the right edition?", answer: "Yes. Share the applications, features, users and devices you need to cover. We’ll help compare suitable options and confirm the details in your quotation." },
      { question: "Can you assist with renewals?", answer: "Tell us the product, subscription or licence type, current quantities and renewal date. Our team will confirm the available renewal or replacement options." },
      { question: "Does a licence include installation and support?", answer: "Entitlements vary by product and agreement. Installation, migration and ongoing support can be discussed separately and included in the agreed scope where required." },
      { question: "Where can I see software prices?", answer: "MDT provides quotations directly. Request the software and quantities you need, and our team will confirm availability, licensing terms and pricing with you." },
    ] },
    cta: { eyebrow: "LET’S FIND THE RIGHT FIT", title: "Good software.\nBetter possibilities.", description: "From a single licence to a business-wide deployment, start with a conversation about what you need.", label: "Discuss software & licensing", href: "/contact/?interest=Software%20%26%20Licences" },
  },
  blog: {
    seo: { title: "Technology Insights & Projects | MDT Blog", description: "Explore technology insights, Kenyan ICT developments and business infrastructure projects from Micro Depth Technologies." },
    hero: { eyebrow: "THE MDT JOURNAL", title: "Ideas for\nwhat comes next.", description: "A closer look at technology, the businesses it enables and the possibilities ahead." },
    cta: { eyebrow: "TURN IDEAS INTO ACTION", title: "What’s next\nfor your business?", description: "If something here starts a conversation, we’d like to be part of it.", label: "Talk to MDT", href: "/contact/" },
  },
  contact: {
    seo: { title: "Contact Micro Depth Technologies | Nairobi, Kenya", description: "Talk to MDT about ICT products, software licensing, infrastructure and IT support. Visit our Westlands, Nairobi office or send your project requirements." },
    eyebrow: "LET’S START A CONVERSATION",
    title: "Your next move.\nLet’s make it happen.",
    description: "A project brief, a product question or a challenge to work through. Tell us what you have in mind.",
    officeTitle: "Find us in Westlands.",
    officeText: "Planning a visit? Call our team first so we can help you make the most of your time.",
  },
};

export type SitePageKey = keyof typeof siteContent;
export const sitePaths: Record<SitePageKey, string> = { home: "/", about: "/about/", services: "/our-services/", software: "/software-licenses/", blog: "/blog/", contact: "/contact/" };
