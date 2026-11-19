import nodemailer from "nodemailer";
import { appUrl } from "./app-url";
import { availabilityLabels, money, type IssuedQuotation, type SalesQuote } from "./quotation";

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "mail.mdt.co.ke",
  port: Number(process.env.SMTP_PORT || 465),
  secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : Number(process.env.SMTP_PORT || 465) === 465,
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 30000,
  auth: {
    user: process.env.SMTP_USER || "support@mdt.co.ke",
    pass: process.env.SMTP_PASS || "",
  },
});

export async function sendPasswordResetEmail(email: string, url: string) {
  const safeUrl = url.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  await transport.sendMail({
    from: `"Micro Depth Technologies" <${process.env.SMTP_USER || "support@mdt.co.ke"}>`,
    to: { address: email, name: "" },
    subject: "Reset your MDT account password",
    text: `Reset your MDT password\n\nOpen this link to choose a new password:\n${url}\n\nThis link expires in 30 minutes and can only be used once. If you did not request this, ignore this email. Your password has not changed.\n\nMicro Depth Technologies`,
    html: `<!doctype html><html><body style="margin:0;background:#f5f5f5;font-family:Arial,sans-serif;color:#252525;padding:32px 16px"><div style="max-width:540px;margin:auto;background:white;padding:36px;border-top:4px solid #df1b23;border-radius:8px"><p style="font-size:12px;letter-spacing:2px">MICRO DEPTH TECHNOLOGIES</p><h1 style="font-size:28px;margin-top:32px">Let’s get you back in.</h1><p style="line-height:1.7">We received a request to reset your MDT account password. Choose a new password using the secure link below.</p><p style="margin:30px 0"><a href="${safeUrl}" style="background:#df1b23;color:white;padding:15px 22px;border-radius:6px;text-decoration:none;display:inline-block">Reset my password</a></p><p style="font-size:14px;line-height:1.7">This link expires in <strong>30 minutes</strong> and works only once. If you did not request this, you can ignore this email. Your password has not changed.</p><p style="font-size:12px;line-height:1.7;overflow-wrap:anywhere">If the button doesn’t work, copy this link into your browser:<br><a href="${safeUrl}">${safeUrl}</a></p></div></body></html>`,
  });
}

export type QuoteEmailData = {
  quoteNumber: string;
  customerName: string;
  customerEmail: string;
  company?: string;
  phone?: string;
  message?: string;
  items: { name: string; sku?: string; configuration?: string; quantity: number }[];
};

const escapeHtml = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);
function quoteHtml(input: QuoteEmailData, recipient: "sales" | "customer") {
  const data = { ...input, customerName: escapeHtml(input.customerName), customerEmail: escapeHtml(input.customerEmail), company: escapeHtml(input.company), phone: escapeHtml(input.phone), message: escapeHtml(input.message), quoteNumber: escapeHtml(input.quoteNumber) };
  const items = data.items.map(i => `<tr><td>${escapeHtml(i.name)}</td><td>${escapeHtml(i.sku || "—")}</td><td>${escapeHtml(i.configuration || "—")}</td><td>${i.quantity}</td></tr>`).join("");
  const link = appUrl(recipient === "sales" ? `/sales/${encodeURIComponent(input.quoteNumber)}/` : `/dashboard/quotes/?q=${encodeURIComponent(input.quoteNumber)}`);
  const intro = recipient === "sales"
    ? `<p>A new quote request <strong>#${data.quoteNumber}</strong> has been submitted by ${data.customerName} (${data.customerEmail}).</p>`
    : `<p>Thank you for your quote request <strong>#${data.quoteNumber}</strong>. The MDT sales team will review your requirements and send a tailored quotation shortly.</p>`;
  return `<!doctype html><html><body style="font-family:system-ui,sans-serif;color:#222;max-width:600px;margin:0 auto;padding:24px;">
    <h2 style="color:#df1b23;">Micro Depth Technologies</h2>
    ${intro}
    <p><strong>Customer:</strong> ${data.customerName}<br/><strong>Email:</strong> ${data.customerEmail}${data.company ? `<br/><strong>Company:</strong> ${data.company}` : ""}${data.phone ? `<br/><strong>Phone:</strong> ${data.phone}` : ""}</p>
    <table width="100%" border="1" cellpadding="8" style="border-collapse:collapse;border-color:#dedede;margin:18px 0;font-size:14px;"><thead style="background:#f5f5f5;"><tr><th align="left">Product</th><th align="left">Model / SKU</th><th align="left">Configuration</th><th align="left">Qty</th></tr></thead><tbody>${items}</tbody></table>
    ${data.message ? `<p><strong>Message:</strong><br/>${data.message.replace(/\n/g, "<br/>")}</p>` : ""}
    <p style="color:#666;font-size:13px;">Prices are not listed publicly. The sales team will confirm availability and pricing.</p>
    <p><a href="${escapeHtml(link)}" style="display:inline-block;background:#df1b23;color:white;padding:14px 20px;text-decoration:none;border-radius:6px">${recipient === "sales" ? "Review & prepare quotation" : "Track your request"}</a></p>
  </body></html>`;
}

export async function sendQuoteEmails(data: QuoteEmailData) {
  const salesAddresses = (process.env.SALES_EMAIL || "sales@mdt.co.ke").split(",").map(s => s.trim()).filter(Boolean);
  if (!salesAddresses.length) salesAddresses.push("sales@mdt.co.ke");
  await transport.sendMail({
    from: `"Micro Depth Technologies" <${process.env.SMTP_USER || "support@mdt.co.ke"}>`,
    to: salesAddresses,
    subject: `New quote request #${data.quoteNumber} from ${data.customerName}`,
    html: quoteHtml(data, "sales"),
  });
  await transport.sendMail({
    from: `"Micro Depth Technologies" <${process.env.SMTP_USER || "support@mdt.co.ke"}>`,
    to: data.customerEmail,
    subject: `We received your quote request #${data.quoteNumber}`,
    html: quoteHtml(data, "customer"),
  });
}

export async function sendIssuedQuotation(request: SalesQuote, quote: IssuedQuotation) {
  const link = appUrl(`/dashboard/quotes/?q=${encodeURIComponent(request.number)}`);
  const rows = quote.lines.map((line, index) => `<tr><td style="padding:12px;border-bottom:1px solid #eee"><strong>${escapeHtml(request.items[index].name)}</strong><br><small>${escapeHtml(request.items[index].configuration)}<br>${availabilityLabels[line.availability]}${line.note ? ` · ${escapeHtml(line.note)}` : ""}</small></td><td>${line.quantity}</td><td>${line.availability === "unavailable" ? "—" : money(line.unitPrice)}</td><td>${line.availability === "unavailable" ? "—" : money(line.unitPrice * line.quantity)}</td></tr>`).join("");
  const lines = quote.lines.map((line, index) => `${request.items[index].name}: ${availabilityLabels[line.availability]}, qty ${line.quantity}, unit ${money(line.unitPrice)}, total ${money(line.unitPrice * line.quantity)}`).join("\n");
  await transport.sendMail({
    from: `"Micro Depth Technologies" <${process.env.SMTP_USER || "support@mdt.co.ke"}>`,
    to: { address: request.customerEmail, name: request.customerName },
    replyTo: (process.env.SALES_EMAIL || "sales@mdt.co.ke").split(",")[0].trim(),
    messageId: `<quotation-${quote.id}@mdt.co.ke>`,
    subject: `Your MDT quotation ${request.number}`,
    text: `Hello ${request.customerName},\n\nYour quotation ${request.number} is ready.\n\n${lines}\n\nSubtotal: ${money(quote.subtotal)}\nDelivery: ${money(quote.deliveryFee)}\nTax (${quote.taxRate}%): ${money(quote.tax)}\nTotal: ${money(quote.total)}\nValid through ${quote.validUntil} (Nairobi time).\nLead time: ${quote.leadTime || "To be confirmed"}\n${quote.terms}\n${quote.note}\n\nReview and respond securely: ${link}\nAcceptance confirms your interest; the sales team will arrange payment and delivery.`,
    html: `<html><body style="font-family:Arial,sans-serif;background:#f6f6f6;padding:24px;color:#252525"><div style="max-width:700px;margin:auto;background:white;padding:32px;border-top:4px solid #df1b23"><p style="letter-spacing:2px;font-size:12px">MICRO DEPTH TECHNOLOGIES</p><h1 style="font-size:28px">Your next move, quoted.</h1><p>Hello ${escapeHtml(request.customerName)}, your quotation <strong>${escapeHtml(request.number)}</strong> is ready.</p><table style="width:100%;border-collapse:collapse;font-size:13px;text-align:left"><thead><tr><th>Product / availability</th><th>Qty</th><th>Unit price</th><th>Amount</th></tr></thead><tbody>${rows}</tbody></table><div style="background:#f7f7f7;padding:20px;margin-top:20px"><p>Subtotal: ${money(quote.subtotal)}</p><p>Delivery: ${money(quote.deliveryFee)}</p><p>Tax (${quote.taxRate}%): ${money(quote.tax)}</p><h2>Total: ${money(quote.total)}</h2></div><p>Valid through <strong>${quote.validUntil}</strong> (Nairobi time).</p><p><strong>Lead time:</strong> ${escapeHtml(quote.leadTime || "To be confirmed")}</p><p style="white-space:pre-line">${escapeHtml(quote.terms)}</p><p style="white-space:pre-line">${escapeHtml(quote.note)}</p><p><a style="display:inline-block;background:#df1b23;color:#fff;padding:15px 22px;text-decoration:none;border-radius:6px" href="${escapeHtml(link)}">Review & respond to quotation</a></p><p style="font-size:12px;color:#777">Sign in to your MDT account to accept or decline. Acceptance confirms your interest; our team will arrange payment and delivery.</p></div></body></html>`,
  });
}

// ─── Shared branded shell ────────────────────────────────────────────────────

const FROM = () => `"Micro Depth Technologies" <${process.env.SMTP_USER || "support@mdt.co.ke"}>`;
const salesAddresses = () => (process.env.SALES_EMAIL || "sales@mdt.co.ke").split(",").map(s => s.trim()).filter(Boolean);
const supportAddresses = () => (process.env.SUPPORT_EMAIL || "support@mdt.co.ke").split(",").map(s => s.trim()).filter(Boolean);

type ShellOptions = {
  preheader: string;
  eyebrow: string;
  heading: string;
  body: string;
  cta?: { label: string; href: string };
  signoff?: string;
};

// Table-based, inline-styled template — renders reliably across email clients.
function emailShell({ preheader, eyebrow, heading, body, cta, signoff }: ShellOptions) {
  const button = cta
    ? `<tr><td style="padding:26px 0 4px"><a href="${escapeHtml(cta.href)}" style="display:inline-block;background:#df1b23;color:#ffffff;padding:14px 26px;border-radius:6px;text-decoration:none;font-size:15px;font-weight:600;letter-spacing:.02em">${escapeHtml(cta.label)}</a></td></tr>`
    : "";
  return `<!doctype html><html><body style="margin:0;padding:0;background:#eceee8"><div style="display:none;max-height:0;overflow:hidden">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eceee8;padding:28px 14px"><tr><td align="center">
<table role="presentation" width="620" cellpadding="0" cellspacing="0" style="max-width:620px;width:100%">
  <tr><td style="background:#0c0c0d;border-radius:10px 10px 0 0;padding:26px 34px">
    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
      <td style="background:#df1b23;color:#fff;font-family:Arial,sans-serif;font-size:17px;font-weight:700;letter-spacing:.04em;padding:7px 10px;border-radius:4px">MDT</td>
      <td style="padding-left:12px;color:#f5f4f1;font-family:Arial,sans-serif;font-size:11px;letter-spacing:.22em">MICRO DEPTH TECHNOLOGIES</td>
    </tr></table>
  </td></tr>
  <tr><td style="background:#df1b23;height:3px;font-size:0;line-height:0">&nbsp;</td></tr>
  <tr><td style="background:#ffffff;padding:38px 34px;font-family:Arial,'Segoe UI',sans-serif;color:#252525">
    <p style="margin:0 0 14px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#df1b23;font-weight:700">${escapeHtml(eyebrow)}</p>
    <h1 style="margin:0 0 18px;font-size:27px;line-height:1.25;letter-spacing:-.01em;font-weight:700">${heading}</h1>
    <div style="font-size:15px;line-height:1.75;color:#3c3e3c">${body}</div>
    ${signoff ? `<p style="margin:22px 0 0;font-size:15px;line-height:1.7;color:#3c3e3c">${signoff}</p>` : `<p style="margin:22px 0 0;font-size:15px;line-height:1.7;color:#3c3e3c">— The MDT team</p>`}
    <table role="presentation" cellpadding="0" cellspacing="0">${button}</table>
  </td></tr>
  <tr><td style="background:#151516;border-radius:0 0 10px 10px;padding:22px 34px;font-family:Arial,sans-serif">
    <p style="margin:0 0 6px;font-size:12px;line-height:1.7;color:#b9b9bd">Sound Plaza, 3rd Floor, Suite D6 · Woodvale Grove, Westlands, Nairobi</p>
    <p style="margin:0;font-size:12px;line-height:1.7;color:#b9b9bd">
      <a href="tel:+254748489784" style="color:#f5f4f1;text-decoration:none">0748 489 784</a> ·
      <a href="tel:+254185279412" style="color:#f5f4f1;text-decoration:none">0185 279 412</a> ·
      <a href="mailto:sales@mdt.co.ke" style="color:#f5f4f1;text-decoration:none">sales@mdt.co.ke</a>
    </p>
  </td></tr>
</table>
<p style="font-family:Arial,sans-serif;font-size:11px;color:#8a8d85;margin:16px 0 0">Micro Depth Technologies · Consult. Supply. Support.</p>
</td></tr></table></body></html>`;
}

// ─── Welcome ─────────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(email: string, name: string) {
  const first = escapeHtml((name || "there").split(" ")[0]);
  await transport.sendMail({
    from: FROM(),
    to: { address: email, name },
    subject: "Welcome to MDT — your account is ready",
    text: `Hi ${name || "there"},\n\nWelcome to Micro Depth Technologies. Your account is ready — browse the hardware catalogue, build a quote cart and track your quotations from your dashboard.\n\nOpen your dashboard: ${appUrl("/dashboard/")}\n\n— The MDT team`,
    html: emailShell({
      preheader: "Your MDT account is ready — browse, quote and track in one place.",
      eyebrow: "Welcome aboard",
      heading: `Good to have you, ${first}.`,
      body: `<p>Your MDT account is ready. From one place you can now:</p>
        <p style="font-size:15px;line-height:2;color:#3c3e3c">
          <strong style="color:#df1b23">—</strong>&nbsp; Browse the full hardware catalogue<br>
          <strong style="color:#df1b23">—</strong>&nbsp; Build a quote cart and send it in one request<br>
          <strong style="color:#df1b23">—</strong>&nbsp; Track every quotation from request to fulfilment<br>
          <strong style="color:#df1b23">—</strong>&nbsp; Accept or decline quotations securely online
        </p>
        <p>Prices are always prepared for you personally — add what you need to a quote and our team responds with availability and pricing.</p>`,
      cta: { label: "Open your dashboard", href: appUrl("/dashboard/") },
    }),
  });
}

// ─── Website enquiries ───────────────────────────────────────────────────────

export type EnquiryEmailData = {
  name: string; company: string; email: string; interest: string; message: string;
};

export async function sendEnquiryEmails(data: EnquiryEmailData) {
  const toSupport = /support|repair/i.test(data.interest);
  const recipients = toSupport ? supportAddresses() : salesAddresses();
  const d = {
    name: escapeHtml(data.name), company: escapeHtml(data.company),
    email: escapeHtml(data.email), interest: escapeHtml(data.interest),
    message: escapeHtml(data.message).replace(/\n/g, "<br>"),
  };
  const row = (label: string, value: string) => `<tr><td style="padding:7px 14px 7px 0;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#8a8d85;white-space:nowrap;vertical-align:top">${label}</td><td style="padding:7px 0;font-size:15px;color:#252525">${value}</td></tr>`;
  await transport.sendMail({
    from: FROM(),
    to: recipients,
    replyTo: { address: data.email, name: data.name },
    subject: `New website enquiry: ${data.interest} — ${data.name}`,
    text: `New enquiry via mdt.co.ke\n\nName: ${data.name}\nCompany: ${data.company || "—"}\nEmail: ${data.email}\nInterest: ${data.interest}\n\n${data.message}\n\nReply directly to respond to ${data.name}.`,
    html: emailShell({
      preheader: `${data.name} asked about ${data.interest}.`,
      eyebrow: `Website enquiry · ${toSupport ? "Support" : "Sales"}`,
      heading: "A new enquiry just came in.",
      body: `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:14px">${row("Name", d.name)}${row("Company", d.company || "—")}${row("Email", `<a href="mailto:${d.email}" style="color:#df1b23">${d.email}</a>`)}${row("Interest", d.interest)}</table>
        <div style="background:#f5f5f2;border-left:3px solid #df1b23;padding:16px 18px;border-radius:0 6px 6px 0;font-size:15px;line-height:1.7">${d.message}</div>
        <p style="font-size:13px;color:#8a8d85;margin-top:14px">Replying to this email goes directly to ${d.name}.</p>`,
      signoff: "— MDT website",
    }),
  });
  await transport.sendMail({
    from: FROM(),
    to: { address: data.email, name: data.name },
    subject: "We received your enquiry — MDT",
    // The visitor's message is deliberately not echoed back: this address is
    // unverified, so echoing content would let anyone relay spam through MDT.
    text: `Hi ${data.name},\n\nThank you for reaching out about ${data.interest}. Our team has your enquiry and will respond shortly — usually within one business day.\n\nNeed a faster answer? Call 0748 489 784 or 0185 279 412, or WhatsApp +254 748 489 784.\n\nDidn't contact MDT? You can safely ignore this email.\n\n— The MDT team`,
    html: emailShell({
      preheader: "Your enquiry reached our team — expect a reply shortly.",
      eyebrow: "Enquiry received",
      heading: `Thanks, ${escapeHtml(data.name.split(" ")[0])} — we're on it.`,
      body: `<p>Your enquiry about <strong>${d.interest}</strong> has reached our team. Expect a reply shortly — usually within one business day.</p>
        <p>Need a faster answer? Call <strong>0748 489 784</strong> or <strong>0185 279 412</strong>.</p>
        <p style="font-size:13px;color:#8a8d85">Didn’t contact MDT? You can safely ignore this email.</p>`,
      cta: { label: "Explore MDT", href: appUrl("/") },
    }),
  });
}

// ─── Account security notices ────────────────────────────────────────────────

export async function sendPasswordSecurityEmail(email: string, name: string, kind: "changed" | "reset") {
  const action = kind === "reset" ? "reset" : "updated";
  await transport.sendMail({
    from: FROM(),
    to: { address: email, name },
    subject: `Your MDT account password was ${action}`,
    text: `Hi ${name || "there"},\n\nYour MDT account password was just ${action}, and all other sessions were signed out.\n\nIf you did this, no action is needed.\nIf this wasn't you, contact us immediately at support@mdt.co.ke or call 0748 489 784.\n\n— The MDT team`,
    html: emailShell({
      preheader: "Security notice — your account password changed.",
      eyebrow: "Security notice",
      heading: `Your password was ${action}.`,
      body: `<p>Hi ${escapeHtml((name || "there").split(" ")[0])}, your MDT account password was just ${action}. For your security, <strong>all other sessions were signed out</strong> — you'll need to sign in again on each device.</p>
        <div style="background:#fdf3f3;border-left:3px solid #df1b23;padding:14px 18px;border-radius:0 6px 6px 0;margin-top:16px">
          <p style="margin:0;font-size:14px;line-height:1.7"><strong>Wasn't you?</strong> Contact us right away at <a href="mailto:support@mdt.co.ke" style="color:#df1b23">support@mdt.co.ke</a> or call <strong>0748 489 784</strong> so we can secure your account.</p>
        </div>`,
      cta: { label: "Sign in to your account", href: appUrl("/auth/signin/") },
    }),
  });
}

// ─── Quotation responses (customer → sales) ──────────────────────────────────

export type QuoteResponseEmailData = {
  quoteNumber: string; customerName: string; customerEmail: string;
  action: "accepted" | "declined"; total?: string;
};

export async function sendQuoteResponseEmails(data: QuoteResponseEmailData) {
  const accepted = data.action === "accepted";
  const salesLink = appUrl(`/sales/${encodeURIComponent(data.quoteNumber)}/`);
  const customerLink = appUrl(`/dashboard/quotes/?q=${encodeURIComponent(data.quoteNumber)}`);
  await transport.sendMail({
    from: FROM(),
    to: salesAddresses(),
    replyTo: { address: data.customerEmail, name: data.customerName },
    subject: `${data.customerName} ${data.action} quotation ${data.quoteNumber}`,
    text: `${data.customerName} (${data.customerEmail}) has ${data.action} quotation ${data.quoteNumber}${data.total ? ` — total ${data.total}` : ""}.\n\nReview: ${salesLink}`,
    html: emailShell({
      preheader: `${data.customerName} ${data.action} quotation ${data.quoteNumber}.`,
      eyebrow: accepted ? "Quotation accepted" : "Quotation declined",
      heading: accepted ? "You have a yes." : "The customer passed.",
      body: `<p><strong>${escapeHtml(data.customerName)}</strong> (${escapeHtml(data.customerEmail)}) has <strong style="color:${accepted ? "#15803d" : "#df1b23"}">${data.action}</strong> quotation <strong>${escapeHtml(data.quoteNumber)}</strong>${data.total ? ` — total <strong>${escapeHtml(data.total)}</strong>` : ""}.</p>
        <p>${accepted ? "Move the request forward to processing and arrange payment and delivery." : "The request has been marked declined. You can follow up or close it from the sales workspace."}</p>`,
      cta: { label: "Open in sales workspace", href: salesLink },
      signoff: "— MDT quotations",
    }),
  });
  await transport.sendMail({
    from: FROM(),
    to: { address: data.customerEmail, name: data.customerName },
    subject: `You ${data.action} quotation ${data.quoteNumber}`,
    text: `Hi ${data.customerName},\n\nYour response is recorded — you ${data.action} quotation ${data.quoteNumber}${data.total ? ` (total ${data.total})` : ""}.\n\n${accepted ? "Our sales team will now arrange payment and delivery and will be in touch shortly." : "No problem — if anything changes, just send a new request or reply to this email."}\n\nTrack it any time: ${customerLink}\n\n— The MDT team`,
    html: emailShell({
      preheader: `Your response to quotation ${data.quoteNumber} is recorded.`,
      eyebrow: "Response recorded",
      heading: accepted ? "Consider it done." : "Understood — noted.",
      body: `<p>Hi ${escapeHtml(data.customerName.split(" ")[0])}, your response to quotation <strong>${escapeHtml(data.quoteNumber)}</strong>${data.total ? ` (total <strong>${escapeHtml(data.total)}</strong>)` : ""} is recorded.</p>
        <p>${accepted ? "Our sales team will now arrange payment and delivery — expect to hear from us shortly." : "If anything changes, you can send a new request any time, or simply reply to this email."}</p>`,
      cta: { label: "Track your request", href: customerLink },
    }),
  });
}

// ─── Order status updates (sales → customer) ─────────────────────────────────

const STATUS_EMAIL: Record<string, { eyebrow: string; heading: string; note: string }> = {
  processing: {
    eyebrow: "Order update",
    heading: "Your order is moving.",
    note: "We're preparing our order now — sourcing, confirming and getting everything ready. We'll let you know the moment it's fulfilled.",
  },
  fulfilled: {
    eyebrow: "Order fulfilled",
    heading: "That's a wrap — fulfilled.",
    note: "Your order has been fulfilled.If anything isn't as expected, reply to this email or call us and we'll make it right.",
  },
};

export async function sendQuoteStatusEmail(data: { quoteNumber: string; customerName: string; customerEmail: string; status: string }) {
  const variant = STATUS_EMAIL[data.status];
  if (!variant) return;
  const link = appUrl(`/dashboard/quotes/?q=${encodeURIComponent(data.quoteNumber)}`);
  await transport.sendMail({
    from: FROM(),
    to: { address: data.customerEmail, name: data.customerName },
    replyTo: salesAddresses()[0],
    subject: `Update on ${data.quoteNumber}: ${data.status === "processing" ? "we're preparing your order" : "your order is fulfilled"}`,
    text: `Hi ${data.customerName},\n\nUpdate on your request ${data.quoteNumber}: it's now ${data.status}.\n\n${variant.note}\n\nTrack it: ${link}\n\n— The MDT team`,
    html: emailShell({
      preheader: `${data.quoteNumber} is now ${data.status}.`,
      eyebrow: variant.eyebrow,
      heading: variant.heading,
      body: `<p>Hi ${escapeHtml(data.customerName.split(" ")[0])}, your request <strong>${escapeHtml(data.quoteNumber)}</strong> is now <strong>${escapeHtml(data.status)}</strong>.</p><p>${variant.note}</p>`,
      cta: { label: "Track your request", href: link },
    }),
  });
}
