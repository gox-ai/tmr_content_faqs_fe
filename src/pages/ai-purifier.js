import DOMPurify from "dompurify";

export function sanitizeHtml(html = "") {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "a",
      "p",
      "strong",
      "em",
      "ul",
      "ol",
      "li",
      "br",
      "span",
    ],
    ALLOWED_ATTR: ["href", "target", "rel"],
    FORBID_TAGS: ["script", "iframe", "style"],
    FORBID_ATTR: ["onerror", "onclick", "onload"],
  });
}

export function hasInterlink(html = "") {
  return /<a\s+href=/i.test(html);
}

export function normalizeFaqs(faqs = []) {
  return faqs.map((faq) => {
    const safeAnswer = sanitizeHtml(faq.answer || "");

    return {
      ...faq,
      answer: safeAnswer,
      hasInterlink: hasInterlink(safeAnswer),
    };
  });
}
