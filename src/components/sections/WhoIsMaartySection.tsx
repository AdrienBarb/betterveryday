import Image from "next/image";

export default function WhoIsMaartySection() {
  return (
    <section id="who-is-maarty" className="container mx-auto px-4 py-20">
      <div className="mx-auto max-w-4xl text-center">
        <span
          className="inline-block px-4 py-2 text-sm font-bold text-white rounded-full mb-4 uppercase tracking-wide"
          style={{ backgroundColor: "#F4B953" }}
        >
          Who is Maarty?
        </span>

        <div className="flex justify-center mb-6">
          <Image
            src="/maarty-cap.png"
            alt="Maarty"
            width={300}
            height={300}
            className="w-64 h-64 object-contain"
          />
        </div>

        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-text">
          Your tiny green mentor who helps you stay on track.
        </h2>

        <p className="text-lg text-text/80 max-w-2xl mx-auto mb-8">
          Maarty is a soft-spoken little character who checks in with you every
          day. Not a productivity bro. Not a cold AI. Just a warm companion who
          helps you move toward the goal that truly matters to you.
        </p>
      </div>
    </section>
  );
}
