import sanitizeHtml from "sanitize-html";
import { mediaUrl } from "./media";

export function contentHtml(value?: string) {
  return sanitizeHtml(value || "", {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "img"],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "width", "height", "loading"],
      a: ["href", "title", "rel"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowProtocolRelative: false,
    transformTags: {
      // Links from migrated content can't pass referrer data or control the opener.
      a: (_tag, attributes) => ({
        tagName: "a",
        attribs: /^https?:\/\//i.test(attributes.href || "") && !/^https?:\/\/(?:www\.)?mdt\.co\.ke(?:[/?#]|$)/i.test(attributes.href || "")
          ? { ...attributes, rel: "nofollow noopener noreferrer" }
          : attributes,
      }),
      img: (_tag, attributes) => ({
        tagName: "img",
        attribs: {
          ...attributes, loading: "lazy",
          src: mediaUrl(attributes.src || ""),
        },
      }),
    },
  });
}
