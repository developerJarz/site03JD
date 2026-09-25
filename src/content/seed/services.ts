import type { Service } from "@/types/content";

export type SeedService = Omit<Service, "_id" | "related" | "category"> & {
  relatedSlugs: string[];
  categorySlug: string;
};

const seoProcess = [
  { title: "Keyword Research & Strategy", description: "We identify the most valuable keywords for your business and create a comprehensive SEO strategy to target them effectively." },
  { title: "Technical SEO Optimization", description: "Fix technical issues that hurt your rankings including site speed, mobile optimization, crawling, and indexing problems." },
  { title: "On-Page Optimization", description: "Optimize your website content, meta tags, headers, images, and internal linking structure for better search engine visibility." },
  { title: "Content & Link Building", description: "Create high-quality, SEO-optimized content and build authoritative backlinks to boost your website's credibility and rankings." },
];

const img = (file: string, alt: string) => ({ src: `/images/services/${file}`, alt, width: 1000, height: 1000 });

/**
 * Services migrated from the eight service pages on jarzdigital.com.
 * Order follows the new navigation.
 */
export const serviceSeed: SeedService[] = [
  /* ------------------------------------------------------------------ */
  {
    slug: "website-development",
    title: "Website Development",
    shortTitle: "Web Development",
    icon: "monitor-smartphone",
    categorySlug: "design-development",
    tagline: "Fast, secure, mobile-friendly websites that rank — and convert.",
    summary:
      "We build fast, secure, and mobile-friendly websites that rank. Custom design, user-friendly layout, and full SEO content integration for better Google performance — plus free graphic design for banners, icons, and brand elements.",
    heroTitle: "Professional websites that turn visitors into customers.",
    heroSubtitle:
      "Transform your business with a stunning, professional website that converts visitors into customers. Choose from flexible plans designed to meet every business need and budget.",
    overview:
      "We design and develop fast, mobile-friendly, and SEO-optimized websites that reflect your brand and convert visitors into customers. Whether you're starting fresh or need to fix a broken site, we build on WordPress, Shopify and Laravel — with solutions starting at just $50.",
    image: img("website-development.webp", "Professional website development illustration"),
    problems: [
      { title: "A weak first impression", description: "Your website is often the first impression customers have of your business. A dated site costs you trust and credibility before a conversation starts." },
      { title: "Visitors who never convert", description: "Without clear calls-to-action and a seamless experience, traffic leaves without calling, booking or buying." },
      { title: "A site that is down or broken", description: "We fix or rebuild down and broken websites — affordable development starting from $50." },
    ],
    included: [
      { title: "Custom Website Design", description: "Unique, professional design tailored to your brand and business goals.", items: ["Brand-aligned color schemes", "Custom graphics and imagery", "Professional typography"] },
      { title: "Mobile Responsive Website", description: "Optimal experience on desktop, tablet and mobile.", items: ["Mobile-first design approach", "Touch-friendly navigation", "Fast loading on all devices"] },
      { title: "SEO Optimization", description: "Built-in SEO best practices to help you rank higher.", items: ["Optimized page structure", "Meta tags and descriptions", "Fast loading speeds"] },
      { title: "E-commerce Functionality", description: "Sell products or services online.", items: ["Product catalog management", "Secure payment gateway", "Order tracking system"] },
      { title: "Security & SSL", description: "Keep your website and customer data secure.", items: ["SSL certificate included", "Regular security updates", "Malware protection"] },
      { title: "Analytics & Reporting", description: "Track performance with visitor insights and conversion tracking.", items: ["Google Analytics integration", "Performance monitoring", "Monthly reports"] },
    ],
    benefits: [
      "Professional brand image",
      "Better search engine visibility",
      "Mobile-friendly experience",
      "Lead generation automation",
      "Customer support integration",
      "Analytics and insights",
    ],
    process: [
      { title: "Discovery", description: "We learn about your business, goals, and requirements." },
      { title: "Design", description: "Create custom designs that reflect your brand." },
      { title: "Develop", description: "Build your website with modern technologies." },
      { title: "Launch", description: "Deploy your website and provide ongoing support." },
    ],
    capabilities: [
      "WordPress web design & development — Yoast / RankMath SEO setup, clean code, responsive design",
      "Shopify store design & development — product pages, secure payment gateways, speed & mobile optimization",
      "Laravel web applications — custom portals, dashboards and scalable web apps",
      "Fixing or rebuilding down/broken websites",
    ],
    plans: [
      {
        name: "All-In-One Plan",
        audience: "Small businesses and startups",
        price: "$50",
        period: "/month",
        description: "Perfect for small businesses that want a professional website with ongoing support and maintenance.",
        features: ["Custom Website Design", "Mobile Responsive Website", "Basic SEO Setup", "Contact Form Integration", "Social Media Integration", "Monthly Updates & Maintenance", "Basic Analytics Setup", "Email Support", "1 Year Domain Included", "SSL Certificate Included"],
      },
      {
        name: "Rent-to-Own Plan",
        audience: "Growing businesses",
        price: "$100",
        period: "/month",
        description: "Build equity in your website while getting premium features and eventually own it outright.",
        features: ["Everything in All-In-One", "Advanced Custom Design", "E-commerce Functionality", "Advanced SEO Optimization", "Content Management System", "Weekly Updates & Maintenance", "Priority Support", "Advanced Analytics & Reporting", "Social Media Management Tools", "Email Marketing Integration", "Own Website After 12 Months"],
        highlighted: true,
      },
      {
        name: "One-Time Payment Plan",
        audience: "Established businesses",
        price: "$1,000",
        period: "one-time",
        description: "Complete website ownership from day one with all premium features and ongoing support.",
        features: ["Everything in Rent-to-Own", "Premium Custom Design", "Advanced E-commerce Features", "Complete SEO Package", "Custom Functionality", "Database Integration", "API Integrations", "Advanced Security Features", "Performance Optimization", "6 Months Free Support", "Full Website Ownership", "Source Code Included"],
      },
    ],
    planNote: "All plans include professional design, mobile optimization, and ongoing support.",
    startingPrice: "$50",
    faqs: [
      { question: "How long does it take to build a website?", answer: "Most websites are completed within 2-4 weeks, depending on the complexity and features required. We'll provide a detailed timeline during our initial consultation based on your specific needs." },
      { question: "What's the difference between the Rent-to-Own and One-Time Payment plans?", answer: "The Rent-to-Own plan allows you to pay monthly and own the website after 12 months, making it budget-friendly. The One-Time Payment plan gives you immediate ownership with all premium features and 6 months of free support." },
      { question: "Do you provide ongoing maintenance and support?", answer: "Yes! All our plans include ongoing support and maintenance. The All-In-One plan includes monthly updates, Rent-to-Own includes weekly updates, and One-Time Payment includes 6 months of free support with optional extended plans." },
      { question: "Can you help with content creation and copywriting?", answer: "Absolutely! We can help create compelling content for your website, including copywriting, product descriptions, and blog posts. This service is included in our higher-tier plans or available as an add-on." },
      { question: "Will my website be mobile-friendly?", answer: "Yes, all our websites are built with a mobile-first approach and are fully responsive. Your website will look and function perfectly on all devices - desktop, tablet, and mobile." },
    ],
    relatedSlugs: ["seo", "web-application-development", "business-management"],
    order: 1,
    featured: true,
    published: true,
    seo: {
      title: "Website Development Services — WordPress, Shopify & Laravel",
      description: "Fast, secure, mobile-friendly websites that rank on Google and convert visitors into customers. Plans from $50/month. Dallas, Denver & Calgary.",
    },
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "seo",
    title: "Website SEO",
    shortTitle: "SEO",
    icon: "search",
    categorySlug: "growth-marketing",
    tagline: "Stand out on Google with result-driven search engine optimization.",
    summary:
      "In-depth keyword research, on-page & off-page optimization, and quality backlink building to increase your organic traffic. Every SEO project includes well-crafted SEO content and eye-catching graphics.",
    heroTitle: "Rank higher. Get found. Grow organically.",
    heroSubtitle:
      "Boost your search engine rankings and drive more organic traffic to your website. Our proven SEO strategies help businesses get found online and increase their revenue.",
    overview:
      "We apply proven SEO strategies tailored to your business goals. From in-depth audits to complete technical and content optimization, our SEO services include everything needed to improve your visibility and grow traffic faster.",
    image: img("website-seo.webp", "Professional website SEO illustration"),
    problems: [
      { title: "Customers can’t find you", description: "If you don’t rank, customers searching for your products or services find your competitors instead." },
      { title: "Traffic that doesn’t convert", description: "SEO brings in high-intent visitors who are actively looking for what you offer." },
      { title: "Technical issues hurting rankings", description: "Site speed, mobile optimization, crawling and indexing problems quietly hold your website back." },
    ],
    included: [
      { title: "Audit & Strategy", items: ["Complete business audit and in-depth SEO analysis", "Keyword research & SEO strategy", "Competitor analysis & strategy"] },
      { title: "On-Page & Technical", items: ["On-page & off-page SEO implementation", "Advanced technical SEO for site performance and structure", "Internal linking strategy & URL optimization"] },
      { title: "Content & Authority", items: ["SEO-optimized blog posts", "Quality backlink building", "Eye-catching graphics included"] },
      { title: "Measurement", items: ["Google Analytics & tracking setup", "Monthly SEO performance reports", "Quarterly strategy reviews (Premium)"] },
    ],
    benefits: ["Increase visibility", "Drive quality traffic", "Boost revenue", "Long-term, sustainable growth"],
    process: seoProcess,
    capabilities: ["Keyword research", "Technical SEO audits", "On-page optimization", "Link building", "E-commerce & product page SEO", "Google Shopping optimization", "Local SEO"],
    plans: [
      {
        name: "Basic",
        audience: "Small websites or startups",
        price: "$40",
        period: "/month",
        description: "Small businesses or new websites looking for an affordable SEO boost to improve search rankings.",
        features: ["Keyword Research & SEO Strategy (5 Keywords)", "On-Page Optimization (Meta Tags, Headers, Alt Tags)", "Basic Technical SEO (Speed Optimization & Mobile-Friendliness)", "1 SEO-Optimized Blog Post (500 Words)", "Monthly SEO Performance Report"],
      },
      {
        name: "Standard",
        audience: "Consistent SEO growth",
        price: "$150",
        period: "/month",
        description: "Businesses that need ongoing SEO work to rank higher and attract more organic traffic.",
        features: ["Keyword Research & SEO Strategy (10 Keywords)", "Full On-Page Optimization (Title Tags, Meta Descriptions, Headers, Images, etc.)", "Technical SEO Fixes (Speed, Mobile Optimization, Indexing Issues)", "3 SEO-Optimized Blog Posts (750+ Words Each)", "Internal Linking Strategy & URL Optimization", "Local SEO Optimization (Google Business Profile Setup & Citations)", "Monthly SEO Performance Report & Growth Plan"],
        highlighted: true,
      },
      {
        name: "Premium",
        audience: "Top rankings & maximum traffic",
        price: "$300",
        period: "/month",
        description: "Established businesses seeking maximum SEO impact and market domination.",
        features: ["Comprehensive Keyword Research & SEO Strategy (20+ Keywords)", "Complete Technical SEO Audit & Implementation", "Advanced On-Page Optimization (All Pages)", "5 SEO-Optimized Blog Posts (1000+ Words Each)", "Advanced Link Building Strategy", "Local SEO Domination Package", "Competitor Analysis & Strategy", "Monthly SEO Reports & Quarterly Strategy Reviews", "Priority Support & Direct Access"],
      },
    ],
    startingPrice: "$40",
    faqs: [
      { question: "What is Website SEO?", answer: "Website SEO is the process of optimizing your site for search engines to improve its visibility and rankings on search engine results pages (SERPs). This involves optimizing both on-page elements (such as content and meta tags) and off-page factors (like backlinks)." },
      { question: "How long does SEO take to show results?", answer: "SEO is a long-term strategy, and it typically takes 3-6 months to see significant results. However, many websites start to see improvements in traffic and rankings within 2–3 months." },
      { question: "Can SEO help my local business?", answer: "Yes! We specialize in local SEO and can help your business rank in local search results, improving visibility in your community and driving local customers to your store or website." },
      { question: "Will you be creating content for my website?", answer: "Yes! Our team will work with you to create SEO-friendly content, including blog posts, landing pages, and product descriptions, that are optimized for both users and search engines." },
      { question: "Do you offer e-commerce SEO services?", answer: "Yes! We specialize in optimizing e-commerce websites, including product page SEO, category optimization, and strategies for improving Google Shopping rankings." },
    ],
    relatedSlugs: ["local-seo", "website-development", "business-management"],
    order: 2,
    featured: true,
    published: true,
    seo: {
      title: "Website SEO Services — Rank Higher & Grow Organic Traffic",
      description: "Keyword research, technical SEO, on-page optimization, content and link building. SEO plans from $40/month for businesses across the USA and Canada.",
    },
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "local-seo",
    title: "Local SEO",
    shortTitle: "Local SEO",
    icon: "map-pin",
    categorySlug: "growth-marketing",
    tagline: "Dominate your local market on Google Search and Maps.",
    summary:
      "Our Local SEO service helps businesses dominate their area by optimizing Google Business Profile, creating location-based content, and building local citations — with location-specific SEO content and professional graphics included.",
    heroTitle: "Dominate your local market.",
    heroSubtitle:
      "Get found by customers in your area with our comprehensive Local SEO services. From map citations to local listings, we help your business rank higher in local search results and attract more customers.",
    overview:
      "Our Local SEO service is built to grow your business within your target area. We apply proven local ranking strategies and provide 100% manual work with real results. Most clients see local ranking improvements within just 3 months.",
    image: img("local-seo.webp", "Local SEO — dominate your local market illustration"),
    problems: [
      { title: "Invisible in local searches", description: "When nearby customers search for your services, you need to appear on Google Maps and local directories — not your competitors." },
      { title: "Missed calls and foot traffic", description: "Local customers who are ready to buy go to whichever business shows up first." },
      { title: "Competitors own the map pack", description: "Outrank your competitors in local search results and Google Maps to capture more market share." },
    ],
    included: [
      { title: "Google Business Profile", items: ["Google Business Profile optimization & regular updates", "GBP optimization", "Review management setup"] },
      { title: "Citations & Listings", items: ["Map citations & local listings", "Map directions and map backlinks", "Build local citations and geo-targeted backlinks"] },
      { title: "Local Content", items: ["Location-specific SEO content", "Professional graphics for posts, maps and promotions", "Local schema markup"] },
      { title: "Reporting", items: ["100% manual work with detailed reporting", "Monthly, bi-weekly or weekly progress reports", "Competitor monitoring"] },
    ],
    benefits: [
      "Higher local search rankings",
      "Increased website traffic",
      "More phone calls and inquiries",
      "Better GBP visibility",
      "Improved online reputation",
      "Higher conversion rates",
    ],
    process: seoProcess,
    capabilities: ["Google Business Profile", "Google Maps ranking", "Map citations", "Local backlinks", "Local schema markup", "Review management", "Competitor monitoring"],
    plans: [
      {
        name: "Basic",
        audience: "Small businesses and startups",
        price: "$40",
        period: "/month",
        description: "Perfect for small businesses or startups looking to improve local rankings and visibility.",
        features: ["Business Analysis", "Competitors Analysis", "250 Map Citations", "10 Map Directions", "10 Map Backlinks", "Monthly Progress Report", "Email Support"],
      },
      {
        name: "Standard",
        audience: "Growing businesses",
        price: "$150",
        period: "/month",
        description: "Designed for growing businesses looking to increase local visibility and improve rankings.",
        features: ["Everything in Basic", "Keyword research & targeting", "1000 Map Citations", "20 Map Directions", "20 Map Backlinks", "GBP Optimization", "Review Management Setup", "Bi-weekly Progress Reports", "Priority Email Support"],
        highlighted: true,
      },
      {
        name: "Premium",
        audience: "Established businesses",
        price: "$300",
        period: "/month",
        description: "A powerful package for businesses serious about dominating their local market.",
        features: ["Everything in Standard", "Citation and Local Listings", "1000 Map Citations", "20 Map Directions", "20 Map Backlinks", "50 Building & Local Listings", "Local Schema Markup", "Competitor Monitoring", "Weekly Progress Reports", "Phone & Email Support", "Monthly Strategy Calls"],
      },
    ],
    planNote: "All plans include our core Local SEO services with varying levels of intensity and features.",
    startingPrice: "$40",
    faqs: [
      { question: "How long does it take to see Local SEO results?", answer: "Most businesses start seeing improvements in local rankings within 2-4 weeks, with significant results typically visible within 2-3 months. Local SEO is faster than traditional SEO because it targets a smaller geographic area." },
      { question: "What's the difference between the pricing plans?", answer: "The Basic plan is perfect for small businesses just starting with Local SEO. The Standard plan includes keyword research and more citations for growing businesses. The Premium plan adds comprehensive citation building for businesses serious about dominating their local market." },
      { question: "Do you work with businesses in all industries?", answer: "Yes, our Local SEO services work for businesses in all industries. We customize our approach based on your specific market, competition, and target audience to ensure maximum effectiveness." },
      { question: "What's included in the monthly reports?", answer: "Our reports include local ranking improvements, Google Business Profile insights, citation status updates, and recommendations for continued growth. You'll see exactly how your investment is performing." },
      { question: "Can I cancel anytime?", answer: "Yes, there are no long-term contracts. You can cancel your service at any time with 30 days' notice. We're confident in our results and believe you'll see the value in continuing our partnership." },
    ],
    relatedSlugs: ["seo", "business-management", "google-ads"],
    order: 3,
    featured: true,
    published: true,
    seo: {
      title: "Local SEO Services — Rank on Google Maps in Dallas, Denver & Calgary",
      description: "Google Business Profile optimization, map citations, local backlinks and 100% manual work with detailed reporting. Local SEO plans from $40/month.",
    },
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "social-media-marketing",
    title: "Social Media Marketing",
    shortTitle: "Social Media",
    icon: "share-2",
    categorySlug: "growth-marketing",
    tagline: "Build engagement and brand awareness where your customers spend their time.",
    summary:
      "Grow your online presence with targeted social media marketing. We create engaging posts, manage ad campaigns, and interact with your audience — every campaign comes with SEO-focused captions, hashtags, and free high-quality visuals.",
    heroTitle: "Amplify your social presence.",
    heroSubtitle:
      "Build a powerful social media presence that engages your audience, drives traffic, and grows your business across all major platforms.",
    overview:
      "We manage your social presence across top-performing platforms to grow your audience, drive traffic, and boost brand trust. Our creative strategy and consistent posting help businesses stay active and engaging online.",
    image: img("social-media-marketing.webp", "Social media marketing services illustration"),
    problems: [
      { title: "Inconsistent posting", description: "Strategic content scheduling and consistent posting keep your audience engaged and your brand top-of-mind." },
      { title: "Low brand awareness", description: "Social media amplifies your message and gets your brand in front of potential customers." },
      { title: "Engagement that never becomes revenue", description: "Convert social engagement into real business results — leads, traffic and sales." },
    ],
    included: [
      { title: "Content Creation & Design", items: ["Custom graphic design", "Brand-consistent visuals", "Engaging copy writing"] },
      { title: "Profile Optimization", items: ["Profile setup & branding", "Bio optimization", "Contact information setup"] },
      { title: "Content Scheduling & Posting", items: ["Strategic posting schedule", "Optimal timing analysis", "Consistent brand presence"] },
      { title: "Community Management", items: ["Comment management", "Message responses", "Community engagement"] },
      { title: "Analytics & Reporting", items: ["Performance metrics", "Growth tracking", "ROI analysis"] },
      { title: "Strategy Development", items: ["Goal-oriented planning", "Audience targeting", "Competitive analysis"] },
    ],
    benefits: ["Build community", "Increase brand awareness", "Drive sales & leads", "SEO-focused captions & hashtags"],
    process: [
      { title: "Strategy", description: "We analyze your target audience, industry, and business goals to recommend the most effective platforms." },
      { title: "Profiles & Content", description: "Profile setup and optimization, plus custom image design tailored to your brand voice." },
      { title: "Publish & Engage", description: "Consistent posting and active community management across your chosen platforms." },
      { title: "Measure", description: "Detailed analytics showing engagement, follower growth, reach and ROI." },
    ],
    capabilities: ["Facebook", "Instagram", "X (Twitter)", "LinkedIn", "TikTok", "Pinterest", "YouTube", "Yelp", "Medium", "Reddit", "Quora", "Tumblr", "Google Business Profile"],
    plans: [
      {
        name: "Basic",
        audience: "Establishing a presence",
        price: "$40",
        period: "/month",
        description: "Small businesses or individuals starting their social media journey.",
        features: ["Facebook Management", "Profile Creation and Optimization", "Custom Image Design & Content", "Weekly Posts (Total - 10 posts)", "Basic Analytics & Reporting", "Email Support"],
      },
      {
        name: "Standard",
        audience: "Multi-platform presence",
        price: "$150",
        period: "/month",
        description: "Growing businesses wanting consistent multi-platform presence.",
        features: ["Facebook / Instagram / Yelp / Medium / Twitter Management (choose your own)", "Profile Creation and Optimization", "Custom Image Design & Content", "Weekly Posts 2-4", "Monthly 12+ posts on each profile", "Community Management & Engagement", "Monthly Analytics & Performance Reports", "Priority Email Support"],
        highlighted: true,
      },
      {
        name: "Premium",
        audience: "Social media dominance",
        price: "$300",
        period: "one-time",
        description: "Established businesses seeking comprehensive social media dominance.",
        features: ["Facebook / Instagram / Yelp / Medium / Twitter / TikTok / Pinterest / X / Quora / Reddit Management (choose your own)", "Profile Creation and Optimization", "Weekly Posts 2-4 per platform", "Advanced Content Strategy & Planning", "Influencer Outreach & Collaboration", "Advanced Analytics & ROI Tracking", "Monthly Strategy Consultations", "Phone & Email Support"],
      },
    ],
    startingPrice: "$40",
    faqs: [
      { question: "How do you choose which platforms to focus on for my business?", answer: "We analyze your target audience, industry, and business goals to recommend the most effective platforms. Different platforms work better for different types of businesses - we'll help you choose the right mix for maximum impact." },
      { question: "What's included in the custom image design?", answer: "Our custom image design includes branded graphics, promotional images, quote cards, product showcases, and any visual content needed for your posts. All designs follow your brand guidelines and are optimized for each platform." },
      { question: "How often will you post on my social media accounts?", answer: "Posting frequency varies by plan. Basic includes weekly posts, Standard includes 2-4 weekly posts with 12+ monthly posts per profile, and Premium includes 2-4 weekly posts per platform with advanced content strategy." },
      { question: "Do you provide analytics and reporting?", answer: "Yes, all plans include regular reporting. You'll receive detailed analytics showing engagement rates, follower growth, reach, and other key metrics to track your social media performance and ROI." },
    ],
    relatedSlugs: ["google-ads", "business-management", "local-seo"],
    order: 4,
    featured: true,
    published: true,
    seo: {
      title: "Social Media Marketing Services — Facebook, Instagram & More",
      description: "Content creation, custom graphics, community management and reporting across Facebook, Instagram, TikTok, LinkedIn and more. Plans from $40/month.",
    },
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "google-ads",
    title: "Google Ads & Advertising",
    shortTitle: "Google Ads",
    icon: "mouse-pointer-click",
    categorySlug: "growth-marketing",
    tagline: "Drive targeted traffic and real conversions with managed ad campaigns.",
    summary:
      "Drive quick results with expertly managed Google Ads campaigns. High-converting ads with precise targeting, A/B testing, and conversion tracking — plus SEO-optimized landing page content and free ad banner graphics.",
    heroTitle: "Drive results with smart advertising.",
    heroSubtitle:
      "From Google Ads to social media campaigns, we create and manage high-performing ad campaigns that drive real business results at the lowest possible cost.",
    overview:
      "We run high-performing ad campaigns using the best strategies to help you get more leads, more sales, and faster growth. From search to social, we manage everything — Google Ads, PPC, Meta (Facebook & Instagram) Ads and Product Ads — to ensure your ads deliver maximum ROI.",
    image: img("advertising.webp", "Advertising key on a keyboard with a megaphone"),
    problems: [
      { title: "Ad spend without results", description: "Every campaign is tracked and optimized for return on investment, so your ad spend delivers real business value." },
      { title: "One-size-fits-all campaigns", description: "We create customized Google Ads and social strategies tailored to your industry, audience and objectives." },
      { title: "No visibility into performance", description: "Comprehensive reporting with CTR, CPC, ROI and conversion data — you always know how campaigns perform." },
    ],
    included: [
      { title: "Google Ads Management", description: "Target the right audience at the right time with campaigns that drive leads, traffic, and real ROI.", items: ["Search, display and video ads", "Keyword research and targeting", "Conversion tracking"] },
      { title: "PPC Campaign Strategy", description: "Conversion-focused pay-per-click advertising designed to deliver fast, measurable results.", items: ["Bid management and optimization", "Quality score optimization", "Smart bidding strategies"] },
      { title: "Meta Ads (Facebook & Instagram)", description: "Reach millions through engaging, targeted ads — perfect for awareness, traffic and retargeting.", items: ["Custom audience segmentation", "Remarketing", "Platform-specific optimization"] },
      { title: "Product Ads & eCommerce", description: "High-converting product ads across Google Shopping, Facebook Catalog and Instagram.", items: ["Ad creation and copywriting", "A/B testing for better results", "Free ad banner graphics"] },
    ],
    benefits: ["Goal-oriented campaigns", "Measurable ROI", "Continuous optimization", "Complete transparency & reporting"],
    process: [
      { title: "Business goal analysis", description: "We start by understanding your business objectives." },
      { title: "Campaign strategy development", description: "Industry-specific targeting and audience research." },
      { title: "Implementation and launch", description: "Campaign setup, ad design and copywriting." },
      { title: "Monitor and optimize", description: "Constant monitoring and A/B testing to reduce costs and increase conversions." },
      { title: "Report and scale", description: "Monthly reporting and insights to scale what works." },
    ],
    capabilities: ["Google Ads", "PPC", "Meta Ads", "Google Shopping", "Facebook Catalog", "Remarketing", "Conversion tracking", "Landing page content"],
    plans: [
      {
        name: "Ad Campaign Management",
        audience: "Complete advertising solution",
        price: "$200",
        period: "/month + ad budget",
        description: "Development, management, and optimization of your paid campaigns across Google Ads, Facebook, Instagram, and more. Your ad budget is up to you.",
        features: ["Campaign strategy development", "Campaign setup and configuration", "Keyword research and targeting", "Ad design & copywriting", "Targeted audience research and segmentation", "Bid management and optimization", "Monthly reporting and performance analytics", "Optimization & A/B testing to maximize ROI"],
        highlighted: true,
      },
    ],
    startingPrice: "$200",
    faqs: [
      { question: "How do Google Ads help my business?", answer: "Google Ads puts your business in front of people actively searching for your products or services, driving highly targeted traffic. Our Google Ads campaigns help increase visibility, boost conversions, and maximize ROI with low-cost advertising." },
      { question: "How can social media ads benefit my business?", answer: "Social media ads allow you to reach potential customers where they spend the most time online. With precise targeting, creative content, and strategic optimization, social media ads can increase brand awareness, drive traffic, and boost sales." },
      { question: "What is remarketing, and how does it work?", answer: "Remarketing is the process of targeting users who have interacted with your business but haven't yet converted. We show them tailored ads across different platforms to encourage them to return and complete their purchase." },
      { question: "What is the average cost of a Google Ads campaign?", answer: "The cost of a Google Ads campaign depends on factors like keyword competition, your industry, and your ad goals. At Jarz Digital, we work within your budget to achieve the best possible results while keeping costs efficient." },
      { question: "How soon can I expect to see results from ad campaigns?", answer: "You can see measurable results within days to weeks, depending on your industry and campaign setup. We constantly monitor and optimize ads to ensure continuous improvements and higher conversions over time." },
      { question: "Can you run ads for any business, regardless of size or industry?", answer: "Absolutely! We run Google Ads and social media ads for businesses of all sizes and industries, tailoring each campaign to meet your unique needs and goals." },
    ],
    relatedSlugs: ["social-media-marketing", "local-seo", "business-management"],
    order: 5,
    featured: true,
    published: true,
    seo: {
      title: "Google Ads & PPC Management — Dallas, Denver & Calgary",
      description: "Google Ads, PPC, Meta Ads and Product Ads managed for maximum ROI. Campaign management from $200/month plus your ad budget.",
    },
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "business-management",
    title: "Monthly Business Management",
    shortTitle: "Business Management",
    icon: "briefcase-business",
    categorySlug: "growth-marketing",
    tagline: "Local SEO, website SEO, social media and Google Ads — managed as one.",
    summary:
      "Brand enhancement plus website updates, content management, analytics reporting, and mid-term strategy changes and support — everything you need to keep your business running seamlessly in the digital world.",
    heroTitle: "Your entire digital presence, managed as one.",
    heroSubtitle:
      "We combine Local SEO, Website SEO, and tailored Social Media Management into one powerful service designed to accelerate your online growth and maximize performance across all platforms.",
    overview:
      "Our Monthly Business Management service helps your business with brand enhancement and provides website updates, content management, analytics reporting, and even mid-term strategy changes and support. As part of your plan, we also design custom graphics that boost brand visibility alongside SEO-optimized text that further improves your online presence.",
    image: img("business-management.webp", "Full business management package illustration"),
    problems: [
      { title: "Juggling multiple vendors", description: "Everything you need for digital success in one comprehensive package — no need to juggle multiple vendors." },
      { title: "No time to manage marketing", description: "Focus on running your business while we handle all aspects of your digital marketing and online presence." },
      { title: "Disconnected channels", description: "A unified strategy managed by one expert team ensures consistency and better results across every channel." },
    ],
    included: [
      { title: "Local SEO", description: "Get found by customers in your area.", items: ["Google Business Profile optimization", "Local citation building", "Review management", "Local keyword targeting", "Map pack optimization"] },
      { title: "Website SEO", description: "Improve rankings and drive organic traffic.", items: ["On-page SEO optimization", "Technical SEO audit & fixes", "Content optimization", "Link building strategy", "Keyword research & targeting"] },
      { title: "Social Media Management", description: "Build your brand presence and engage your audience.", items: ["Content creation & posting", "Community management", "Social media strategy", "Brand consistency", "Performance analytics"] },
      { title: "Google Ads Campaigns", description: "Expertly managed campaigns tailored to your business.", items: ["Campaign setup & management", "Keyword targeting", "Ad copywriting", "Bid & budget optimization", "Performance tracking"] },
    ],
    benefits: [
      "Monthly SEO reports and analytics",
      "Social media content calendar",
      "Dedicated account manager",
      "Regular strategy consultations",
      "24/7 support and monitoring",
      "Competitive analysis and insights",
    ],
    process: [
      { title: "Discovery & Audit", description: "We analyze your current digital presence, competitors, and market opportunities to create a customized strategy." },
      { title: "Strategy Development", description: "Our team creates a comprehensive plan covering SEO, social media, and content strategies tailored to your business." },
      { title: "Implementation", description: "We execute the strategy across all channels, optimizing your website, managing social media, and building local presence." },
      { title: "Monitor & Optimize", description: "Continuous monitoring, reporting, and optimization to ensure maximum performance and ROI for your investment." },
    ],
    capabilities: ["Local SEO", "Website SEO", "Social media management", "Google Ads", "Website updates & content management", "Custom graphics", "Analytics reporting"],
    plans: [
      {
        name: "Full Business Management Package",
        audience: "Most popular",
        price: "$1,000",
        period: "/month",
        description: "Everything you need to dominate your market: Local SEO, Website SEO, Social Media Management, and ongoing optimization.",
        features: ["Local SEO", "Website SEO", "Social Media Management", "Google Ads campaign management", "Dedicated account manager", "No setup fees", "Cancel anytime", "30-day money-back guarantee"],
        highlighted: true,
      },
    ],
    planNote: "One comprehensive package that covers all your digital marketing needs at a fraction of the cost of hiring multiple specialists.",
    startingPrice: "$1,000",
    faqs: [
      { question: "What makes this different from other digital marketing services?", answer: "Our Full Business Management Services Package is a comprehensive, all-in-one solution that combines Local SEO, Website SEO, and Social Media Management under one roof. Instead of working with multiple vendors, you get a unified strategy managed by our expert team, ensuring consistency and better results across all channels." },
      { question: "How long does it take to see results?", answer: "While some improvements can be seen within the first month (especially in social media engagement and local listings), significant SEO results typically take 3-6 months. We provide monthly reports so you can track progress and see the value of our work from day one." },
      { question: "Do you work with businesses in all industries?", answer: "Yes, our Business Management Package is designed to work for businesses across all industries. We customize our approach based on your specific market, competition, and target audience to ensure maximum effectiveness." },
      { question: "What's included in the monthly reporting?", answer: "Our monthly reports include SEO rankings, website traffic analytics, local search performance, social media growth metrics, and actionable insights for continued improvement. You'll have full transparency into the work being done and results achieved." },
      { question: "Can I cancel anytime?", answer: "Yes, there are no long-term contracts. You can cancel your service at any time with 30 days' notice. We're confident in our results and believe you'll see the value in continuing our partnership." },
    ],
    relatedSlugs: ["local-seo", "seo", "social-media-marketing"],
    order: 6,
    featured: true,
    published: true,
    seo: {
      title: "Monthly Business Management — SEO, Social & Ads in One Package",
      description: "Local SEO, website SEO, social media management and Google Ads managed as one package for $1,000/month. No setup fees, cancel anytime.",
    },
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "web-application-development",
    title: "Web Application Development",
    shortTitle: "Web Applications",
    icon: "app-window",
    categorySlug: "design-development",
    tagline: "Custom, scalable web applications that streamline your operations.",
    summary:
      "From e-commerce platforms to enterprise solutions, we build custom web applications — portals, dashboards, marketplaces and booking systems — with clean code, security and SEO-ready structure.",
    heroTitle: "Custom web applications, built to scale.",
    heroSubtitle:
      "Transform your business with powerful, scalable web application development. From e-commerce platforms to enterprise solutions, we build custom applications that drive growth and streamline your operations.",
    overview:
      "For advanced functionality, high-speed performance, and secure backend systems, we build custom web applications — perfect for businesses needing custom portals, dashboards, or scalable web apps. Best for SaaS platforms, web portals, custom CRM, and booking apps.",
    image: img("web-application-development.webp", "Web application development illustration"),
    problems: [
      { title: "Outgrowing a static website", description: "When you need stock administration, customer profiles or real-time updates, a web application offers the ideal customer interface." },
      { title: "Manual, disconnected processes", description: "Custom applications tailored to your processes replace spreadsheets and disconnected tools." },
      { title: "Security and performance risks", description: "Applications designed to handle high traffic while maintaining strict security standards." },
    ],
    included: [
      { title: "Custom Solutions", items: ["Tailored to your business needs", "Scalable architecture", "Modern technology stack"] },
      { title: "Security & Performance", items: ["Enterprise-grade security", "Optimized performance", "Regular security updates"] },
      { title: "Mobile-First Design", items: ["Responsive design", "Progressive Web App support", "Cross-platform compatibility"] },
      { title: "Ongoing Support", items: ["24/7 technical support", "Regular updates and maintenance", "Feature enhancements"] },
    ],
    benefits: ["Streamlined operations", "Scales with your business", "Secure by default", "Works flawlessly on mobile and tablet"],
    process: [
      { title: "Discovery & Planning", description: "We analyze your requirements, define project scope, and create a detailed development roadmap tailored to your business goals." },
      { title: "Design & Prototyping", description: "Our design team creates intuitive user interfaces and interactive prototypes to visualize your application before development begins." },
      { title: "Development & Testing", description: "We build your application using modern technologies and conduct thorough testing to ensure quality, security, and performance." },
      { title: "Launch & Support", description: "We deploy your application and provide ongoing support, maintenance, and feature enhancements to ensure continued success." },
    ],
    capabilities: ["Laravel", "E-commerce web apps", "Inventory & order management", "Multi-vendor marketplaces", "Admin panels", "Payment gateway integration", "CRM/ERP API integrations", "Progressive Web Apps"],
    plans: [
      {
        name: "Basic",
        audience: "Establishing an online presence",
        price: "$1,000",
        period: "/month",
        description: "Perfect for small businesses looking to establish an online presence.",
        features: ["E-commerce Web App", "Inventory Management System", "User-friendly Admin Panel", "Secure Payment Gateway Integration", "Responsive Design (Mobile & Desktop)", "Basic SEO Optimization", "1 Month Free Support"],
      },
      {
        name: "Medium",
        audience: "Growing businesses",
        price: "$2,500",
        period: "/month",
        description: "Ideal for growing businesses that require more advanced features.",
        features: ["Multi-Vendor Support (For Marketplace)", "Advanced Inventory & Order Management", "Customizable Product Variants & Filters", "Customer Reviews & Ratings", "Automated Email & SMS Notifications", "Social Media Integration", "Advanced Security & Performance Optimization", "3 Months Free Support"],
        highlighted: true,
      },
      {
        name: "Large",
        audience: "Enterprises",
        price: "$5,000",
        period: "one-time",
        description: "Designed for enterprises that need a complete, high-performance solution.",
        features: ["AI-Powered Product Recommendations", "Advanced Analytics & Reporting Dashboard", "Custom API Integrations (CRM, ERP, etc.)", "Progressive Web App (PWA) Support", "Advanced Search & Filtering (AI-based)", "Loyalty & Reward Program Integration", "Multi-Language & Multi-Currency Support", "6 Months Free Support & Maintenance"],
      },
    ],
    startingPrice: "$1,000",
    faqs: [
      { question: "What is the difference between a web application and a website?", answer: "A web application provides rich and interactive features that allow various dynamic tasks, such as updating data, logging into personal profiles, and making transactions. A website, however, is mostly static and its content is presented without further interactivity." },
      { question: "Why should I transfer my website to become a web application?", answer: "If your business wants to evolve by utilizing features like stock administration, consumers' profiles, and real-time updates, then a web application will offer an ideal customer interface." },
      { question: "Do you also provide mobile applications?", answer: "While we specialize in web applications, all our applications are totally mobile-optimized and adaptable. Our apps work flawlessly on mobiles as well as tablets without the necessity of building separate mobile apps." },
      { question: "On average, how long would it take to develop a custom web application?", answer: "The timeline depends entirely on the complexity of the application. This can vary from a few weeks to a few months, but after we understand your requirements, we will provide you with an estimated timeline." },
      { question: "Can you provide web application maintenance and updating?", answer: "Definitely! We provide continuous support and maintenance to help your web application run well and upgrade its technology over time." },
      { question: "How secure will my web application be?", answer: "We prioritize security in every project. We use SSL encryption, data protection protocols, and secure login systems to ensure your application is safe and your users' data is protected." },
    ],
    relatedSlugs: ["software-development", "website-development", "seo"],
    order: 7,
    featured: false,
    published: true,
    seo: {
      title: "Web Application Development — Custom Portals, Dashboards & E-commerce",
      description: "Custom web applications built with Laravel and modern stacks: e-commerce, inventory, marketplaces, dashboards and API integrations.",
    },
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "software-development",
    title: "Software Development",
    shortTitle: "Software",
    icon: "code-xml",
    categorySlug: "design-development",
    tagline: "Premium, high-performance custom software built on modern technology.",
    summary:
      "A premium, high-performance, and scalable solution covering web, e-commerce, inventory management, and custom software development using the latest technologies.",
    heroTitle: "Custom software development.",
    heroSubtitle:
      "A premium, high-performance, and scalable solution covering web, e-commerce, inventory management, and custom software development using the latest technologies.",
    overview:
      "Jarz Digital appreciates that the uniqueness of each business gives rise to custom software needs. Our software development services deliver scalable solutions with rich features that correspond to your business prospects — from custom web-view applications to cross-platform software with AI integration and process automation.",
    image: img("software-development.webp", "Software development illustration"),
    problems: [
      { title: "Off-the-shelf tools that don’t fit", description: "Tailored software designed specifically for your business needs and requirements." },
      { title: "Systems that don’t talk to each other", description: "We create software that integrates seamlessly with your existing systems, databases and third-party services." },
      { title: "Manual work that should be automated", description: "Process automation and AI integration remove repetitive work from your team." },
    ],
    included: [
      { title: "Web & E-commerce", description: "Complete web and e-commerce solutions with advanced features.", items: ["Online shop development", "Payment gateway integration", "Inventory management", "Multi-vendor platforms", "AI-powered features"] },
      { title: "Custom Software", description: "Tailored solutions for your specific requirements.", items: ["Cross-platform applications", "AI integration", "Process automation", "API development", "Database design"] },
      { title: "Technology Stack", description: "Modern technologies to build robust, scalable, secure applications.", items: ["PHP, Java, C++, Python", "React, Vue.js frameworks", "AWS, Azure cloud platforms", "Docker, Kubernetes", "CI/CD pipelines"] },
    ],
    benefits: [
      "High-speed performance & caching",
      "Enterprise-grade security",
      "AI & automation integration",
      "Real-time analytics & reporting",
      "24/7 support & monitoring",
      "12 months free support",
    ],
    process: [
      { title: "Requirements Analysis", description: "We analyze your business needs, technical requirements, and project scope to create a detailed development plan." },
      { title: "Design & Architecture", description: "Our team designs the software architecture, user interface, and database structure for optimal performance and scalability." },
      { title: "Development & Testing", description: "We build your software using modern technologies, conduct thorough testing, and ensure quality at every stage." },
      { title: "Deployment & Support", description: "We deploy your software, provide training, and offer ongoing support and maintenance to ensure continued success." },
    ],
    capabilities: ["PHP", "Java", "C++", "Python", "React", "Vue.js", "AWS", "Azure", "Docker", "Kubernetes", "CI/CD"],
    plans: [
      {
        name: "Custom Software Development",
        audience: "Premium package",
        price: "$10,000",
        period: "/month",
        description: "A premium, high-performance, and scalable solution covering web, e-commerce, inventory management, and custom software development using the latest technologies.",
        features: ["High-speed performance & caching", "Enterprise-grade security", "AI & automation integration", "Real-time analytics & reporting", "24/7 support & monitoring", "12 months free support", "No setup fees", "Flexible terms", "30-day consultation period"],
        highlighted: true,
      },
    ],
    startingPrice: "$10,000",
    faqs: [
      { question: "What types of software do you develop?", answer: "We develop a wide range of software solutions including web applications, e-commerce platforms, inventory management systems, custom business software, mobile applications, and enterprise solutions using modern technologies like PHP, Java, Python, React, and Vue.js." },
      { question: "How long does software development take?", answer: "Development timelines vary based on project complexity and requirements. Simple applications may take 2-3 months, while complex enterprise solutions can take 6-12 months. We provide detailed timelines during the planning phase and keep you updated throughout the process." },
      { question: "Do you provide ongoing support and maintenance?", answer: "Yes, we provide 12 months of free support and maintenance with every software development project. This includes bug fixes, security updates, performance optimization, and technical support. Extended support packages are also available." },
      { question: "Can you integrate with existing systems?", answer: "Absolutely! We specialize in creating software that integrates seamlessly with your existing systems, databases, and third-party services. Our team has extensive experience with API development and system integration." },
      { question: "What security measures do you implement?", answer: "Security is our top priority. We implement enterprise-grade security measures including data encryption, multi-factor authentication, secure APIs, regular security audits, and compliance with industry standards to protect your software and data." },
    ],
    relatedSlugs: ["web-application-development", "website-development", "business-management"],
    order: 8,
    featured: false,
    published: true,
    seo: {
      title: "Custom Software Development Services",
      description: "Custom software, web-view applications, e-commerce and inventory systems built with modern stacks — with 12 months of free support.",
    },
  },
];
