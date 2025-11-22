"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const navItems: NavItem[] = [
  {
    href: "/app",
    label: "Dashboard",
    description: "Submit encrypted reports",
    color: "text-sigilo-teal",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/forum",
    label: "Signal Forum",
    description: "Browse encrypted signals",
    color: "text-sigilo-teal",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
  },
  {
    href: "/integrate",
    label: "Integrate",
    description: "Become a network node",
    color: "text-blue-400",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
  {
    href: "/safety",
    label: "Safety & OPSEC",
    description: "Security best practices",
    color: "text-amber-400",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
];

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  showBackToCalculator?: boolean;
}

export function AppShell({ children, title, showBackToCalculator = true }: AppShellProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { lock, sessionId, isAuthenticated } = useAuth();

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleLock = () => {
    lock();
    window.location.href = "/app";
  };

  return (
    <div className="min-h-screen bg-sigilo-bg">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-sigilo-bg/95 backdrop-blur-md border-b border-sigilo-border/30">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Burger Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 -ml-2 rounded-lg hover:bg-sigilo-surface/50 transition-colors"
            aria-label="Toggle menu"
          >
            <div className="w-5 h-5 flex flex-col justify-center gap-1">
              <span className={`block h-0.5 w-5 bg-sigilo-text-primary transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
              <span className={`block h-0.5 w-5 bg-sigilo-text-primary transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 w-5 bg-sigilo-text-primary transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
            </div>
          </button>

          {/* Title / Logo */}
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-sigilo-text-primary">
              {title || "SIGILO"}
            </h1>
            {isAuthenticated && (
              <span className="px-2 py-0.5 text-[10px] bg-sigilo-teal/20 text-sigilo-teal rounded-full font-medium">
                Protected
              </span>
            )}
          </div>

          {/* Session ID */}
          {sessionId && (
            <div className="text-[10px] font-mono text-sigilo-teal/70 hidden sm:block">
              {sessionId}
            </div>
          )}

          {/* Lock button (mobile) */}
          {showBackToCalculator && (
            <button
              onClick={handleLock}
              className="p-2 -mr-2 rounded-lg hover:bg-sigilo-surface/50 transition-colors sm:hidden"
              aria-label="Lock"
            >
              <svg className="w-5 h-5 text-sigilo-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </button>
          )}
        </div>
      </header>

      {/* Slide-out Menu Overlay */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Menu Panel */}
        <nav
          className={`absolute top-0 left-0 h-full w-72 bg-sigilo-card border-r border-sigilo-border/30 transform transition-transform duration-300 ease-out ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Menu Header */}
          <div className="p-4 border-b border-sigilo-border/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sigilo-teal/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-sigilo-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-sigilo-text-primary">Sigilo</h2>
                  <p className="text-xs text-sigilo-text-muted">Encrypted Whistleblowing</p>
                </div>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-sigilo-surface/50 transition-colors"
              >
                <svg className="w-5 h-5 text-sigilo-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Nav Items */}
          <div className="p-3 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? "bg-sigilo-teal/10 border border-sigilo-teal/30"
                      : "hover:bg-sigilo-surface/50 border border-transparent"
                  }`}
                >
                  <div className={`${item.color} ${isActive ? '' : 'opacity-60 group-hover:opacity-100'} transition-opacity`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${isActive ? 'text-sigilo-text-primary' : 'text-sigilo-text-secondary group-hover:text-sigilo-text-primary'} transition-colors`}>
                      {item.label}
                    </p>
                    <p className="text-xs text-sigilo-text-muted truncate">
                      {item.description}
                    </p>
                  </div>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-sigilo-teal" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sigilo-border/30">
            {showBackToCalculator && (
              <button
                onClick={handleLock}
                className="w-full flex items-center justify-center gap-2 p-3 bg-sigilo-surface/50 hover:bg-sigilo-surface rounded-xl text-sigilo-text-secondary hover:text-sigilo-text-primary transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-sm font-medium">Lock & Exit</span>
              </button>
            )}
            <p className="text-[10px] text-sigilo-text-muted text-center mt-3">
              Your identity is protected
            </p>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <main className="pt-14">
        {children}
      </main>
    </div>
  );
}
