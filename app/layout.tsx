import type { Metadata } from "next";
import { Newsreader, Inter } from "next/font/google";
import "./globals.css";
import { siteUrl } from "./data";

const serif = Newsreader({ subsets: ["latin"], style: ["normal", "italic"], axes: ["opsz"], variable: "--font-serif" });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });

// Cookieless analytics: Umami for visitors, pages, referrers and location (down to
// city), and Cloudflare Web Analytics for page-load timings. Both IDs are public
// by design. Only included on the live Vercel deployment, so local and preview
// visits aren't counted.
const UMAMI_WEBSITE_ID = "73d884f2-0340-40ef-a97d-c0a38d66acc6";
const CLOUDFLARE_BEACON_TOKEN = "08707a8d09b648ff89d3a94c7ac11a3b";
const live = process.env.VERCEL_ENV === "production";

const description =
  "Software engineer and University of Waterloo student, building backend systems and infrastructure. Previously at Cloudflare, HubSpot and Shopify.";

// The preview image itself comes from app/opengraph-image.tsx.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Richard Miao",
  description,
  openGraph: { type: "website", url: "/", siteName: "Richard Miao", title: "Richard Miao", description },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${serif.variable} ${sans.variable}`}>
      <head>
        {/* Lets CSS hide not-yet-revealed sections only when JS will reveal them. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        {live && (
          <>
            <script defer src="https://cloud.umami.is/script.js" data-website-id={UMAMI_WEBSITE_ID} />
            <script
              defer
              src="https://static.cloudflareinsights.com/beacon.min.js"
              data-cf-beacon={JSON.stringify({ token: CLOUDFLARE_BEACON_TOKEN })}
            />
          </>
        )}
      </head>
      <body>{children}</body>
    </html>
  );
}
