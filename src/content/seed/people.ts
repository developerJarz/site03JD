import type { Faq, TeamMember } from "@/types/content";

type SeedTeam = Omit<TeamMember, "_id">;
type SeedFaq = Omit<Faq, "_id">;

const photo = (file: string, name: string) => ({ src: `/images/team/${file}`, alt: `Portrait of ${name}`, width: 150, height: 150 });

/** Team members exactly as published on jarzdigital.com (homepage + about page). */
export const teamSeed: SeedTeam[] = [
  {
    slug: "rokonuzzaman-jony",
    name: "Rokonuzzaman Jony",
    role: "CEO, Team Leader & Founder",
    region: "Global",
    bio: "12 years of experience in business growth, digital marketing and SEO. Top No. 1 freelancer on Fiverr in 2023 in the Local SEO category, having ranked and grown over 300 businesses worldwide.",
    highlights: ["#1 SEO expert on Fiverr — 2023, Local SEO", "300+ businesses ranked worldwide", "12 years in business growth & SEO"],
    photo: photo("rokonuzzaman-jony.png", "Rokonuzzaman Jony"),
    socials: {},
    order: 1,
    published: true,
  },
  {
    slug: "shawn",
    name: "Shawn",
    role: "Co-owner · Client Affairs, USA",
    region: "United States",
    bio: "Leads JarzDigital’s USA branch with strategic vision, empowering growth and innovation across our digital services.",
    highlights: [],
    // The published image was a generic placeholder silhouette; initials are shown until a real photo is uploaded.
    photo: null,
    socials: {},
    order: 2,
    published: true,
  },
  {
    slug: "asad",
    name: "Asad",
    role: "Client Affairs, Canada",
    region: "Canada",
    bio: "Manages client relations across Canada, ensuring smooth communication, satisfaction, and long-term partnerships at JarzDigital.",
    highlights: [],
    photo: photo("asad.png", "Asad"),
    socials: {},
    order: 3,
    published: true,
  },
  {
    slug: "shahriar",
    name: "Shahriar",
    role: "Team Manager",
    region: "Global",
    bio: "Leads the JarzDigital team with focus and coordination, ensuring timely delivery and excellence across all projects.",
    highlights: [],
    photo: photo("shahriar.webp", "Shahriar"),
    socials: {},
    order: 4,
    published: true,
  },
  {
    slug: "ammar-mazrui",
    name: "Ammar Mazrui",
    role: "Digital Marketing",
    region: "Ontario, Canada",
    bio: "Drives digital marketing success in Ontario with strategic campaigns that boost brand visibility and audience engagement.",
    highlights: [],
    photo: photo("ammar-mazrui.jpg", "Ammar Mazrui"),
    socials: {},
    order: 5,
    published: true,
  },
  {
    slug: "salman-hafiz",
    name: "Salman Hafiz",
    role: "Web Developer",
    region: "Global",
    bio: "Crafts responsive, SEO-friendly websites for global clients, combining clean design with smart development solutions.",
    highlights: [],
    photo: photo("salman-hafiz.png", "Salman Hafiz"),
    socials: {},
    order: 6,
    published: true,
  },
  {
    slug: "abir",
    name: "Abir",
    role: "SEO Expert",
    region: "Global",
    bio: "Optimizes search rankings with proven SEO strategies, helping global clients increase organic traffic and visibility.",
    highlights: [],
    photo: photo("abir.png", "Abir"),
    socials: {},
    order: 7,
    published: true,
  },
  {
    slug: "fardin",
    name: "Fardin",
    role: "Video Editor",
    region: "Global",
    bio: "Creates impactful video content with dynamic edits, enhancing storytelling for brands and digital campaigns worldwide.",
    highlights: [],
    photo: photo("fardin.webp", "Fardin"),
    socials: {},
    order: 8,
    published: true,
  },
  {
    slug: "denial",
    name: "Denial",
    role: "Web Developer",
    region: "Global",
    bio: "Develops high-performing websites globally, delivering smooth UX, clean code, and mobile-optimized functionality.",
    highlights: [],
    photo: photo("denial.png", "Denial"),
    socials: {},
    order: 9,
    published: true,
  },
];

export const faqSeed: SeedFaq[] = [
  {
    group: "general",
    order: 1,
    published: true,
    question: "What services does Jarz Digital offer for small and local businesses?",
    answer:
      "Jarz Digital provides a full suite of digital growth services including Website Design & Development, SEO, Local SEO (Google Ranking), Social Media Marketing, Google Ads & PPC Campaigns, and Monthly Business Management. All services include free graphics and SEO-optimized content for better results.",
  },
  {
    group: "general",
    order: 2,
    published: true,
    question: "How can Local SEO help my business in Dallas, Denver, or Calgary?",
    answer:
      "Local SEO helps your business appear in top search results when people near you search for services like yours. We focus on ranking your Google Business Profile, optimizing local keywords, and updating your profile regularly, helping you get more leads in Dallas, Denver, and Calgary.",
  },
  {
    group: "general",
    order: 3,
    published: true,
    question: "What’s included in your website development service?",
    answer:
      "We build user-friendly, SEO-ready websites using WordPress, Shopify, and Laravel. Our development includes mobile responsiveness, fast loading speeds, security, on-page SEO, and attractive design, starting from just $50 if your site is down or outdated.",
  },
  {
    group: "general",
    order: 4,
    published: true,
    question: "Do you manage Google Ads and Meta Ads campaigns?",
    answer:
      "Yes! We create and manage high-converting ad campaigns on platforms like Google, Meta (Facebook/Instagram), and more. We specialize in PPC campaigns, Product Ads, and lead generation ads to grow your sales and visibility fast.",
  },
  {
    group: "general",
    order: 5,
    published: true,
    question: "What makes Jarz Digital different from other agencies in the USA & Canada?",
    answer:
      "Unlike other agencies, we offer complete business support, not just marketing. With free graphics, manual SEO work, custom strategies, and transparent reporting, we help businesses in the USA and Canada grow with confidence and clarity.",
  },
  {
    group: "contact",
    order: 1,
    published: true,
    question: "How quickly can you start working on my project?",
    answer:
      "We can typically begin new projects within 1-2 business days after our initial consultation and contract signing. For urgent projects, we offer expedited onboarding within 24 hours.",
  },
  {
    group: "contact",
    order: 2,
    published: true,
    question: "Do you work with businesses outside of Dallas, Denver, and Calgary?",
    answer:
      "Absolutely! While we have offices in these three cities, we work with clients across North America and internationally. Most of our services can be delivered remotely with excellent results.",
  },
  {
    group: "contact",
    order: 3,
    published: true,
    question: "What's included in the free consultation?",
    answer:
      "Our free consultation includes a comprehensive review of your current digital presence, identification of growth opportunities, and a customized strategy recommendation. There's no obligation to work with us afterward.",
  },
  {
    group: "contact",
    order: 4,
    published: true,
    question: "How do you measure success and ROI?",
    answer:
      "We use comprehensive analytics and reporting to track key performance indicators specific to your goals, including website traffic, conversion rates, lead generation, and revenue attribution. You'll receive detailed monthly reports.",
  },
];

export const categorySeed = [
  { slug: "local-seo", name: "Local SEO", kind: "post" as const, description: "Google Maps, Google Business Profile and local ranking guides." },
  { slug: "seo", name: "SEO", kind: "post" as const, description: "Website SEO strategy and technical optimization." },
  { slug: "business-management", name: "Business Management", kind: "post" as const, description: "Running your business’s digital presence as one system." },
  { slug: "growth-marketing", name: "Growth & Marketing", kind: "service" as const, description: "Search, social, advertising and ongoing management." },
  { slug: "design-development", name: "Design & Development", kind: "service" as const, description: "Websites, web applications and custom software." },
];

export const tagSeed = [
  { slug: "dallas", name: "Dallas" },
  { slug: "local-seo", name: "Local SEO" },
  { slug: "google-maps", name: "Google Maps" },
  { slug: "google-business-profile", name: "Google Business Profile" },
  { slug: "guides", name: "Guides" },
  { slug: "website-seo", name: "Website SEO" },
  { slug: "small-business", name: "Small Business" },
  { slug: "business-management", name: "Business Management" },
];
