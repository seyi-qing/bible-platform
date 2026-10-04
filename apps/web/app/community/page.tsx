import Link from "next/link";

const cards = [
  { title: "Bible Studies", text: "Build small, focused studies around Scripture and discuss them with your group." },
  { title: "Prayer Groups", text: "Keep prayer requests in a respectful, moderated space." },
  { title: "Discussions", text: "Talk about passages, questions and applications without turning the Bible reader into a noisy feed." },
];

export default function CommunityPage() {
  return (
    <main className="min-h-screen bg-[#07111F] px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="text-sm text-[#A7B0BE]">← Home</Link>
        <div className="mt-10 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#22D3EE]">Community</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-6xl">Study Scripture together.</h1>
          <p className="mt-5 text-lg leading-8 text-[#A7B0BE]">Groups are designed around Bible study, prayer and meaningful conversation—not engagement for engagement's sake.</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {cards.map((card) => (
            <article key={card.title} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-xl font-semibold">{card.title}</h2>
              <p className="mt-3 leading-7 text-[#A7B0BE]">{card.text}</p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
