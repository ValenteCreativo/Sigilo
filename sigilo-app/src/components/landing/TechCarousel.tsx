"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface TechPartner {
  name: string;
  logo: string;
  description: string;
  role: string;
  planned?: boolean;
}

const techPartners: TechPartner[] = [
  {
    name: "EVVM",
    logo: "/EVVM.png",
    description:
      "Virtual chains isolate each submission in its own blockchain running inside a smart contract, minimizing on-chain footprint.",
    role: "Isolated Virtual Chains",
  },
  {
    name: "vLayer",
    logo: "/VLayer.png",
    description:
      "zkTLS proofs verify you're a journalist, official, or citizen without revealing your identity or credentials.",
    role: "Zero-Knowledge Identity",
  },
  {
    name: "Protocol Labs",
    logo: "/ProtocolLabs.png",
    description:
      "Open-source R&D lab behind IPFS, Filecoin, and other protocols for resilient, censorship-resistant data infrastructure.",
    role: "Protocol R&D",
  },
  {
    name: "Filecoin",
    logo: "/Filecoin.png",
    description:
      "Encrypted evidence stored on a decentralized network with no single point of failure or subpoena risk.",
    role: "Decentralized Storage",
    planned: true,
  },
  {
    name: "Aztec",
    logo: "/Aztec.png",
    description:
      "Privacy-first L2 for confidential on-chain interactions and hardened transaction traces.",
    role: "Privacy Layer 2",
    planned: true,
  },
  {
    name: "Nym",
    logo: "/Nym.png",
    description:
      "Mixnet routing strips network metadata making surveillance significantly harder.",
    role: "Network Privacy",
    planned: true,
  },
  {
    name: "GGWave",
    logo: "/GGWave.png",
    description:
      "Offline acoustic relays carry encrypted alerts when internet is blocked.",
    role: "Offline Transmission",
  },
  {
    name: "ml5.js",
    logo: "/ml5-js.png",
    description:
      "On-device AI detects safewords to trigger recording without touching the screen.",
    role: "Voice Detection",
    planned: true,
  },
];

export function TechCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % techPartners.length);
  }, []);

  const prevSlide = useCallback(() => {
    setActiveIndex(
      (prev) => (prev - 1 + techPartners.length) % techPartners.length,
    );
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || isHovered) return;
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, isHovered, nextSlide]);

  const activeTech = techPartners[activeIndex];

  return (
    <section id="tech-stack" className="py-20 px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-radial from-sigilo-teal/5 via-transparent to-transparent opacity-50" />

      <div className="max-w-6xl mx-auto relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Powered by cutting-edge technology
        </h2>
        <p className="text-sigilo-text-secondary text-center mb-12 max-w-2xl mx-auto">
          Each layer in our stack addresses a specific attack vector, creating
          multiple shields around your identity.
        </p>

        {/* Main carousel area */}
        <div
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Featured tech card */}
          <div className="flex flex-col lg:flex-row items-center gap-8 mb-12">
            {/* Logo display */}
            <div className="relative w-full lg:w-1/2 aspect-video flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-radial from-sigilo-teal/10 via-transparent to-transparent rounded-3xl" />
              <div className="relative glass-strong rounded-3xl p-8 w-full h-full flex items-center justify-center group">
                {/* Animated border */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-sigilo-teal via-sigilo-teal-light to-sigilo-teal animate-pulse opacity-20" />
                </div>

                <div className="relative w-48 h-48 transition-transform duration-500 group-hover:scale-110">
                  <Image
                    src={activeTech.logo}
                    alt={activeTech.name}
                    fill
                    className="object-contain filter drop-shadow-lg"
                    priority
                  />
                </div>

                {activeTech.planned && (
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-sigilo-amber/20 border border-sigilo-amber/30 text-sigilo-amber text-xs font-medium">
                    Coming Soon
                  </div>
                )}
              </div>
            </div>

            {/* Info panel */}
            <div className="w-full lg:w-1/2 text-center lg:text-left">
              <div className="inline-block px-3 py-1 rounded-full bg-sigilo-teal/10 border border-sigilo-teal/30 text-sigilo-teal text-sm font-medium mb-4">
                {activeTech.role}
              </div>
              <h3 className="text-3xl font-bold text-sigilo-text-primary mb-4">
                {activeTech.name}
              </h3>
              <p className="text-sigilo-text-secondary text-lg leading-relaxed mb-6">
                {activeTech.description}
              </p>

              {/* Navigation arrows */}
              <div className="flex items-center gap-4 justify-center lg:justify-start">
                <button
                  onClick={prevSlide}
                  className="p-3 rounded-full glass hover:bg-sigilo-teal/20 transition-colors"
                  aria-label="Previous technology"
                >
                  <svg
                    className="w-5 h-5 text-sigilo-teal"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={nextSlide}
                  className="p-3 rounded-full glass hover:bg-sigilo-teal/20 transition-colors"
                  aria-label="Next technology"
                >
                  <svg
                    className="w-5 h-5 text-sigilo-teal"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className={`p-3 rounded-full glass transition-colors ${
                    isAutoPlaying ? "bg-sigilo-teal/20" : ""
                  }`}
                  aria-label={
                    isAutoPlaying ? "Pause autoplay" : "Start autoplay"
                  }
                >
                  {isAutoPlaying ? (
                    <svg
                      className="w-5 h-5 text-sigilo-teal"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-sigilo-teal"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Thumbnail strip */}
          <div className="flex justify-center gap-3 flex-wrap">
            {techPartners.map((tech, index) => (
              <button
                key={tech.name}
                onClick={() => setActiveIndex(index)}
                className={`
                  relative p-3 rounded-xl transition-all duration-300 group
                  ${
                    index === activeIndex
                      ? "glass-strong scale-110 glow-teal"
                      : "glass hover:scale-105 opacity-60 hover:opacity-100"
                  }
                `}
              >
                <div className="relative w-12 h-12">
                  <Image
                    src={tech.logo}
                    alt={tech.name}
                    fill
                    className="object-contain"
                  />
                </div>
                {tech.planned && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-sigilo-amber" />
                )}

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-sigilo-card text-xs text-sigilo-text-secondary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {tech.name}
                </div>
              </button>
            ))}
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-6">
            {techPartners.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`
                  h-1.5 rounded-full transition-all duration-300
                  ${
                    index === activeIndex
                      ? "w-8 bg-sigilo-teal"
                      : "w-1.5 bg-sigilo-border hover:bg-sigilo-teal/50"
                  }
                `}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
