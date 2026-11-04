import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "mail.mdt.co.ke",
  port: Number(process.env.SMTP_PORT || 465),
  secure: true,
  auth: {
    user: process.env.SMTP_USER || "support@mdt.co.ke",
    pass: process.env.SMTP_PASS || "",
  },
});

export type QuoteEmailData = {
  quoteNumber: string;
  customerName: string;
  customerEmail: string;
  company?: string;
  phone?: string;
  message?: string;
  items: { name: string; sku?: string; configuration?: string; quantity: number }[];
};

function quoteHtml(data: QuoteEmailData, recipient: "sales" | "customer") {
  const items = data.items.map(i => `<tr><td>${i.name}</td><td>${i.sku || "—"}</td><td>${i.configuration || "—"}</td><td>${i.quantity}</td></tr>`).join("");
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
