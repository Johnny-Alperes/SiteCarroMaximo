"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Car, Menu, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { name: "Recursos", href: "#features" },
  { name: "Preços", href: "#pricing" },
  { name: "Depoimentos", href: "#testimonials" },
  { name: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        isScrolled
          ? "bg-background/80 backdrop-blur-lg border-border py-3"
          : "bg-transparent border-transparent py-5"
      )}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300">
            <Car className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gradient">
            Carro Máximo
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/signup"
            className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all premium-shadow flex items-center gap-2 group"
          >
            Começar Agora
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border p-6 md:hidden"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-lg font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <hr className="border-border my-2" />
              <Link
                href="/login"
                className="text-lg font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Entrar
              </Link>
              <Link
                href="/signup"
                className="bg-primary text-white p-4 rounded-2xl text-center font-bold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Começar Agora
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
