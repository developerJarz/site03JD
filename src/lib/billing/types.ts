/**
 * Quotation & invoice documents for the admin billing studio. Everything here
 * is plain JSON so the browser store can be exported/imported as-is and later
 * moved to a database collection without reshaping.
 */

export type Currency = "BDT" | "USD";
export type DeliveryTrack = "website" | "software";
export type PresetId = "ecommerce" | "corporate" | "erp";

export interface CompanyProfile {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  /** Image URL or data: URL. Empty shows the monogram. */
  logoUrl: string;
  monogram: string;
  defaultCurrency: Currency;
  /** Default payment instructions copied onto new invoices. */
  bankDetails: string;
  mobileBanking: string;
  signatoryName: string;
  signatoryTitle: string;
}

export interface ClientInfo {
  name: string;
  company: string;
  website: string;
  phone: string;
  email: string;
  address: string;
}

export interface Kpi {
  id: string;
  label: string;
  value: string;
  caption: string;
}

/** Two-column row: features (module → capabilities) and tech stack (layer → technologies). */
export interface TextRow {
  id: string;
  title: string;
  detail: string;
}

export interface TechRow extends TextRow {
  /** Key into TECH_SUGGESTIONS for the quick-add tags. */
  suggest?: string;
}

export interface CostLine {
  id: string;
  label: string;
  amount: number;
  type: "one-time" | "annual";
}

export interface Milestone {
  id: string;
  when: string;
  description: string;
  amount: number;
}

export interface TimelinePhase {
  id: string;
  period: string;
  detail: string;
}

export interface RateRow {
  id: string;
  label: string;
  value: string;
}

export interface TermItem {
  id: string;
  /** Supports **bold** spans. */
  text: string;
  rates: RateRow[];
}

export interface TermGroup {
  id: string;
  title: string;
  items: TermItem[];
}

export type QuoteSectionId =
  | "summary"
  | "kpis"
  | "workflow"
  | "costs"
  | "features"
  | "techStack"
  | "payments"
  | "timeline"
  | "prerequisites"
  | "additionalCosts"
  | "terms"
  | "signature";

export interface SectionConfig {
  id: QuoteSectionId;
  visible: boolean;
  /** Start this section on a new A4 page. */
  newPage: boolean;
  title: string;
  subtitle: string;
}

export type QuoteStatus = "draft" | "sent" | "approved" | "rejected" | "converted";

export interface Quotation {
  kind: "quotation";
  id: string;
  number: string;
  status: QuoteStatus;
  createdAt: string;
  updatedAt: string;
  currency: Currency;
  preset: PresetId | "custom";
  documentTitle: string;
  projectTitle: string;
  /** YYYY-MM-DD */
  issueDate: string;
  validityDays: number;
  client: ClientInfo;
  executiveSummary: string;
  kpis: Kpi[];
  /** Development Cost card follows the first one-time cost line. */
  costKpiAuto: boolean;
  workflow: WorkflowStep[];
  costs: CostLine[];
  features: TextRow[];
  techStack: TechRow[];
  milestones: Milestone[];
  timeline: { track: DeliveryTrack | "custom"; note: string; phases: TimelinePhase[] };
  prerequisites: string[];
  additionalCosts: string[];
  terms: TermGroup[];
  signature: { validityNotice: string; clientLabel: string; companyLabel: string; signatoryName: string; signatoryTitle: string };
  sections: SectionConfig[];
  invoiceIds: string[];
}

export type WorkflowStep = TextRow;

export type BillingType = "one-time" | "milestone" | "annual";
export type InvoiceStatus = "paid" | "partial" | "unpaid" | "overdue";

export interface LineItem {
  id: string;
  title: string;
  description: string;
  billingType: BillingType;
  qty: number;
  unitPrice: number;
  /** Flat amount off this line. */
  discount: number;
  /** Percent, applied after the line discount. */
  taxRate: number;
}

export interface PaymentRecord {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  method: string;
  reference: string;
  amount: number;
}

export interface Invoice {
  kind: "invoice";
  id: string;
  number: string;
  createdAt: string;
  updatedAt: string;
  currency: Currency;
  quotationId: string;
  quotationNumber: string;
  projectTitle: string;
  issueDate: string;
  dueDate: string;
  delivery: DeliveryTrack | "none";
  deliveryNote: string;
  statusOverride: InvoiceStatus | "auto";
  client: ClientInfo;
  items: LineItem[];
  showTax: boolean;
  payments: PaymentRecord[];
  schedule: Milestone[];
  showSchedule: boolean;
  bankDetails: string;
  mobileBanking: string;
  notes: string;
  terms: string[];
  showStamp: boolean;
  showSignature: boolean;
  signatoryName: string;
  signatoryTitle: string;
}

export type BillingDoc = Quotation | Invoice;

export interface BillingState {
  version: 2;
  company: CompanyProfile;
  documents: BillingDoc[];
}
