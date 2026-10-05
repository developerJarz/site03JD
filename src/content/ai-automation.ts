/**
 * Long-form content for /services/ai-automation. The service record (seed/services.ts,
 * editable in Admin → Services) supplies the hero, FAQs and SEO; this file holds the
 * page-only sections: the example run, the workflow finder, the guide and industry examples.
 */

/** Hero: one illustrative workflow run, played back line by line. */
export const exampleRun = {
  title: "Example run: a WhatsApp enquiry after closing time",
  steps: [
    { time: "21:14:02", source: "WhatsApp", text: "“Hi, how much is teeth whitening? Can I come in this week?”", kind: "in" },
    { time: "21:14:04", source: "AI assistant", text: "Understood two things: a price question and a booking request.", kind: "ai" },
    { time: "21:14:05", source: "Price list", text: "Found the whitening price and this month’s offer.", kind: "tool" },
    { time: "21:14:08", source: "Calendar", text: "Thursday has two free slots. Offered 4:30 pm and 5:15 pm.", kind: "tool" },
    { time: "21:14:41", source: "WhatsApp", text: "Customer chose Thursday 4:30 pm. Booking confirmed.", kind: "in" },
    { time: "21:14:43", source: "CRM", text: "Contact saved, tagged “whitening”, reminder set for Wednesday.", kind: "tool" },
    { time: "21:14:43", source: "Morning summary", text: "Added to the front desk’s 8 am report.", kind: "done" },
  ],
  footer: "Handled in 41 seconds while the clinic was closed. Nobody was woken up.",
} as const;

export type RunStep = (typeof exampleRun.steps)[number];

/** Workflow finder: what we automate, by the part of the business it helps. */
export const workflowAreas = [
  {
    id: "leads",
    name: "Leads & sales",
    intro: "Speed wins most enquiries. These workflows make sure every lead gets an answer and a next step.",
    workflows: [
      { when: "A lead fills in your website form or a Facebook lead ad", then: "AI replies within a minute, asks two qualifying questions and books a call", result: "Sales calls with people who are ready, not cold names on a list" },
      { when: "A quote has been sent but the customer goes quiet", then: "Polite follow-ups go out on day 2, 5 and 10, written for that customer", result: "Fewer quotes forgotten in an inbox" },
      { when: "A new customer pays", then: "Welcome message, invoice and onboarding checklist are sent automatically", result: "A smooth first week without anyone remembering to do it" },
    ],
  },
  {
    id: "support",
    name: "Customer support",
    intro: "Most support questions have been asked a hundred times. Let AI answer those, and let your team handle the rest.",
    workflows: [
      { when: "A customer asks about prices, hours, delivery or returns", then: "The assistant answers from your approved FAQ on WhatsApp, Messenger or website chat", result: "Instant answers at any hour, in your tone of voice" },
      { when: "A question is new, sensitive or the customer is unhappy", then: "The chat is handed to a person with a short summary of what was said", result: "Your team steps in only where it matters, already up to speed" },
      { when: "Someone asks “where is my order?”", then: "The workflow checks the order status and courier tracking, then replies", result: "No more copy-pasting tracking numbers" },
    ],
  },
  {
    id: "operations",
    name: "Operations & admin",
    intro: "The copy-paste work between apps is where hours disappear and mistakes creep in.",
    workflows: [
      { when: "An order comes in on Shopify or WooCommerce", then: "It’s added to your sheet or ERP, the invoice is created and stock is updated", result: "Order data typed once, correct everywhere" },
      { when: "Supplier invoices and receipts arrive by email", then: "AI reads the PDF, pulls out the supplier, amount and due date, and files it", result: "Bookkeeping that’s ready when your accountant asks" },
      { when: "A new employee or client starts", then: "Accounts, folders and checklists are created from one form", result: "Onboarding in minutes instead of an afternoon" },
    ],
  },
  {
    id: "marketing",
    name: "Marketing & reviews",
    intro: "AI is good at first drafts. We set it up to draft, and your team approves before anything is published.",
    workflows: [
      { when: "A new Google review is posted", then: "A reply is drafted in your voice and sent to you for one-tap approval", result: "Every review answered, including the awkward ones" },
      { when: "You add a new product or service", then: "Descriptions, social captions and an SEO title are drafted from your notes", result: "Launches that don’t wait on copywriting" },
      { when: "A job is completed", then: "The customer gets a thank-you message with a review link a day later", result: "A steady stream of fresh reviews" },
    ],
  },
  {
    id: "reporting",
    name: "Reporting & alerts",
    intro: "You shouldn’t need five dashboards to know how the week went.",
    workflows: [
      { when: "Every Monday at 8 am", then: "Sales, ad spend, leads and website traffic are pulled together and summarised in plain language", result: "One short report you actually read" },
      { when: "Ad costs jump or leads drop below normal", then: "An alert is sent to WhatsApp or Slack with the numbers that changed", result: "Problems caught in hours, not at month end" },
      { when: "A big order or VIP enquiry comes in", then: "The right person is notified straight away", result: "Important customers never wait in a queue" },
    ],
  },
] as const;

/** In-depth guide: the long-form, search-focused section. */
export const guide = [
  {
    heading: "What AI automation actually means",
    body: [
      "Automation is software doing a task the same way every time: when this happens, do that. It has been around for years, and it’s great for predictable steps like copying an order into a spreadsheet.",
      "AI automation adds a step that can read and write like a person. It can understand a customer’s message even when it’s phrased oddly, pull the invoice number out of a messy PDF, or write a reply that sounds like your business. Put the two together and you can automate whole conversations and processes, not just single clicks.",
    ],
  },
  {
    heading: "AI automation vs. a chatbot",
    body: [
      "Old-style chatbots follow a script: press 1 for prices, press 2 for opening hours. Customers hate them because they break the moment someone asks a real question.",
      "An AI assistant understands the question, answers from information you’ve approved, and can take action — check the calendar, look up an order, create a booking. When it doesn’t know, it says so and passes the chat to your team. That last part is what makes it safe to put in front of customers.",
    ],
  },
  {
    heading: "Where AI helps, and where it shouldn’t decide",
    body: [
      "We use AI for the parts of a job that are repetitive and low-risk: answering common questions, sorting and summarising messages, extracting data, drafting replies and reports.",
      "We keep people in charge of anything that’s costly to get wrong: refunds, pricing exceptions, medical or legal advice, and complaints. In those workflows the AI prepares everything and a person approves it with one click. You get the speed without handing over the judgement.",
    ],
  },
  {
    heading: "Why we build with n8n, ChatGPT, Claude and Gemini",
    body: [
      "n8n connects hundreds of apps and lets us build workflows you can see and change, and it can run on your own server when data needs to stay in-house. For the AI steps we choose the model that fits the job: ChatGPT, Claude or Gemini each have strengths in reasoning, writing and cost.",
      "Because everything is built on standard tools rather than a closed platform, you’re never locked in. You own the workflows, and any developer can pick them up later.",
    ],
  },
] as const;

/** “Is your business ready?” — signs that automation will pay off. */
export const readiness = [
  "Your team answers the same customer questions every day",
  "Leads sometimes wait hours, or overnight, for a first reply",
  "Someone copies data from one app into another every week",
  "Appointments get missed because reminders depend on memory",
  "Your weekly or monthly report is assembled by hand",
  "You’d grow faster if admin didn’t grow with every new customer",
] as const;

/** Industry examples, matched to industry pages by slug. */
export const industryExamples: { match: RegExp; example: string }[] = [
  { match: /dent/, example: "WhatsApp booking, reminders and recall messages that fill empty chairs." },
  { match: /health|clinic|medical/, example: "Appointment booking, intake forms read into your system and follow-up reminders." },
  { match: /law|legal|attorney/, example: "Enquiry intake that collects the case details and books a consultation with the right lawyer." },
  { match: /real-?estate/, example: "Instant replies to listing enquiries, viewing bookings and follow-up for buyers who go quiet." },
  { match: /restaurant|food/, example: "Reservations and menu questions on WhatsApp, plus review replies drafted every morning." },
  { match: /auto|car/, example: "Quote requests answered fast, service reminders and “your car is ready” messages." },
  { match: /hvac|plumb|contractor|construction/, example: "After-hours call and message capture, job booking and quote follow-up." },
  { match: /fitness|gym/, example: "Trial-class booking, membership follow-up and win-back messages for members who stop coming." },
];
