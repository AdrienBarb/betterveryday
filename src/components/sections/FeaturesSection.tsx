// components/HowMaartyWorksSection.tsx

const steps = [
  {
    title: "1. You choose one meaningful goal",
    description:
      "Something that matters to you right now: getting fitter, building a routine, progressing on a side project, learning a skill.",
    detail:
      "Maarty doesn't judge the goal. He just wants to understand why it matters to you.",
    icon: "🎯",
  },
  {
    title: "2. Maarty stays by your side",
    description: "Every day, Maarty checks in with a gentle message.",
    detail:
      "He asks how you feel, what you did, what got in the way: like a supportive friend who remembers your journey.",
    icon: "💬",
  },
  {
    title: "3. Telegram makes it effortless",
    description: "You talk with Maarty through a private Telegram chat.",
    detail:
      "No dashboards, no apps to install, just small exchanges that take less than a minute.",
    icon: "📱",
  },
  {
    title: "4. Weekly reflection to stay aligned",
    description: "Once a week, Maarty helps you look back.",
    detail:
      "He highlights patterns, celebrates progress, and reminds you why you started: so you stay consistent without pressure.",
    icon: "✨",
  },
];

export default function HowMaartyWorksSection() {
  return (
    <section
      id="how-maarty-works"
      className="container mx-auto px-4 py-20 bg-primary/10"
    >
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <span
            className="inline-block px-4 py-2 text-sm font-bold text-white rounded-full mb-4 uppercase tracking-wide"
            style={{ backgroundColor: "#F4B953" }}
          >
            How Maarty works
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-text">
            Daily support. Gentle nudges. Honest reflection.
          </h2>
          <p className="text-lg text-text/80 max-w-2xl mx-auto">
            Maarty doesn&apos;t set plans or assign tasks. He simply helps you
            stay connected to your goal through small, meaningful conversations.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {steps.map((step) => (
            <div
              key={step.title}
              className="rounded-2xl border bg-white/80 px-5 py-5 flex flex-col"
            >
              <div className="flex items-start gap-3 mb-2">
                <div className="text-2xl">{step.icon}</div>
                <h3 className="font-semibold text-text text-base md:text-lg">
                  {step.title}
                </h3>
              </div>
              <p className="text-sm text-text/80 mb-1">{step.description}</p>
              <p className="text-sm text-text/70">{step.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
