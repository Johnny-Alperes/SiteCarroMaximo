"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronRight, Play } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full mb-6">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-primary text-sm font-semibold tracking-wide uppercase">
                Nova Versão 2.0 Disponível
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
              Gerencie seu veículo com <br />
              <span className="text-gradient">Inteligência Máxima</span>
            </h1>
            
            <p className="text-lg md:text-xl text-foreground/60 max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed">
              A plataforma definitiva para motoristas e gestores de frota. Controle manutenção, 
              combustível e despesas em uma interface premium de última geração.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-full text-lg font-bold transition-all premium-shadow flex items-center justify-center gap-2 group">
                Começar agora
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full sm:w-auto bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 px-8 py-4 rounded-full text-lg font-bold transition-all flex items-center justify-center gap-2">
                <Play className="w-5 h-5 fill-current" />
                Ver demonstração
              </button>
            </div>
            
            <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 grayscale opacity-50">
              <span className="text-sm font-bold tracking-widest uppercase">Trusted by</span>
              <div className="flex gap-6 italic font-serif text-xl">
                <span>AutoCorp</span>
                <span>FleetPro</span>
                <span>MaxDrive</span>
              </div>
            </div>
          </motion.div>

          {/* Visual Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="flex-1 relative"
          >
            <div className="relative z-10 rounded-2xl overflow-hidden border border-white/10 premium-shadow">
              <Image 
                src="/hero_dashboard.png" 
                alt="Dashboard Carro Máximo" 
                width={700} 
                height={500}
                className="w-full h-auto"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent"></div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-[80px]"></div>
            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-secondary/10 rounded-full blur-[100px]"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
