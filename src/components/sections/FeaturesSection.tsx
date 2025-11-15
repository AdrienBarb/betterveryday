const features = [
  {
    title: "Daily Priority",
    description: "Start each day with a simple, meaningful action designed to push you toward your goal.",
  },
  {
    title: "AI Guidance",
    description: "Get encouragement, feedback, and adjustments based on your real progress.",
  },
  {
    title: "Weekly Review",
    description: "Understand your patterns. Learn what works. Build momentum with clear next steps.",
  },
  {
    title: "Simple Progress Tracking",
    description: "One quick check-in per day. No complicated dashboards. Just steady, visible improvement.",
  },
  {
    title: "WhatsApp Notifications",
    description: "Your priorities and check-ins arrive where you already are. No app to install. No friction.",
  },
  {
    title: "One Goal, Laser Focused",
    description: "You work on one goal at a time, with full focus. No dispersion, no multitasking — just real progress where it matters most.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="container mx-auto px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 text-sm font-bold text-white rounded-full mb-4 uppercase tracking-wide" style={{ backgroundColor: '#F4B953' }}>
            features
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-lg border bg-white hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2 text-text">
                {feature.title}
              </h3>
              <p className="text-text/80">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

