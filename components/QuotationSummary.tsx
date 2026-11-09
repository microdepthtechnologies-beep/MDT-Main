import { availabilityLabels, money, type IssuedQuotation, type RequestItem } from "@/lib/quotation";

export function QuotationSummary({ offer, items }: { offer: IssuedQuotation; items: RequestItem[] }) {
  return <div className="quotation-summary">
    <div className="quotation-heading"><div><span className="workspace-eyebrow">YOUR TAILORED QUOTATION</span><h3>The details, made clear.</h3></div><span>Valid through {offer.validUntil}<small>Nairobi time</small></span></div>
    <div className="quotation-lines">{offer.lines.map((line, index) => <div className="quotation-line" key={index}><div><strong>{items[index]?.name}</strong><p>{items[index]?.configuration}</p><span className={`availability availability-${line.availability}`}>{availabilityLabels[line.availability]}</span>{line.note && <p>{line.note}</p>}</div><div>{line.availability === "unavailable" ? <span>Not included</span> : <><span>{line.quantity} × {money(line.unitPrice)}</span><strong>{money(line.quantity * line.unitPrice)}</strong>{line.quantity < items[index]?.quantity && <small>{items[index].quantity} originally requested</small>}</>}</div></div>)}</div>
    <div className="quotation-bottom"><div className="quotation-terms"><h4>Delivery & terms</h4><p>{offer.leadTime || "Delivery arrangements to be confirmed with our team."}</p>{offer.terms && <p>{offer.terms}</p>}{offer.note && <p>{offer.note}</p>}</div><dl className="quotation-totals"><div><dt>Subtotal</dt><dd>{money(offer.subtotal)}</dd></div><div><dt>Delivery</dt><dd>{money(offer.deliveryFee)}</dd></div><div><dt>Tax ({offer.taxRate}%)</dt><dd>{money(offer.tax)}</dd></div><div className="quotation-grand-total"><dt>Total · KES</dt><dd>{money(offer.total)}</dd></div></dl></div>
  </div>;
}
