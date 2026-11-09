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
