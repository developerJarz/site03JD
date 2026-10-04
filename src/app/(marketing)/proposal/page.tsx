import type { Metadata } from "next";
import { Hind_Siliguri } from "next/font/google";
import JarzProposalPage from "@/components/proposal/JarzProposalPage";
import { publicUrl, whatsappDisplay, whatsappLink, whatsappMessage } from "@/config/contact";
import { getSiteSettings } from "@/lib/data/public";
import { pageMetadata } from "@/lib/seo/page";

export const revalidate = 3600;

// Bangla copy only; not preloaded so English readers don't download it.
const hind = Hind_Siliguri({ variable: "--font-hind", subsets: ["bengali", "latin"], weight: ["400", "500", "600", "700"], display: "swap", preload: false });

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/proposal");
}

export default async function ProposalPage() {
  const settings = await getSiteSettings();
  const { contact } = settings;

  return (
    <div className={hind.variable}>
      <JarzProposalPage
        contact={{
          whatsappHref: whatsappLink(contact.whatsapp, whatsappMessage({ intent: "I’ve read the 6-month growth proposal and want to talk.", from: `Project proposal — ${publicUrl("/proposal")}` })),
          whatsappDisplay: whatsappDisplay(contact),
          email: contact.email,
        }}
      />
    </div>
  );
}
