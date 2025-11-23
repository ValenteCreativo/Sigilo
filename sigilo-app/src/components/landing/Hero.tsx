"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button, Badge } from "@/components/ui";
import { EncryptedText } from "@/components/effects";

export function Hero() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-sigilo-teal/5 via-transparent to-transparent" />

      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(20, 184, 166, 0.3) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(20, 184, 166, 0.3) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-sigilo-teal/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="absolute -inset-4 bg-sigilo-teal/10 blur-3xl rounded-full" />
            <Image
              src="/Logo-SIGILO-White.png"
              alt="Sigilo logo"
              width={160}
              height={160}
              priority
              className="relative drop-shadow-lg"
            />
          </div>
        </div>

        {/* Logo with encrypted effect */}
        <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-6">
          <span className="text-gradient">
            {isLoaded ? (
              <EncryptedText text="SIGILO" delay={300} speed={80} />
            ) : (
              "SIGILO"
            )}
          </span>
        </h1>

        {/* Subtitle with reveal effect */}
        <h2 className="text-xl md:text-2xl text-sigilo-text-primary font-medium mb-4 max-w-2xl mx-auto">
          <span className={`inline-block transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Anonymous, verifiable whistleblowing for places where speaking can cost your life.
          </span>
        </h2>

        {/* Supporting text */}
        <p className={`text-sigilo-text-secondary text-base md:text-lg mb-8 max-w-xl mx-auto transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          Sigilo gives journalists, public officials and citizens a way to report
          corruption, violence and abuse without exposing their identities, their
          devices or their network traces.
        </p>

        {/* Security status indicator */}
        <div className={`flex items-center justify-center gap-2 mb-8 transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full glass">
            <div className="w-2 h-2 rounded-full bg-sigilo-teal animate-pulse" />
            <span className="text-sm text-sigilo-text-secondary">
              End-to-end encrypted
            </span>
            <span className="text-sigilo-text-muted">•</span>
            <span className="text-sm text-sigilo-text-secondary">
              Zero-knowledge proofs
            </span>
            <span className="text-sigilo-text-muted">•</span>
            <span className="text-sm text-sigilo-text-secondary">
              Decentralized storage
            </span>
          </div>
        </div>

        {/* CTAs */}
        <div className={`flex flex-col sm:flex-row gap-4 justify-center mb-12 transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Link href="/app">
            <Button variant="primary" size="lg" className="w-full sm:w-auto group">
              <span className="flex items-center gap-2">
                Open Sigilo
                <svg
                  className="w-4 h-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Button>
          </Link>
          <Button variant="secondary" size="lg" className="w-full sm:w-auto">
            Get the app
          </Button>
        </div>

        {/* Tech badges - now links to carousel */}
        <a href="#tech-stack" className={`inline-block transition-all duration-1000 delay-900 hover:scale-105 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <div className="space-y-3 cursor-pointer">
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="info" size="md">EVVM</Badge>
              <Badge variant="info" size="md">vLayer</Badge>
              <Badge variant="info" size="md">Filecoin</Badge>
            </div>
            <p className="text-xs text-sigilo-text-muted">
              Private integrations:{" "}
              <span className="text-sigilo-text-secondary">
                Aztec · Nym · GGWave · ml5.js
              </span>
            </p>
            <p className="text-xs text-sigilo-teal/70">
              ↓ Learn more about our tech stack
            </p>
          </div>
        </a>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg
          className="w-6 h-6 text-sigilo-text-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
}
