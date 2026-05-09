"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import Image from "next/image";

const testimonials = [
  {
    name: "Ricardo Santos",
    role: "Motorista de Aplicativo",
    content: "Finalmente um app que resolve tudo! O controle de combustível me ajudou a economizar 15% por mês. A interface é intuitiva e muito rápida.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ricardo",
    rating: 5,
  },
  {
    name: "Ana Oliveira",
    role: "Gestora de Frota",
    content: "A interface é incrível. Parece que estou em um centro de comando. Gestão de frota nunca foi tão fácil e visualmente prazerosa.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
    rating: 5,
  },
  {
    name: "Marcos Viana",
    role: "Entusiasta Automotivo",
    content: "O melhor investimento para quem ama seu carro. Os alertas de manutenção são precisos e evitam gastos surpresa. Indispensável!",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcos",
    rating: 5,
  }
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px] -z-10"></div>
      
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full mb-4"
          >
            <Star className="w-4 h-4 text-primary fill-primary" />
            <span className="text-primary text-xs font-bold uppercase tracking-wider">Depoimentos</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Aprovado por quem <br />
            <span className="text-gradient">entende do assunto</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-card/50 backdrop-blur-xl border border-border p-8 rounded-[2.5rem] relative group hover:border-primary/30 transition-all hover:premium-shadow"
            >
              <Quote className="absolute top-8 right-8 w-12 h-12 text-primary/10 group-hover:text-primary/20 transition-colors" />
              
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>

              <p className="text-foreground/80 leading-relaxed mb-8 relative z-10 italic">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 overflow-hidden">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">{testimonial.name}</h4>
                  <p className="text-xs text-foreground/40">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
