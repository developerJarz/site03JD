# Graph Report - jarzdigital-next  (2026-09-30)

## Corpus Check
- Large corpus: 311 files · ~790,552 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 1538 nodes · 5249 edges · 88 communities (69 shown, 19 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 113 edges (avg confidence: 0.86)
- Token cost: 507,600 input · 0 output

## Community Hubs (Navigation)
- API Routes & Infrastructure
- Blog & Public Content Queries
- Marketing Page Building Blocks
- CMS Resource Registry & Editor
- Auth & Account Actions
- Sessions & Admin Shell
- Migration Scripts & Dev DB
- Admin List Pages
- SEO Schema & Sitemap
- Client Dashboard Pages
- Content Models & Schemas
- Database Seeding
- Location Pages & Page SEO
- Homepage Sections
- Interactive Client Widgets
- Blog Covers & Before/After
- Auth Forms
- Seed Data (Site & People)
- Redirects & Site URL Config
- Portfolio: Crabs & Tree Cases
- Portfolio: Rides/Pride/Yonge Cases
- Leads & Activity Models
- Admin Field Renderers
- Admin Server Actions & Email
- Package Manifest
- Navbar & Mobile Menu
- Page SEO Editor & Audit
- OTP & Session Models
- Static Page Metadata & RSS
- Runtime Dependencies
- Lead/Request Detail & Messaging
- Content Types & Industry Seed
- UI Form Components
- Notifications
- Admin Dashboard Charts
- Service Pages
- Work / Portfolio Pages
- Hero & Motion Effects
- Email Templates
- TypeScript Config
- Admin Editor Controls
- Error & Status Pages
- CMS & Auth Server Actions
- Consent-Gated Analytics
- DB-to-View Mappers
- Content Strategy Plan
- Dev Dependencies
- Contact & WhatsApp
- Platform Architecture (README)
- Design System
- User Model & Admin CLI
- Root Layout & Providers
- Email Provider Abstraction
- npm Scripts
- Footer & Newsletter
- Local SEO Strategy
- Team Headshots
- Rich Text Editor
- Social Share Icons
- Content Inventory & Migration
- Platform Surfaces (README)
- Project Seed Data
- Bangladesh E-commerce Portfolio
- Agent Instructions & Next.js
- Agency Showcase & Service Art
- Service Seed Data
- Request Proxy & Cookies
- Rate Limit Store
- ESLint Config
- Post Heading Cleanup
- Website SEO Imagery
- PostCSS Config
- Calgary Photos
- Dallas Photos
- Denver Photos
- Advertising Imagery
- Local SEO Imagery
- Software Dev Imagery
- Media Upload Storage
- Client Logo: SORS
- Client Logo: Honest Abe
- Dhaka Photo
- Laravel Logo
- Shopify Logo
- Planning Icon
- Business Management Imagery

## God Nodes (most connected - your core abstractions)
1. `next` - 117 edges
2. `cn()` - 116 edges
3. `connectDB()` - 100 edges
4. `react` - 65 edges
5. `lucide-react` - 62 edges
6. `ButtonLink()` - 47 edges
7. `getSiteSettings` - 45 edges
8. `Button()` - 38 edges
9. `LocationPage()` - 36 edges
10. `Section()` - 36 edges

## Surprising Connections (you probably didn't know these)
- `Merge Duplicate Business Management Posts (301)` --conceptually_related_to--> `Legacy WordPress 301 Redirects (src/config/redirects.ts)`  [INFERRED]
  docs/CONTENT_STRATEGY.md → README.md
- `main()` --calls--> `hashPassword()`  [EXTRACTED]
  scripts/create-admin.ts → src/lib/auth/password.ts
- `main()` --calls--> `hashPassword()`  [EXTRACTED]
  scripts/seed.ts → src/lib/auth/password.ts
- `Next.js Breaking Changes Notice` --conceptually_related_to--> `Next.js 16 (App Router, Turbopack)`  [INFERRED]
  AGENTS.md → README.md
- `README: Jarz Digital Agency Platform` --references--> `Content Inventory & Migration Notes`  [EXTRACTED]
  README.md → docs/CONTENT_INVENTORY.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Jarz Digital Platform Surfaces (public site, client portal, admin)** — readme_public_website, readme_client_portal, readme_admin, docs_design_system_admin_vs_public [EXTRACTED 1.00]
- **Content Pillars and Local Layer** — docs_content_strategy_pillar_local_seo, docs_content_strategy_pillar_websites_ecommerce, docs_content_strategy_pillar_business_management, docs_content_strategy_pillar_ads_social, docs_content_strategy_local_layer [EXTRACTED 1.00]
- **Local SEO System (offices, location pages, structured data, internal links)** — docs_content_inventory_offices, readme_location_pages, readme_structured_data, readme_internal_links, docs_content_strategy_local_layer [INFERRED 0.85]
- **Before/After Website Redesign Portfolio** — public_images_before_after_blissful, public_images_before_after_cravin_crabs, public_images_before_after_puff_picks, public_images_before_after_rides_on_time, public_images_before_after_yonge_rehab [INFERRED 0.95]
- **Local SEO / Google Maps Blog Content Cluster** — public_images_blog_how_to_open_a_google_business_profile, public_images_blog_how_to_rank_1_on_google_map_dallas, public_images_blog_how_to_rank_your_junk_car_buyer_business, public_images_blog_why_local_seo_is_a_game_changer_for_dallas, public_images_blog_why_map_ranking_is_crucial, public_images_blog_why_website_local_seo_is_important [INFERRED 0.85]
- **Jarz Digital Brand Mark Assets** — public_images_brand_logo, public_images_brand_mark, src_app_icon, src_app_apple_icon [INFERRED 0.95]
- **Office Location Skyline Images (Calgary, Dallas, Denver, Dhaka)** — public_images_locations_calgary_webp, public_images_locations_dallas_webp, public_images_locations_denver_webp, public_images_locations_dhaka_webp [INFERRED 0.85]
- **Agency Service Offering Images** — public_images_services_advertising_webp, public_images_services_business_management_webp, public_images_services_local_seo_webp, public_images_services_social_media_marketing_webp, public_images_services_software_development_webp, public_images_services_web_application_development_webp, public_images_services_website_development_webp, public_images_services_website_seo_webp [INFERRED 0.85]
- **Supported Development Platform Logos (Laravel, Shopify, WordPress)** — public_images_platforms_laravel_png, public_images_platforms_shopify_png, public_images_platforms_wordpress_png [INFERRED 0.85]
- **JarzDigital team member portraits used by seed people data (src/content/seed/people.ts photo helper)** — public_images_team_abir, public_images_team_ammar_mazrui, public_images_team_asad, public_images_team_denial, public_images_team_fardin, public_images_team_rokonuzzaman_jony, public_images_team_salman_hafiz, public_images_team_shahriar, public_images_team_shawn [INFERRED 0.95]
- **SEO Rank #1 proof images sharing one template** — public_images_work_commercial_roofing_seo, public_images_work_cravin_crabs_seo, public_images_work_cravin_crabs_seo_2, public_images_work_creative_tree_seo, public_images_work_commercial_roofing_seo_seo_rank_proof_template [INFERRED 0.95]
- **Cravin' Crabs full-service case study (web, SEO, social, management)** — public_images_work_cravin_crabs_web, public_images_work_cravin_crabs_seo, public_images_work_cravin_crabs_seo_2, public_images_work_cravin_crabs_social, public_images_work_cravin_crabs_management, public_images_work_cravin_crabs_web_cravin_crabs [INFERRED 0.85]
- **Creative Tree & Stump full-service case study (web, SEO, social, management)** — public_images_work_creative_tree_web, public_images_work_creative_tree_seo, public_images_work_creative_tree_social, public_images_work_creative_tree_management, public_images_work_creative_tree_web_creative_tree_stump_llc [INFERRED 0.85]
- **Pride Car Customizing full-service case study (management, SEO, web)** — public_images_work_pride_customizing_management, public_images_work_pride_customizing_seo, public_images_work_pride_customizing_web, public_images_work_pride_customizing_management_pride_car_customizing [EXTRACTED 1.00]
- **Rides On Time full-service case study (management, SEO, social, web)** — public_images_work_rides_on_time_management, public_images_work_rides_on_time_seo, public_images_work_rides_on_time_social, public_images_work_rides_on_time_web, public_images_work_rides_on_time_management_rides_on_time [EXTRACTED 1.00]
- **Shared local-business management case-study image template** — public_images_work_pride_customizing_management, public_images_work_richmond_hill_management, public_images_work_rides_on_time_management, public_images_work_yonge_rehab_management [INFERRED 0.95]

## Communities (88 total, 19 thin omitted)

### Community 0 - "API Routes & Infrastructure"
Cohesion: 0.07
Nodes (46): ref_node_crypto, zod, DELETE(), idOk(), PATCH(), patchSchema, fail(), GET() (+38 more)

### Community 1 - "Blog & Public Content Queries"
Cohesion: 0.08
Nodes (45): CategoryPage(), dynamicParams, generateMetadata(), generateStaticParams(), revalidate, BlogPage(), generateMetadata(), revalidate (+37 more)

### Community 2 - "Marketing Page Building Blocks"
Cohesion: 0.13
Nodes (38): next, AboutPage(), revalidate, IndustriesPage(), revalidate, dynamicParams, generateMetadata(), IndustryPage() (+30 more)

### Community 3 - "CMS Resource Registry & Editor"
Cohesion: 0.08
Nodes (39): EditResourcePage(), generateMetadata(), generateMetadata(), NewResourcePage(), generateMetadata(), FieldProps, ResourceEditor(), ICON_OPTIONS (+31 more)

### Community 4 - "Auth & Account Actions"
Cohesion: 0.09
Nodes (42): PROJECT_TYPE_OPTIONS, changePasswordAction(), createProjectRequestAction(), guard(), signOutOtherSessionsAction(), updatePreferencesAction(), updateProfileAction(), CLOSED (+34 more)

### Community 5 - "Sessions & Admin Shell"
Cohesion: 0.10
Nodes (34): server-only, AdminLayout(), metadata, GET(), GET(), LoginPage(), metadata, DashboardLayout() (+26 more)

### Community 6 - "Migration Scripts & Dev DB"
Cohesion: 0.06
Nodes (36): mongodb-memory-server-core, ref_node_fs, ref_node_path, ref_node_url, dbPath, port, clean(), decode() (+28 more)

### Community 7 - "Admin List Pages"
Cohesion: 0.16
Nodes (33): ActivityPage(), metadata, TYPES, LeadsPage(), metadata, MediaPage(), metadata, metadata (+25 more)

### Community 8 - "SEO Schema & Sitemap"
Cohesion: 0.10
Nodes (34): dynamicParams, generateMetadata(), generateStaticParams(), revalidate, TeamMemberPage(), revalidate, sitemap(), JsonLd() (+26 more)

### Community 9 - "Client Dashboard Pages"
Cohesion: 0.16
Nodes (29): MessagesPage(), metadata, DashboardHome(), metadata, metadata, ProfilePage(), metadata, ProjectsPage() (+21 more)

### Community 10 - "Content Models & Schemas"
Cohesion: 0.07
Nodes (33): getDashboardData(), weekly(), CategoryDoc, CategorySchema, FaqDoc, FaqSchema, IndustryDoc, IndustrySchema (+25 more)

### Community 11 - "Database Seeding"
Cohesion: 0.08
Nodes (32): main(), reset, src_content_seed_index_categoryseed, src_content_seed_index_faqseed, industrySeed, src_content_seed_index_pageseed, postSeed, projectSeed (+24 more)

### Community 12 - "Location Pages & Page SEO"
Cohesion: 0.15
Nodes (29): FILES, GlobalSeoPage(), metadata, dynamicParams, findOffice(), generateMetadata(), generateStaticParams(), localProjects() (+21 more)

### Community 13 - "Homepage Sections"
Cohesion: 0.14
Nodes (25): HomePage(), revalidate, Counter(), el(), Reveal(), Tag, BeforeAfterShowcase(), categoryLabel() (+17 more)

### Community 14 - "Interactive Client Widgets"
Cohesion: 0.14
Nodes (21): motion, react, Item, QUICK_ACTIONS, MediaItem, MediaPicker(), uploadFile(), MediaLibrary() (+13 more)

### Community 15 - "Blog Covers & Before/After"
Cohesion: 0.08
Nodes (30): Blissful Touch Spa Before/After Mockup, Blissful Touch (Massage & Spa client), Cravin' Crabs Before/After Mockup, Cravin' Crabs (Baltimore seafood client), Puff Picks Before/After Mockup, Puff Picks (Vape Shop Dallas e-commerce client), Rides On Time Before/After Mockup, Rides On Time (San Diego chauffeur/airport car service client) (+22 more)

### Community 16 - "Auth Forms"
Cohesion: 0.24
Nodes (22): ForgotPasswordPage(), metadata, metadata, RegisterPage(), BackLink(), CodeInput(), CodeSentNotice(), errs() (+14 more)

### Community 17 - "Seed Data (Site & People)"
Cohesion: 0.11
Nodes (19): CONTACT_PHONE, WHATSAPP_NUMBER, SeedPost, serviceSeed, categorySeed, faqSeed, SeedFaq, SeedTeam (+11 more)

### Community 18 - "Redirects & Site URL Config"
Cohesion: 0.12
Nodes (21): analytics, csp, nextConfig, securityHeaders, siteUrl, src_config_legacy_uploads, BLOG_CATEGORIES, BLOG_TAGS (+13 more)

### Community 19 - "Portfolio: Crabs & Tree Cases"
Cohesion: 0.12
Nodes (24): KH Commercial Roofing Tampa SEO Rank #1 Proof, KH Commercial Roofing (Tampa, FL), SEO Rank #1 Proof Template (SERP + keyword ranking table + medal), Cravin' Crabs Digital Management Showcase (GBP, WordPress, Maps, FB, IG), Google Business Profile, Digital Management Stack Showcase Template (GBP + WordPress + Maps + Social), WordPress, Cravin' Crabs Local Maps SEO Proof ('crabs restaurant halethorpe') (+16 more)

### Community 20 - "Portfolio: Rides/Pride/Yonge Cases"
Cohesion: 0.11
Nodes (24): Pride Customizing Management Case Study Image, Local Business Management Stack (GBP, WordPress, Google Maps, Facebook, Instagram), Pride Car Customizing (Miami auto body shop client), Pride Customizing SEO Case Study Image, Local SEO Google Map Pack Ranking, Pride Customizing Web Design Mockup, Responsive Web Design Device Mockup, Puff Picks Web Design Mockup (+16 more)

### Community 21 - "Leads & Activity Models"
Cohesion: 0.09
Nodes (22): metadata, ActivityLog, ActivityLogDoc, ActivityLogSchema, Lead, LeadDoc, LeadSchema, MediaDoc (+14 more)

### Community 22 - "Admin Field Renderers"
Cohesion: 0.17
Nodes (21): FieldRenderer(), FieldShell(), GalleryField(), ImageField(), ListInput(), MultiChoice(), RepeaterField(), RichTextEditor (+13 more)

### Community 23 - "Admin Server Actions & Email"
Cohesion: 0.22
Nodes (22): addLeadNoteAction(), deleteLeadAction(), guard(), markNotificationsReadAction(), oid, pageSeoSchema, savePageSeoAction(), saveSettingsAction() (+14 more)

### Community 24 - "Package Manifest"
Cohesion: 0.09
Nodes (21): engines, node, name, private, version, clsx, dotenv, nodemailer (+13 more)

### Community 25 - "Navbar & Mobile Menu"
Cohesion: 0.19
Nodes (18): AuthLayout(), metadata, POINTS, MobileMenu(), loadMobileMenu(), loadSearch(), MenuKey, MobileMenu (+10 more)

### Community 26 - "Page SEO Editor & Audit"
Cohesion: 0.16
Nodes (19): CMS, levelTone, metadata, PageSeoPage(), Row, PageSeoEditor(), Props, applyTemplate() (+11 more)

### Community 27 - "OTP & Session Models"
Cohesion: 0.12
Nodes (19): OTP_LENGTH, OTP_TTL_MINUTES, RESEND_COOLDOWN_SECONDS, consumeOtp(), findOtpRecord(), hashCode(), IssueResult, Pending (+11 more)

### Community 28 - "Static Page Metadata & RSS"
Cohesion: 0.13
Nodes (18): generateMetadata(), esc(), GET(), revalidate, generateMetadata(), generateMetadata(), generateMetadata(), generateMetadata() (+10 more)

### Community 29 - "Runtime Dependencies"
Cohesion: 0.10
Nodes (20): dependencies, clsx, lucide-react, mongoose, motion, next, nodemailer, react (+12 more)

### Community 30 - "Lead/Request Detail & Messaging"
Cohesion: 0.23
Nodes (16): LeadDetailPage(), metadata, AdminRequestPage(), metadata, MessageComposer(), NoteForm(), ProgressControl(), RoleSelect() (+8 more)

### Community 31 - "Content Types & Industry Seed"
Cohesion: 0.11
Nodes (16): industrySeed, local, SeedIndustry, pageSeed, SeedPage, CmsPage, FaqItem, FeatureGroup (+8 more)

### Community 32 - "UI Form Components"
Cohesion: 0.25
Nodes (15): lucide-react, Alert(), errs(), PasswordForm(), ProfileForm(), ProjectRequestForm(), ContactForm(), Button() (+7 more)

### Community 33 - "Notifications"
Cohesion: 0.19
Nodes (13): metadata, NotificationsPage(), ClientNotificationsPage(), metadata, MarkAllRead(), ICONS, NotificationItem, NotificationList() (+5 more)

### Community 34 - "Admin Dashboard Charts"
Cohesion: 0.22
Nodes (17): AdminDashboard(), metadata, UserDetailPage(), BarList(), ColumnChart(), fmt, LineChart(), niceMax() (+9 more)

### Community 35 - "Service Pages"
Cohesion: 0.18
Nodes (17): generateStaticParams(), dynamicParams, generateMetadata(), generateStaticParams(), revalidate, ServicePage(), Accordion(), AccordionItem (+9 more)

### Community 36 - "Work / Portfolio Pages"
Cohesion: 0.21
Nodes (15): dynamicParams, generateMetadata(), generateStaticParams(), ProjectPage(), revalidate, ImageReveal(), categoryLabel(), ProjectCard() (+7 more)

### Community 37 - "Hero & Motion Effects"
Cohesion: 0.22
Nodes (15): EASE, Magnetic(), Parallax(), ScrollProgress(), Marquee(), FadeIn(), TextReveal(), CHIPS (+7 more)

### Community 38 - "Email Templates"
Cohesion: 0.25
Nodes (16): CONTACT_EMAIL, OFFICE_CITIES, ActionResult, adminNotificationEmail(), esc(), layout(), leadConfirmationEmail(), leadNotificationEmail() (+8 more)

### Community 39 - "TypeScript Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 40 - "Admin Editor Controls"
Cohesion: 0.17
Nodes (13): ConfirmButton(), RelationOptions, Values, Intent, PublishToggle(), GlobalSeoForm(), icons, iconTone (+5 more)

### Community 41 - "Error & Status Pages"
Cohesion: 0.18
Nodes (12): ErrorPage(), ForbiddenPage(), metadata, metadata, NotFound(), StatusPage(), Arrow(), ButtonSize (+4 more)

### Community 42 - "CMS & Auth Server Actions"
Cohesion: 0.24
Nodes (15): forgotPasswordAction(), registerAction(), resendCodeAction(), deleteResourceAction(), Intent, refreshPublic(), saveResourceAction(), togglePublishAction() (+7 more)

### Community 43 - "Consent-Gated Analytics"
Cohesion: 0.24
Nodes (14): Analytics(), GoogleTags(), subscribeConsent(), analyticsEnabled, Consent, CONSENT_EVENT, CONSENT_KEY, DataLayerWindow (+6 more)

### Community 44 - "DB-to-View Mappers"
Cohesion: 0.22
Nodes (14): Doc, image(), iso(), mapFaq(), mapPage(), mapProject(), mapService(), mapTeam() (+6 more)

### Community 45 - "Content Strategy Plan"
Cohesion: 0.19
Nodes (15): needsReview Flag for Drafted Content, Jarz Digital Content Strategy, 12-Week Content Calendar (60/30/10), Bangladesh E-commerce Clients (CarHat.bd, Shajgoj.bd, KoreanSkincare.bd, Gadget & Gear), Brief: E-commerce Website Development in Bangladesh, Merge Duplicate Business Management Posts (301), Distribution Plan (newsletter, GBP, LinkedIn, WhatsApp), Brief: Google Business Profile Optimization Checklist (+7 more)

### Community 46 - "Dev Dependencies"
Cohesion: 0.14
Nodes (14): devDependencies, dotenv, eslint, eslint-config-next, mongodb-memory-server-core, tailwindcss, @tailwindcss/postcss, tsx (+6 more)

### Community 47 - "Contact & WhatsApp"
Cohesion: 0.49
Nodes (10): ContactPage(), revalidate, ContactChannels(), WhatsAppFloat(), WhatsappIcon(), publicUrl(), telHref(), whatsappDisplay() (+2 more)

### Community 48 - "Platform Architecture (README)"
Cohesion: 0.21
Nodes (13): CMS Resource Registry (src/lib/cms/resources.ts), Custom Authentication (scrypt + server sessions), Email OTP Codes (sign-up & reset), Email Provider Abstraction (console/SMTP/Resend/Brevo), HMAC-Hashed Session Tokens, ISR & Tagged Cache Invalidation, MongoDB via Mongoose 9, MongoDB-Backed Rate Limiting (+5 more)

### Community 49 - "Design System"
Cohesion: 0.20
Nodes (12): Jarz Digital Design System, Button Component (ui/button.tsx), Color Usage Rules (contrast, status never color-only), Form Field Component (ui/form.tsx), Theme Tokens (src/app/globals.css @theme), Jarz Teal #00AFB9 Brand Hue, Layout & Grid (container-page, 12-col), Motion Tokens & Reveals (+4 more)

### Community 50 - "User Model & Admin CLI"
Cohesion: 0.23
Nodes (10): mongoose, ref_node_readline, arg(), ask(), main(), defineModel(), ROLES, User (+2 more)

### Community 51 - "Root Layout & Providers"
Cohesion: 0.23
Nodes (10): src_app_globals, geist, geistMono, generateMetadata(), RootLayout(), spaceGrotesk, viewport, MotionProvider() (+2 more)

### Community 52 - "Email Provider Abstraction"
Cohesion: 0.18
Nodes (8): brevoProvider, consoleProvider, EmailMessage, EmailProvider, getEmailProvider(), providers, resendProvider, smtpProvider

### Community 53 - "npm Scripts"
Cohesion: 0.18
Nodes (11): scripts, build, create-admin, db:dev, db:seed, dev, lint, migrate:assets (+3 more)

### Community 54 - "Footer & Newsletter"
Cohesion: 0.31
Nodes (7): MarketingLayout(), CookieSettingsButton(), Footer(), NewsletterForm(), isFounder(), websiteSchema(), SiteSettings

### Community 55 - "Local SEO Strategy"
Cohesion: 0.22
Nodes (10): Calgary Address Needs Confirmation, Offices: Dallas, Denver, Calgary, Dhaka, Hub-and-Spoke Linking Rules, Local Layer (city-specific content), Content Measurement Plan, Automatic Internal Links (src/lib/content/links.ts), Location Pages (/locations/<city>), Page SEO Overrides (src/lib/seo/pages.ts) (+2 more)

### Community 56 - "Team Headshots"
Cohesion: 0.20
Nodes (10): Abir Headshot (SEO Specialist portrait), Ammar Mazrui Headshot (Ontario marketing, professional studio portrait), Asad Headshot (Canada client relations, casual outdoor selfie), Denial Headshot (web developer portrait), Fardin Headshot (video editor, casual office photo), Rokonuzzaman Jony Headshot (founder/SEO lead, business suit portrait), Salman Hafiz Headshot (web designer/developer, blazer portrait), Shahriar Headshot (team lead, suit and tie portrait) (+2 more)

### Community 57 - "Rich Text Editor"
Cohesion: 0.24
Nodes (9): @tiptap/extension-image, @tiptap/extension-link, @tiptap/extension-placeholder, @tiptap/extension-table, @tiptap/react, @tiptap/starter-kit, RichTextEditor(), Toolbar() (+1 more)

### Community 58 - "Social Share Icons"
Cohesion: 0.33
Nodes (6): ShareButtons(), FacebookIcon(), LinkedinIcon(), P, SOCIAL_ICONS, XIcon()

### Community 59 - "Content Inventory & Migration"
Cohesion: 0.32
Nodes (8): Content Inventory & Migration Notes, Asset Recovery (migrate-assets.mjs --fetch-missing), Testimonials Hidden Until Approved, HTTrack Mirror of jarzdigital.com (WordPress/Elementor), Rokonuzzaman Jony (CEO/Founder), Exclusion of Unverified Claims, E-E-A-T Named Author Credit, Legacy WordPress 301 Redirects (src/config/redirects.ts)

### Community 60 - "Platform Surfaces (README)"
Cohesion: 0.32
Nodes (8): Site Seed (src/content/seed/site.ts), Admin vs Public Visual Language, README: Jarz Digital Agency Platform, Admin Dashboard (/admin), Client Portal (/dashboard), Consent-Gated GA4/GTM Analytics, Public Marketing Website, Seed Content Fallback (src/content/seed)

### Community 61 - "Project Seed Data"
Cohesion: 0.25
Nodes (3): projectSeed, SeedProject, ImageRef

### Community 62 - "Bangladesh E-commerce Portfolio"
Cohesion: 0.33
Nodes (7): CarHat Car Marketplace Website Mockup, CarHat (Bangladesh's #1 Car Marketplace), Laptop + Phone Responsive Mockup Showcase, Gadget & Gear E-commerce Website Mockup, Gadget & Gear (Bangladesh electronics store, EMI, flash deals), Korean Skincare BD E-commerce Website Mockup, Korean Skincare .bd (K-beauty store, Cash on Delivery in Bangladesh)

### Community 63 - "Agent Instructions & Next.js"
Cohesion: 0.40
Nodes (3): generate-agent-files.js (next dev agent block writer), Next.js Breaking Changes Notice, Next.js 16 (App Router, Turbopack)

### Community 64 - "Agency Showcase & Service Art"
Cohesion: 0.40
Nodes (5): Agency Portfolio Showcase Graphic - JD logo, gold star, client site mockups (Busy Builders LLC remodeling, Doorstep Spa Dubai, crab restaurant social posts), Social Media Marketing Process Step Icon (white glyph on transparent), Website Development Process Step Icon (white glyph on transparent), Social Media Marketing Service Image - floating 3D cubes of social icons (Instagram, YouTube, Snapchat, Facebook, Pinterest), Website Development Service Image - designer viewing floating UI/UX components by monitor

### Community 65 - "Service Seed Data"
Cohesion: 0.40
Nodes (3): SeedService, seoProcess, serviceSeed

### Community 68 - "ESLint Config"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

### Community 69 - "Post Heading Cleanup"
Cohesion: 0.67
Nodes (3): norm(), normalizePostHeadings(), POST_TITLE_FIXES

### Community 70 - "Website SEO Imagery"
Cohesion: 0.67
Nodes (3): WordPress Platform Logo (blue W, left-cropped), SEO Process Step Icon (white glyph on transparent), Website SEO Service Image - SEO key with PHP, WordPress, Python, HTML5, JS, Swift logos

## Ambiguous Edges - Review These
- `Doorstep Spa (home-service massage, Dubai)` → `Jarz Digital Portfolio Collage (SEO, GBP, websites)`  [AMBIGUOUS]
  public/images/work/jarz-digital-web.webp · relation: references

## Knowledge Gaps
- **438 isolated node(s):** `eslintConfig`, `siteUrl`, `analytics`, `csp`, `securityHeaders` (+433 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 483 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Doorstep Spa (home-service massage, Dubai)` and `Jarz Digital Portfolio Collage (SEO, GBP, websites)`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **Why does `next` connect `Marketing Page Building Blocks` to `API Routes & Infrastructure`, `Blog & Public Content Queries`, `CMS Resource Registry & Editor`, `Auth & Account Actions`, `Sessions & Admin Shell`, `Migration Scripts & Dev DB`, `Admin List Pages`, `SEO Schema & Sitemap`, `Client Dashboard Pages`, `Location Pages & Page SEO`, `Homepage Sections`, `Interactive Client Widgets`, `Auth Forms`, `Redirects & Site URL Config`, `Leads & Activity Models`, `Admin Field Renderers`, `Admin Server Actions & Email`, `Package Manifest`, `Navbar & Mobile Menu`, `Page SEO Editor & Audit`, `Static Page Metadata & RSS`, `Lead/Request Detail & Messaging`, `UI Form Components`, `Notifications`, `Admin Dashboard Charts`, `Service Pages`, `Work / Portfolio Pages`, `Admin Editor Controls`, `Error & Status Pages`, `CMS & Auth Server Actions`, `Consent-Gated Analytics`, `Contact & WhatsApp`, `Root Layout & Providers`, `Footer & Newsletter`, `Request Proxy & Cookies`?**
  _High betweenness centrality (0.171) - this node is a cross-community bridge._
- **Why does `cn()` connect `Hero & Motion Effects` to `Blog & Public Content Queries`, `Marketing Page Building Blocks`, `CMS Resource Registry & Editor`, `Sessions & Admin Shell`, `Admin List Pages`, `SEO Schema & Sitemap`, `Client Dashboard Pages`, `Homepage Sections`, `Interactive Client Widgets`, `Auth Forms`, `Admin Field Renderers`, `Navbar & Mobile Menu`, `Page SEO Editor & Audit`, `Lead/Request Detail & Messaging`, `UI Form Components`, `Notifications`, `Admin Dashboard Charts`, `Service Pages`, `Work / Portfolio Pages`, `Admin Editor Controls`, `Error & Status Pages`, `Contact & WhatsApp`, `Root Layout & Providers`, `Rich Text Editor`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `connectDB()` connect `CMS & Auth Server Actions` to `API Routes & Infrastructure`, `Blog & Public Content Queries`, `CMS Resource Registry & Editor`, `Auth & Account Actions`, `Sessions & Admin Shell`, `Admin List Pages`, `SEO Schema & Sitemap`, `Client Dashboard Pages`, `Content Models & Schemas`, `Homepage Sections`, `Leads & Activity Models`, `Admin Server Actions & Email`, `Page SEO Editor & Audit`, `Static Page Metadata & RSS`, `Lead/Request Detail & Messaging`, `Notifications`, `Admin Dashboard Charts`, `Service Pages`, `Work / Portfolio Pages`, `Email Templates`, `Rate Limit Store`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `siteUrl`, `analytics` to the rest of the system?**
  _438 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `API Routes & Infrastructure` be split into smaller, more focused modules?**
  _Cohesion score 0.06821787414066631 - nodes in this community are weakly interconnected._
- **Should `Blog & Public Content Queries` be split into smaller, more focused modules?**
  _Cohesion score 0.08246753246753247 - nodes in this community are weakly interconnected._