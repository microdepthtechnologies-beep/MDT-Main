"use client";

import { Percent, ShoppingCart, Zap } from "lucide-react";

const messages = [
  { icon: <Percent size={16} strokeWidth={2} />, text: "3% OFF SELECTED HARDWARE", highlight: "BLACK NOVEMBER" },
  { icon: <Zap size={16} strokeWidth={2} />, text: "NO VAT INCLUDED", highlight: "LIMITED TIME" },
  { icon: <ShoppingCart size={16} strokeWidth={2} />, text: "QUOTE-ONLY PRICING", highlight: "PREMIUM QUALITY" },
];

export function BlackNovemberBanner() {
  return (
    <div className="black-november-banner" role="banner" aria-label="Black November promotion">
      <div className="black-november-track">
        <div className="black-november-marquee">
          {Array.from({ length: 6 }, (_, groupIndex) => (
            <div key={groupIndex} className="black-november-group" aria-hidden={groupIndex > 0}>
              {messages.map((msg, messageIndex) => (
                <div key={messageIndex} className="black-november-item">
                  <span className="black-november-icon">{msg.icon}</span>
                  <span className="black-november-text">{msg.text}</span>
                  <span className="black-november-highlight">{msg.highlight}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
