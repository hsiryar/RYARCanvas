import { assetUrl, canonicalUrl, LOGO_PATH, SITE_DESCRIPTION, SITE_NAME, SITE_ORIGIN } from "@/lib/seo";

const organizationId = `${SITE_ORIGIN}/#organization`;
const websiteUrl = canonicalUrl("/");

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": organizationId,
    name: "RYAR Canvas",
    url: `${SITE_ORIGIN}/`,
    logo: assetUrl(LOGO_PATH),
    sameAs: ["https://www.instagram.com/ryarcanvas/"],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${websiteUrl}#website`,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: websiteUrl,
    inLanguage: "en",
    publisher: { "@id": organizationId },
  },
];

export default function StructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
      }}
    />
  );
}
