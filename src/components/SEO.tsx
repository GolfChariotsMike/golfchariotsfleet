import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "product";
  structuredData?: object;
  noIndex?: boolean;
}

const SITE_NAME = "Golf Chariots Australia";
const DEFAULT_DESCRIPTION = "Australia's leading supplier of premium fat tyre golf scooters. Lease or buy GCA3 Trikes and GCA2 Scooters for your golf course.";
const DEFAULT_IMAGE = "/favicon.png";
const BASE_URL = "https://golfchariots.com.au";

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords,
  canonicalUrl,
  ogImage = DEFAULT_IMAGE,
  ogType = "website",
  structuredData,
  noIndex = false,
}: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const fullCanonicalUrl = canonicalUrl ? `${BASE_URL}${canonicalUrl}` : undefined;
  const fullOgImage = ogImage.startsWith("http") ? ogImage : `${BASE_URL}${ogImage}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {fullCanonicalUrl && <link rel="canonical" href={fullCanonicalUrl} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullOgImage} />
      {fullCanonicalUrl && <meta property="og:url" content={fullCanonicalUrl} />}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_AU" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}

// Pre-built structured data generators
export const structuredData = {
  localBusiness: {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Golf Chariots Australia",
    "description": "Australia's leading supplier of premium fat tyre golf scooters for golf courses.",
    "url": "https://golfchariots.com.au",
    "logo": "https://golfchariots.com.au/favicon.png",
    "image": "https://golfchariots.com.au/favicon.png",
    "telephone": "+61-400-000-000",
    "email": "info@golfchariots.com.au",
    "address": [
      {
        "@type": "PostalAddress",
        "addressLocality": "Perth",
        "addressRegion": "WA",
        "addressCountry": "AU"
      },
      {
        "@type": "PostalAddress",
        "addressLocality": "Sydney",
        "addressRegion": "NSW",
        "addressCountry": "AU"
      }
    ],
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -31.9505,
      "longitude": 115.8605
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "08:00",
      "closes": "17:00"
    },
    "priceRange": "$$",
    "areaServed": {
      "@type": "Country",
      "name": "Australia"
    }
  },

  product: (name: string, description: string, price: string, image: string) => ({
    "@context": "https://schema.org",
    "@type": "Product",
    "name": name,
    "description": description,
    "image": image,
    "brand": {
      "@type": "Brand",
      "name": "Golf Chariots Australia"
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "AUD",
      "price": price.replace(/[^0-9.]/g, ""),
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Golf Chariots Australia"
      }
    }
  }),

  faq: (questions: { question: string; answer: string }[]) => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": questions.map(q => ({
      "@type": "Question",
      "name": q.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": q.answer
      }
    }))
  }),

  breadcrumb: (items: { name: string; url: string }[]) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `https://golfchariots.com.au${item.url}`
    }))
  }),

  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Golf Chariots Australia",
    "url": "https://golfchariots.com.au",
    "logo": "https://golfchariots.com.au/favicon.png",
    "description": "Australia's leading supplier of premium fat tyre golf scooters.",
    "foundingDate": "2020",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+61-400-000-000",
      "contactType": "sales",
      "email": "info@golfchariots.com.au",
      "areaServed": "AU",
      "availableLanguage": "English"
    },
    "sameAs": []
  }
};
