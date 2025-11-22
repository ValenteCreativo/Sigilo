"use client";

export function Mission() {
  return (
    <section id="mission" className="py-20 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Sigilo exists</h2>

        <div className="space-y-6 text-sigilo-text-secondary leading-relaxed">
          <p>
            In many regions, telling the truth is dangerous. Journalists are
            threatened for exposing corruption, local officials are punished for
            resisting organized crime, and citizens pay the price of speaking out
            in public.
          </p>

          <p>
            Sigilo is built for these contexts. It combines stealth interfaces,
            zero-knowledge proofs, decentralized storage and network-level privacy
            to create a channel where evidence can move—but identities cannot be
            hunted.
          </p>

          <p className="text-sigilo-teal font-medium">
            Sigilo is not about headlines; it is about keeping people alive long
            enough for the truth to matter.
          </p>
        </div>

        {/* Visual separator */}
        <div className="mt-12 flex items-center justify-center gap-3">
          <div className="w-16 h-px bg-gradient-to-r from-transparent to-sigilo-teal/50" />
          <div className="w-2 h-2 rounded-full bg-sigilo-teal/50" />
          <div className="w-16 h-px bg-gradient-to-l from-transparent to-sigilo-teal/50" />
        </div>
      </div>
    </section>
  );
}
