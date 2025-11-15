export default function HowItWorksSection() {
  const steps = [
    {
      number: "1",
      title: "Set your goal",
      description:
        "Choose what you want to achieve — fitness, productivity, learning, habits, personal growth.",
      subDescription: "Your mentor transforms it into a clear plan.",
    },
    {
      number: "2",
      title: "Get your daily priority",
      description:
        "Every morning, you receive one actionable task tailored to your goal.",
      subDescription: "No overwhelm. No long to-do lists. Just clarity.",
    },
    {
      number: "3",
      title: "Review your progress every week",
      description: "End your week with a personalized report:",
      subDescription: "what worked, what didn't, and what to focus on next.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="container mx-auto px-4 py-20 bg-primary/30"
    >
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <span
            className="inline-block px-4 py-2 text-sm font-bold text-white rounded-full mb-4 uppercase tracking-wide"
            style={{ backgroundColor: "#F4B953" }}
          >
            how it works
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-6 rounded-lg bg-white"
            >
              <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center mb-6 text-2xl font-bold text-text">
                {step.number}
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-text">
                {step.title}
              </h3>
              <p className="text-text/80 mb-2">{step.description}</p>
              <p className="text-text/70 italic">{step.subDescription}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
