import type { CmsPage } from "@/types/content";

type SeedPage = Omit<CmsPage, "_id">;

const placeholderNotice =
  '<p><strong>Placeholder — awaiting legal review.</strong> The original jarzdigital.com site did not publish this page. Replace this content in <em>Admin → Content → Pages</em> before launch.</p>';

export const pageSeed: SeedPage[] = [
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    intro: "How Jarz Digital collects, uses and protects your information.",
    content: `${placeholderNotice}
<h2>Information we collect</h2><p>When you contact us, request a quote or create an account, we collect the details you provide — such as your name, email address, phone number, company and project information.</p>
<h2>How we use it</h2><p>We use this information to respond to inquiries, deliver the services you request, and send account-related emails such as password resets.</p>
<h2>Contact</h2><p>Questions about privacy can be sent to info@jarzdigital.com.</p>`,
    status: "published",
    needsReview: true,
    seo: { noindex: true },
  },
  {
    slug: "terms-of-service",
    title: "Terms of Service",
    intro: "The terms that apply when you use this website and our services.",
    content: `${placeholderNotice}
<h2>Services</h2><p>Service scope, pricing and deliverables are agreed per project or plan. Plan details are listed on each service page.</p>
<h2>Cancellation</h2><p>Monthly plans can be cancelled with 30 days’ notice, as described on the relevant service pages.</p>`,
    status: "published",
    needsReview: true,
    seo: { noindex: true },
  },
];
