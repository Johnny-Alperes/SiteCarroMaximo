"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Footer from "@/components/Footer";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const session = Cookies.get("session");
    if (session) {
      router.push("/dashboard");
    }
  }, [router]);

  return (
    <main className="relative flex flex-col min-h-screen overflow-x-hidden">
      <Navbar />
      
      <div id="hero" className="flex-1">
        <Hero />
      </div>

      <Features />
      
      <Footer />

      {/* Grid Background Effect */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
        <div className="absolute inset-0 bg-radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.15),transparent)"></div>
      </div>
      
      {/* Additional sections will go here */}
      <section id="features" className="py-20">
        {/* Placeholder for Features Section */}
      </section>
    </main>
  );
}
