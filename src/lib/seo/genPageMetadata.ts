import { Metadata } from "next";
import { siteMetadata } from "@/data/siteMetadata";

interface PageSEOProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  [key: string]: any;
}

export function genPageMetadata({
  title,
  description,
  image,
  url = "./",
  ...rest
}: PageSEOProps): Metadata {
  const absoluteUrl = url.startsWith("http")
    ? url
    : `${siteMetadata.siteUrl}${url}`;

  const imageUrl = image
    ? image
    : `${siteMetadata.siteUrl}${siteMetadata.socialBanner}`;

  return {
    metadataBase: new URL(siteMetadata.siteUrl),
    title: {
      default: title || siteMetadata.title,
      template: `%s | ${siteMetadata.title}`,
    },
    description: description || siteMetadata.description,
    keywords: [
      "startup ideas",
      "solo founder",
      "build in 7 days",
      "newsletter",
      "entrepreneurship",
      "startup newsletter",
      "solo entrepreneur",
      "weekly newsletter",
    ],
    authors: [{ name: siteMetadata.title }],
    creator: siteMetadata.title,
    publisher: siteMetadata.title,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      title: `${title} | ${siteMetadata.title}`,
      description: description || siteMetadata.description,
      url: absoluteUrl,
      siteName: siteMetadata.title,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${title} | ${siteMetadata.title}`,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      title: `${title} | ${siteMetadata.title}`,
      description: description || siteMetadata.description,
      card: "summary_large_image",
      images: [
        {
          url: imageUrl,
          alt: `${title} | ${siteMetadata.title}`,
        },
      ],
      creator: siteMetadata.twitter,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: absoluteUrl,
    },
    ...rest,
  };
}
