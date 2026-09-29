/**
 * Founder profile shown at /rokonuzzaman-jony. Facts come from Jony’s CV
 * (September 2026); the photo, name and socials still come from the Team
 * entry so Admin → Team edits apply here too.
 */
export const founderProfile = {
  fullName: "Md Rokonuzzaman Jony",
  title: "Founder & CEO, Jarz Digital",
  specialties: ["SEO strategist", "Web developer", "AI automation expert"],
  location: "Dhaka, Bangladesh",
  whatsapp: "+8801677248045",
  whatsappDisplay: "+880 1677-248045",
  email: "jarzdigitalltd@gmail.com",
  website: { label: "jarzdigital.com", href: "/" },
  offices: ["Dallas", "Calgary", "Cork", "Dhaka"],

  intro:
    "Since 2015 I’ve helped local and national businesses across the USA, Canada, the UK and beyond rank on Google and in AI-powered search — and turn that visibility into sales.",

  summary: [
    "I’m the founder and CEO of Jarz Digital, a USA-based IT and digital marketing agency with remote offices in Dallas (USA), Calgary (Canada) and Cork (Ireland), and a physical office in Dhaka (Bangladesh). I lead a team of 15–20 in-house and remote specialists.",
    "Before building the agency I was a Fiverr Top Rated Seller with a 5.0-star rating, and in 2023 I was a top-ranked Local SEO expert on Fiverr. Across 800–1,000+ projects I’ve combined website development, technical and local SEO, and AI automation to turn online visibility into measurable sales.",
  ],

  achievements: [
    { value: "10+", label: "Years of experience" },
    { value: "800–1,000+", label: "Projects delivered" },
    { value: "500+", label: "Websites developed" },
    { value: "300+", label: "Businesses ranked & grown" },
    { value: "400+", label: "Businesses managed" },
    { value: "100+", label: "Social media brands managed" },
    { value: "30+", label: "Businesses #1 in AI search" },
    { value: "5.0 ★", label: "Fiverr Top Rated Seller" },
  ],

  competencies: [
    { title: "Local SEO & Google Business Profile", icon: "map", service: "/services/local-seo" },
    { title: "AI Search Optimization (GEO / AEO)", icon: "sparkles" },
    { title: "E-commerce Development (React / Next.js)", icon: "shop", service: "/services/web-application-development" },
    { title: "Social Media Management", icon: "share", service: "/services/social-media-marketing" },
    { title: "Team Leadership & Client Management", icon: "users" },
    { title: "Technical & On-Page SEO", icon: "search", service: "/services/seo" },
    { title: "Website Design & Development", icon: "monitor", service: "/services/website-development" },
    { title: "AI Automation & Integration", icon: "bot" },
    { title: "Digital Marketing Strategy", icon: "compass", service: "/services/business-management" },
    { title: "Conversion & Growth Strategy", icon: "growth" },
  ],

  experience: [
    {
      role: "Founder & Chief Executive Officer",
      period: "2019 – Present",
      company: "Jarz Digital",
      place: "Dallas, Calgary, Cork and Dhaka",
      points: [
        "Founded and scaled a USA-based IT and digital marketing agency serving clients in the USA, Canada, the UK and Bangladesh.",
        "Lead a team of 15–20 in-house and remote specialists across SEO, web development, social media and AI automation.",
        "Ranked and grew 300+ businesses, developed 500+ websites, and manage 400+ business accounts and 100+ social media brands.",
        "Pioneered AI search optimization, ranking 30+ businesses as the first result in AI-generated answers.",
        "Opened the Dhaka office to bring US-standard React, Next.js and Node.js development to Bangladeshi businesses.",
      ],
    },
    {
      role: "SEO & Web Development Specialist",
      period: "2020 – 2023",
      company: "Prosper Media, Canadian marketing agency",
      place: "Canada (remote)",
      points: [
        "Delivered SEO and website projects for Canadian businesses in markets including Toronto, Mississauga, Brampton, Calgary and Richmond Hill.",
        "Improved local search rankings and online visibility for agency clients as part of a remote, cross-border team.",
      ],
    },
    {
      role: "Top Rated Seller, SEO & Web Development",
      period: "2015 – 2023",
      company: "Fiverr (freelance)",
      place: "Global",
      points: [
        "Earned Top Rated Seller status with a 5.0-star rating; recognized as a 2023 top-ranked Local SEO expert on Fiverr.",
        "Delivered local SEO, website design and development for clients around the world.",
      ],
    },
    {
      role: "Early career",
      period: "2016 – 2019",
      company: "Technology & engineering roles",
      place: "Bangladesh",
      points: [
        "Software company, Bangladesh (2018 – 2019): head of SEO & digital marketing.",
        "Rooppur Nuclear Power Plant (2017): supply chain.",
        "Truck Lagbe (2016): supply chain.",
      ],
    },
  ],

  tools: [
    { group: "Web development", items: ["React.js", "Next.js", "Node.js", "WordPress", "HTML5", "CSS3", "JavaScript"] },
    { group: "SEO", items: ["Ahrefs", "Semrush", "Surfer SEO", "Rank Math", "Google Search Console", "Google Analytics", "Google Business Profile"] },
    { group: "AI & automation", items: ["Claude", "ChatGPT", "Gemini", "n8n"], note: "AI automation, integration and AI search optimization." },
  ],
  toolsNote: "Proficient in 15+ specialized tools across SEO, development, design and automation.",

  education: { degree: "B.Sc. in Computer Engineering", detail: "4-year program", school: "World University of Bangladesh" },
  certifications: {
    summary: "10+ professional certifications completed. All certificates are available on request.",
    items: ["Local SEO", "Search Engine Optimization (SEO)", "Website Development", "Website Design", "Graphic Design", "Java Programming Language"],
  },
  activities: ["National Debating Certificate", "Scouting Certificate", "Social work & volunteer service", "Drawing & visual arts"],
} as const;
