import sanitizeHtml from "sanitize-html";

export function contentHtml(value?: string) {
  return sanitizeHtml(value || "", {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "img"],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "width", "height", "loading"],
      a: ["href", "title"],
    },
    transformTags: {
      img: (_tag, attributes) => ({
        tagName: "img",
        attribs: {
          ...attributes, loading: "lazy",
          src: (attributes.src || "").replace(/^https?:\/\/(?:www\.)?mdt\.co\.ke(?=\/wp-content\/uploads\/)/, ""),
        },
      }),
    },
  });
}
