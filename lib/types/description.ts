export const FRAMEWORKS = ["ESX", "QBCore", "QBox", "Standalone"] as const;
export type Framework = (typeof FRAMEWORKS)[number];

export const SECTIONS = ["features", "compat", "faq", "reviews", "changelog"] as const;
export type SectionName = (typeof SECTIONS)[number];

export interface Dependency {
  name: string;
  required: boolean;
}

export interface FaqItem {
  question: string;       // plain text, entities decoded
  answerHtml: string;     // sanitized HTML
}

export interface Review {
  author: string;         // plain text
  rating: 1 | 2 | 3 | 4 | 5 | null; // null = invalid, see warnings
  date: string | null;    // YYYY-MM-DD
  bodyHtml: string;       // sanitized HTML
}

export interface ChangelogEntry {
  version: string;        // vMAJOR.MINOR.PATCH
  date: string | null;    // YYYY-MM-DD
  changes: string[];      // plain-text <li> items
  bodyHtml: string;       // sanitized HTML, for entries written as paragraphs
}

export interface ParsedDescription {
  descriptionHtml: string;            // everything outside the marker blocks
  features: string[];
  compat: {
    frameworks: Framework[];
    dependencies: Dependency[];
  };
  faq: FaqItem[];
  reviews: Review[];
  changelog: ChangelogEntry[];

  // Derived, never written by hand
  version: string | null;             // highest semver in changelog
  lastUpdated: string | null;         // newest changelog date
  reviewCount: number;
  averageRating: number | null;       // null when there are no valid ratings

  warnings: string[];                 // every malformed item, for CI and a dev UI
}

export const PATTERNS = {
  marker: /^\[\[(\/?)(features|compat|faq|reviews|changelog)\]\]$/,
  version: /^v\d+\.\d+\.\d+$/,
  date: /^\d{4}-\d{2}-\d{2}$/,
  rating: /^[1-5]$/,
  dependency: /^[a-z0-9_\-.]+ \| (required|optional)$/i,
  changelogHeader: /^v\d+\.\d+\.\d+ \| \d{4}-\d{2}-\d{2}$/,
  reviewHeader: /^[^|]+ \| [1-5] \| \d{4}-\d{2}-\d{2}$/,
} as const;

export const ALLOWED_TAGS_SECTIONS = ["p", "h3", "ul", "ol", "li", "strong", "em", "a", "code", "blockquote"] as const;
export const ALLOWED_TAGS_INTRO = [...ALLOWED_TAGS_SECTIONS, "h2", "h4"] as const;
export const BANNED_TAGS = ["img", "table", "br", "hr", "pre", "span"] as const;
