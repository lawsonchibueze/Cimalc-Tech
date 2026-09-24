import type { Metadata } from "next";
import { DM_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { absoluteUrl, siteConfig } from "@/lib/config/site";

const dmMono = DM_Mono({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--font-dm-mono", display: "swap" });

const title = `${siteConfig.name} | ${siteConfig.tagline}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: title, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  openGraph: { title, description: siteConfig.shortDescription, type: "website", siteName: siteConfig.name, images: [{ url: siteConfig.logo, width: 512, height: 512, alt: siteConfig.name }] },
  twitter: { card: "summary", title, description: siteConfig.shortDescription, images: [siteConfig.logo] },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: siteConfig.url,
  logo: absoluteUrl(siteConfig.logo),
  description: siteConfig.description,
  telephone: siteConfig.phone.tel,
  email: siteConfig.email,
  sameAs: [siteConfig.instagram.url],
  address: {
    "@type": "PostalAddress",
    streetAddress: siteConfig.address.street,
    addressLocality: siteConfig.address.locality,
    addressRegion: siteConfig.address.region,
    addressCountry: siteConfig.address.country,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={dmMono.variable}>
      <body className="min-w-0 overflow-x-hidden">
        <Providers>{children}</Providers>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      </body>
    </html>
  );
}
