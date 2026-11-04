"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Car, LogIn, Menu, X } from "lucide-react";

const backgroundImage =
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=80";

export default function LandingScreen() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-[#050505] font-mono text-white antialiased selection:bg-primary/30">
      <div className="absolute inset-0">
        <div
          className="h-full w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      </div>
      <div className="absolute inset-0 bg-[#050505]/80" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.25),transparent_60%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/60" />

      <header className="relative z-20 flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <Car className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60 sm:text-xs">
            Carro Máximo
          </span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 border border-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white/70 transition-colors hover:border-primary/50 hover:text-white"
          >
            <LogIn className="h-3.5 w-3.5" />
            Entrar
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-primary px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-primary/90"
          >
            Começar
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="text-white/60 transition-colors hover:text-white md:hidden"
          aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
        >
          {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </header>

      {isMenuOpen && (
        <div className="relative z-20 space-y-2 border-b border-white/10 bg-[#050505]/95 px-4 py-4 backdrop-blur md:hidden">
          <Link
            href="/login"
            onClick={() => setIsMenuOpen(false)}
            className="flex w-full items-center justify-center gap-2 border border-white/15 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white/70"
          >
            <LogIn className="h-3.5 w-3.5" />
            Entrar
          </Link>
          <Link
            href="/register"
            onClick={() => setIsMenuOpen(false)}
            className="flex w-full items-center justify-center gap-2 bg-primary px-4 py-2 text-xs font-bold uppercase tracking-widest text-white"
          >
            Começar
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      <main className="relative z-10 flex flex-1 items-center justify-center p-4 sm:p-6">
        <div className="max-w-full space-y-5 text-center sm:space-y-6">
          <span className="text-[10px] uppercase tracking-[0.3em] text-primary sm:text-xs">
            Gestão Automotiva Inteligente
          </span>

          <h1 className="text-[clamp(2.75rem,9vw,6rem)] font-black leading-[0.85] tracking-tighter text-white">
            SEU
            <br />
            <span className="text-gradient">VEÍCULO</span>
            <br />
            NO CONTROLE
          </h1>

          <p className="mx-auto max-w-lg text-sm leading-relaxed text-white/60 sm:text-base md:text-lg">
            Manutenção, combustível, custos e alertas em um só lugar.
            Controle total do seu veículo em tempo real.
          </p>

          <div className="flex flex-col justify-center gap-2 pt-1 sm:flex-row sm:gap-3">
            <Link
              href="/register"
              className="group inline-flex items-center justify-center gap-2 bg-primary px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-primary/90 sm:py-4 sm:text-base"
            >
              Começar agora
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 border border-white/20 px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-white/70 transition-colors hover:border-primary/50 hover:text-white sm:py-4 sm:text-base"
            >
              Acessar painel
            </Link>
          </div>
        </div>
      </main>

      <footer className="relative z-10 flex h-10 shrink-0 items-center justify-between border-t border-white/10 px-4 text-[8px] uppercase tracking-[0.15em] text-white/30 sm:h-12 sm:px-6 sm:text-[9px]">
        <span>© 2026 — Carro Máximo</span>
        <span className="text-primary/70">CM</span>
      </footer>
    </div>
  );
}
