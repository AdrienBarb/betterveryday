export default function TransformationSection() {
  const beforeItems = [
    "Overwhelmed, distracted, and inconsistent",
    "Unsure what to focus on",
    "Starting goals but never sticking to them",
    "Losing motivation after a few days",
  ];

  const afterItems = [
    "Clear direction",
    "One daily action that actually matters",
    "Consistency that builds naturally",
    "A feeling of progress you can see and feel",
  ];

  return (
    <section className="container mx-auto px-4 py-20 bg-primary/30">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 text-sm font-bold text-white rounded-full mb-4 uppercase tracking-wide" style={{ backgroundColor: '#F4B953' }}>
            the transformation
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="p-6 rounded-lg bg-white">
            <h3 className="text-2xl font-semibold mb-6 text-text">Before:</h3>
            <ul className="space-y-4">
              {beforeItems.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-text/60 mt-1">•</span>
                  <span className="text-text/80">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-6 rounded-lg bg-white">
            <h3 className="text-2xl font-semibold mb-6 text-text">After:</h3>
            <ul className="space-y-4">
              {afterItems.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-text/60 mt-1">•</span>
                  <span className="text-text/80">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 text-center">
          <p className="text-lg text-text/80 max-w-2xl mx-auto">
            Maarty gives you structure, focus, and the confidence to keep moving forward — every single day.
          </p>
        </div>
      </div>
    </section>
  );
}

