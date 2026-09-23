import type { SiteSettings } from "@/types/content";

/**
 * Business information migrated from jarzdigital.com (homepage, contact
 * and about pages). See docs/CONTENT_INVENTORY.md for sources and the
 * items flagged for verification.
 */
export const siteSeed: SiteSettings = {
  general: {
    siteName: "Jarz Digital",
    tagline: "360° solution for developing businesses",
    description:
      "Jarz Digital is a top web & digital marketing agency specializing in Local SEO, website design, ads and digital growth solutions — ranking local businesses on Google Maps across the USA, Canada and Europe.",
    foundedYear: 2019,
  },
  contact: {
    email: "info@jarzdigital.com",
    phone: "+1 267-766-9055",
    whatsapp: "+8801677248045",
    mailingAddress: "1024 Alyssa Ln, Carrollton, TX 75006, United States",
    hours: [
      { days: "Monday – Friday", hours: "9:00 AM – 6:00 PM" },
      { days: "Saturday", hours: "10:00 AM – 4:00 PM" },
      { days: "Sunday", hours: "Closed" },
    ],
    responseTime: "We respond within 24 hours",
  },
  offices: [
    {
      city: "Dallas",
      code: "DAL",
      region: "Texas",
      country: "United States",
      address: "Mockingbird Lane, Dallas, TX (Service-Based, Online Only)",
      phone: "+1 267-766-9055",
      email: "usa@jarzdigital.com",
      description:
        "Founded in Dallas, Jarz Digital helps Texas-based businesses scale faster with local SEO, custom web design, and business management solutions. Our Dallas team works closely with local clients to boost rankings, improve digital visibility, and increase leads.",
      image: { src: "/images/locations/dallas.jpg", alt: "Dallas skyline reflected in water at dusk", width: 2000, height: 1499 },
      mapQuery: "Dallas, TX",
    },
    {
      city: "Denver",
      code: "DEN",
      region: "Colorado",
      country: "United States",
      address: "Cherry Creek Area, Denver, CO (Service-Based, Online Only)",
      phone: "+1 267-766-9055",
      email: "usa@jarzdigital.com",
      description:
        "From the heart of Colorado, our Denver branch specializes in helping small to mid-size businesses thrive online. With expertise in local SEO and ad campaign management, we ensure your brand gets noticed in the Denver market and beyond.",
      image: { src: "/images/locations/denver.jpeg", alt: "Denver skyline with the Rocky Mountains", width: 7360, height: 4140 },
      mapQuery: "Cherry Creek, Denver, CO",
    },
    {
      city: "Calgary",
      code: "YYC",
      region: "Alberta",
      country: "Canada",
      address: "3730108 Ave NE #2138, Calgary, AB T3N IV9",
      phone: "+1 267-766-9055",
      email: "canada@jarzdigital.com",
      description:
        "Jarz Digital serves Canadian businesses from our Calgary location with a focus on Shopify, WordPress, and Laravel website development. We help companies rank higher, grow faster, and convert better with targeted marketing strategies.",
      image: { src: "/images/locations/calgary.jpg", alt: "Calgary skyline at dusk", width: 1359, height: 772 },
      mapQuery: "Downtown Calgary, AB",
    },
    {
      city: "Dhaka",
      code: "DAC",
      region: "Dhaka",
      country: "Bangladesh",
      address: "Near Ibn Sina Diagnostic & Consultation Center, Section 2, Mirpur, Dhaka, Bangladesh",
      phone: "+8801677-248045",
      email: "bd@jarzdigital.com",
      description: "Jarz Digital’s Bangladesh office in Mirpur, Dhaka — home to our development, SEO and design team serving clients in the USA, Canada, Europe and Bangladesh.",
      image: null,
      mapQuery: "Ibn Sina Diagnostic & Consultation Center, Mirpur 2, Dhaka",
    },
  ],
  socials: {},
  stats: [
    { value: "500+", label: "Global clients served" },
    { value: "1,000+", label: "Projects completed" },
    { value: "100%", label: "Client satisfaction" },
    { value: "2019", label: "Founded in Dallas" },
  ],
  trust: ["Serving 500+ global clients", "100% client satisfaction", "100% 5-star reviews"],
  seo: {
    titleTemplate: "%s | Jarz Digital",
    defaultTitle: "Jarz Digital — Local SEO, Web Development & Digital Marketing",
    defaultDescription:
      "Full-service digital agency in Dallas, Denver & Calgary. Local SEO, website development, Google Ads, social media and monthly business management for growing brands across the USA and Canada.",
    ogImage: "/opengraph-image",
    keywords: [
      "local SEO",
      "web design Dallas",
      "digital marketing agency",
      "Google Maps ranking",
      "website development",
      "Denver SEO",
      "Calgary web design",
    ],
  },
  email: { notifyOnLead: true, adminRecipients: ["info@jarzdigital.com"] },
  security: { allowRegistration: true },
  branding: { logo: "/images/brand/logo.png", mark: "/images/brand/mark.png" },
};

/** Additional claims from the original site used in page copy. */
export const brandFacts = {
  founderRecognition: "CEO Jony was recognized as the #1 SEO expert on Fiverr in 2023.",
  regions: "We operate in the United States, Canada, and Europe — especially well-known in Colorado, Texas, and California.",
  rankedRegions: "Additionally, we ranked numerous businesses in WA, IA, LA, and MD in the USA, and Toronto, Ontario, and Alberta in Canada.",
  mission:
    "To empower businesses of all sizes with innovative digital marketing solutions that drive measurable growth, enhance online visibility, and create meaningful connections with their target audiences.",
  vision:
    "To become the leading digital marketing agency that businesses trust to navigate the ever-evolving digital landscape, setting new standards for innovation, results, and client satisfaction.",
  missionPoints: [
    "Deliver exceptional results for every client",
    "Provide transparent and honest communication",
    "Stay ahead of digital marketing trends",
  ],
  visionPoints: ["Pioneer innovative digital solutions", "Build lasting partnerships with clients", "Shape the future of digital marketing"],
  story: [
    "Founded in 2019, Jarz Digital began with a simple yet powerful vision: to help businesses of all sizes harness the power of digital marketing to achieve unprecedented growth.",
    "What started as a small team of passionate digital marketers has evolved into a comprehensive digital agency serving hundreds of clients across various industries. Our journey has been marked by continuous learning, adaptation, and an unwavering commitment to delivering exceptional results.",
    "Today, we stand as a trusted partner for businesses looking to establish a strong digital presence, drive meaningful engagement, and achieve sustainable growth in an increasingly competitive digital landscape.",
  ],
  milestones: [
    { year: "2019", title: "Company founded", description: "Started with a vision to transform digital marketing." },
    { year: "2021", title: "100+ clients", description: "Reached our first major milestone." },
    { year: "2023", title: "Service expansion", description: "Added comprehensive business management solutions." },
    { year: "2025", title: "500+ success stories", description: "Continuing to drive exceptional results." },
  ],
  values: [
    { title: "Innovation", description: "We constantly explore new technologies and strategies to stay ahead of the curve and deliver cutting-edge solutions for our clients." },
    { title: "Integrity", description: "Honesty and transparency are at the heart of everything we do. We build trust through open communication and ethical practices." },
    { title: "Excellence", description: "We strive for excellence in every project, continuously improving our skills and processes to deliver outstanding results." },
    { title: "Partnership", description: "We view our clients as partners, working collaboratively to understand their goals and achieve mutual success." },
    { title: "Results-Driven", description: "Every strategy we implement is designed with measurable outcomes in mind, ensuring our clients see real, tangible results." },
    { title: "Passion", description: "We're passionate about digital marketing and genuinely excited about helping businesses grow and succeed online." },
  ],
  differentiators: [
    { title: "Complete business support", description: "Unlike other agencies, we offer complete business support — not just marketing." },
    { title: "Free graphics & SEO content", description: "All services include free graphics and SEO-optimized content for better results." },
    { title: "100% manual SEO work", description: "Proven local ranking strategies, done by hand, with detailed reporting." },
    { title: "Transparent reporting", description: "Custom strategies and transparent reporting so you grow with confidence and clarity." },
  ],
  whyText:
    "Jarz Digital is one of the best digital agencies in the USA & Canada, trusted for expert web design, powerful Local SEO services, and smart business management solutions. We create custom websites that look great and rank higher, helping businesses stand out in Dallas, Denver, and Calgary. Our team blends creativity with strategy to deliver real, measurable results. Whether you're a startup or an established brand, we provide tailored digital services that drive growth.",
};

/** "Our work strategy planning process" — the six stages from the original homepage. */
export const growthProcess = [
  {
    title: "Planning",
    subtitle: "Strategic start to business growth",
    icon: "/images/process/planning.png",
    description:
      "We start by understanding your business, market, and audience to build a strong foundation. Our planning process ensures that every next step is goal-focused and data-driven.",
    points: [
      "In-depth keyword research to target the right search terms",
      "Competitor analysis to understand market positioning",
      "Audience identification for precise targeting",
      "Understanding your business model and goals",
      "Crafting a tailored digital growth strategy",
    ],
  },
  {
    title: "Website Development",
    subtitle: "Build a high-impact online presence",
    icon: "/images/process/website-development.png",
    description:
      "We design and develop fast, mobile-friendly, and SEO-optimized websites that reflect your brand and convert visitors into customers. Whether you're starting fresh or need to fix a broken site, we're here to help with website solutions starting at just $50.",
    points: [
      "User-friendly website design with a responsive layout",
      "SEO-ready structure for better search visibility",
      "Fast-loading pages with modern UI/UX",
      "Fixing or rebuilding down/broken websites",
      "Affordable development starting from $50",
    ],
  },
  {
    title: "SEO",
    subtitle: "Boost your online ranking & organic growth",
    icon: "/images/process/seo.png",
    description:
      "We apply proven SEO strategies tailored to your business goals. From in-depth audits to complete technical and content optimization, our SEO services include everything needed to improve your visibility and grow traffic faster.",
    points: [
      "Complete business audit and in-depth SEO analysis",
      "On-page & off-page SEO implementation",
      "Advanced technical SEO for site performance and structure",
      "Google Analytics & tracking setup",
      "Keyword-targeted strategies that drive long-term growth",
    ],
  },
  {
    title: "Local SEO",
    subtitle: "Get found by customers near you",
    icon: "/images/process/local-seo.png",
    description:
      "Our Local SEO service is built to grow your business within your target area. We apply proven local ranking strategies and provide 100% manual work with real results. Most clients see local ranking improvements within just 3 months.",
    points: [
      "Rank your local keywords on Google Search & Maps",
      "100% manual work with detailed reporting",
      "Google Business Profile optimization & regular updates",
      "Build local citations and geo-targeted backlinks",
      "Boost visibility in Dallas, Denver, Calgary, and beyond",
    ],
  },
  {
    title: "Social Media Marketing",
    subtitle: "Build engagement & brand awareness",
    icon: "/images/process/social-media-marketing.png",
    description:
      "We manage your social presence across top-performing platforms to grow your audience, drive traffic, and boost brand trust. Our creative strategy and consistent posting help businesses stay active and engaging online.",
    points: [
      "Facebook & Instagram — daily engagement and targeted ads",
      "Pinterest & TikTok — visual branding and viral content",
      "Quora & Medium — authority building and content marketing",
      "Tumblr — creative expression and niche targeting",
      "Google My Business — local visibility and customer interaction",
    ],
  },
  {
    title: "Google Ads Campaign",
    subtitle: "Drive targeted traffic & real conversions",
    icon: "/images/process/ads.png",
    description:
      "We run high-performing ad campaigns using the best strategies to help you get more leads, more sales, and faster growth. From search to social, we manage everything to ensure your ads deliver maximum ROI.",
    points: [
      "Google Ads — targeted search, display, and video ads",
      "PPC campaigns — cost-effective pay-per-click strategy",
      "Meta Ads — Facebook & Instagram ad management",
      "Product Ads — promote eCommerce products across platforms",
      "Conversion-focused ad copy, visuals, and A/B testing",
    ],
  },
];

/** Before & after redesign showcase from the original homepage. */
export const beforeAfterShowcase = [
  { project: "cravin-crabs", client: "Cravin’ Crabs", image: "/images/before-after/cravin-crabs.png" },
  { project: "rides-on-time", client: "Rides On Time", image: "/images/before-after/rides-on-time.png" },
  { project: "yonge-rehab", client: "Yonge Rehab", image: "/images/before-after/yonge-rehab.png" },
  { project: "puff-picks", client: "Puff Picks", image: "/images/before-after/puff-picks.png" },
  { project: "blissful", client: "Blissful", image: "/images/before-after/blissful.png" },
];
