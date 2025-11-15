"use client";

import config from "@/lib/config";

export default function LandingHero() {
  return (
    <section className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">{config.project.name}</h1>
      <p className="text-xl text-muted-foreground mb-2">
        {config.project.tagline}
      </p>
      <p className="text-lg mb-8">{config.seo.description}</p>

      <div className="flex gap-4 justify-center mb-12">
        <a
          href={config.social.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Twitter
        </a>
        <a
          href={config.social.github}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          GitHub
        </a>
        <a
          href={`mailto:${config.contact.email}`}
          className="text-primary hover:underline"
        >
          Contact
        </a>
      </div>
    </section>
  );
}
