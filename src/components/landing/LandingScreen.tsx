"use client";

import { useState } from "react";
import Link from "next/link";
import { Car, Menu, X } from "lucide-react";

const backgroundImage =
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=80";

export default function LandingScreen() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-zinc-950 font-mono text-white antialiased selection:bg-zinc-700">
      <div className="absolute inset-0">
        <div
          className="h-full w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      </div>
      <div className="absolute inset-0 bg-zinc-950/70" />

      <header className="relative z-20 flex h-14 shrink-0 items-center justify-between border-b border-zinc-800 px-6">
        <Link href="/" className="flex items-center gap-3">
          <Car className="h-4 w-4 text-zinc-500" />
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
            Carro Máximo
          </span>
        </Link>

        <nav className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="text-xs uppercase tracking-widest text-zinc-300 transition-colors hover:text-white"
          >
            Acessar
          </Link>
          <Link
            href="/login"
            className="bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-zinc-950 transition-all hover:bg-zinc-200"
          >
            Entrar
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="text-zinc-500 transition-colors hover:text-white md:hidden"
          aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
        >
          {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </header>

      {isMenuOpen && (
        <div className="relative z-20 space-y-3 border-b border-zinc-800 bg-zinc-950 px-6 py-4 md:hidden">
          <Link
            href="/login"
            onClick={() => setIsMenuOpen(false)}
            className="block text-xs uppercase tracking-widest text-zinc-300"
          >
            Acessar
          </Link>
          <Link
            href="/login"
            onClick={() => setIsMenuOpen(false)}
            className="block w-full bg-white px-4 py-2 text-center text-xs font-bold uppercase tracking-widest text-zinc-950"
          >
            Entrar
          </Link>
        </div>
      )}

      <main className="relative z-10 flex flex-1 items-center justify-center p-6">
        <div className="space-y-6 text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-zinc-300">
            Gestão Automotiva Inteligente
          </span>

          <h1 className="text-5xl font-black leading-[0.85] tracking-tighter text-white md:text-8xl">
            SEU
            <br />
            <span className="text-zinc-500">VEÍCULO</span>
            <br />
            NO CONTROLE
          </h1>

          <p className="mx-auto max-w-lg text-base leading-relaxed text-zinc-300 md:text-lg">
            Manutenção, combustível, custos e alertas em um só lugar.
            Controle total do seu veículo em tempo real.
          </p>

          <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row">
            <Link
              href="/register"
              className="bg-white px-8 py-4 text-base font-bold uppercase tracking-widest text-zinc-950 transition-all hover:bg-zinc-200"
            >
              Cadastrar-se
            </Link>
            <Link
              href="/login"
              className="border border-zinc-600 px-8 py-4 text-base font-bold uppercase tracking-widest text-zinc-300 transition-all hover:border-zinc-500 hover:text-white"
            >
              Acessar painel
            </Link>
          </div>
        </div>
      </main>

      <footer className="relative z-10 flex h-12 items-center justify-between border-t border-zinc-800 px-6 text-[9px] uppercase tracking-[0.15em] text-zinc-700">
        <span>&copy; 2026 — Carro Máximo</span>
        <span>CM</span>
      </footer>
    </div>
  );
}
