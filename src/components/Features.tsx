"use client";

import { motion } from "framer-motion";
import { Fuel, Settings, Bell, BarChart3, Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Controle de Combustível",
    description: "Monitore cada centavo gasto e a eficiência do seu veículo com gráficos detalhados.",
    icon: <Fuel className="w-8 h-8 text-emerald-400" />,
    className: "md:col-span-2 md:row-span-1 bg-emerald-500/5 border-emerald-500/10",
  },
  {
    title: "Alertas de Manutenção",
    description: "Nunca mais esqueça a troca de óleo ou revisão periódica.",
    icon: <Settings className="w-8 h-8 text-blue-400" />,
    className: "md:col-span-1 md:row-span-1 bg-blue-500/5 border-blue-500/10",
  },
  {
    title: "Segurança Total",
    description: "Seus dados criptografados e sincronizados na nuvem.",
    icon: <Shield className="w-8 h-8 text-indigo-400" />,
    className: "md:col-span-1 md:row-span-1 bg-indigo-500/5 border-indigo-500/10",
  },
  {
    title: "Relatórios Inteligentes",
    description: "Visualize tendências e economize dinheiro com insights baseados em IA.",
    icon: <BarChart3 className="w-8 h-8 text-amber-400" />,
    className: "md:col-span-2 md:row-span-1 bg-amber-500/5 border-amber-500/10",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Tudo o que você precisa em <br />
            <span className="text-gradient">um só lugar</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-foreground/60 max-w-2xl mx-auto text-lg"
          >
            Esqueça as planilhas complicadas. O Carro Máximo oferece uma experiência moderna
            e intuitiva para cuidar do seu patrimônio.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[240px]">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "group relative p-8 rounded-[2.5rem] border overflow-hidden transition-all hover:premium-shadow",
                feature.className
              )}
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                {feature.icon}
              </div>
              
              <div className="h-full flex flex-col justify-between relative z-10">
                <div className="bg-background/50 backdrop-blur-md p-3 rounded-2xl w-fit border border-white/5">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-foreground/60 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>

              {/* Hover effect light */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </motion.div>
          ))}
          
          {/* Action Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="md:col-span-3 bg-primary p-12 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative"
          >
            <div className="relative z-10 text-center md:text-left">
              <h3 className="text-3xl font-bold text-white mb-4">Pronto para assumir o controle?</h3>
              <p className="text-white/80 max-w-xl">
                Junte-se a milhares de motoristas que já estão economizando tempo e dinheiro
                com o Carro Máximo.
              </p>
            </div>
            <button className="relative z-10 bg-white text-primary px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform">
              Criar minha conta agora
            </button>
            
            {/* Abstract Background Shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-10 -mb-10 blur-2xl"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
