"use client";

import { motion } from "framer-motion";
import { 
  Wrench, AlertTriangle, Droplet, Battery, FileText, CreditCard, 
  Wind, Disc, Fuel, Waves, Ban, Map, Compass, ClipboardCheck, Filter, 
  ChevronRight, Gauge
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";

const categories = [
  { name: "Serviços", icon: Wrench, color: "text-blue-500", bg: "bg-blue-500/10", id: "servicos" },
  { name: "Defeitos", icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10", id: "defeitos" },
  { name: "Óleo", icon: Droplet, color: "text-amber-600", bg: "bg-amber-600/10", id: "oleo" },
  { name: "Bateria", icon: Battery, color: "text-emerald-500", bg: "bg-emerald-500/10", id: "bateria" },
  { name: "IPVA", icon: FileText, color: "text-purple-500", bg: "bg-purple-500/10", id: "ipva" },
  { name: "Licenciamento", icon: CreditCard, color: "text-indigo-500", bg: "bg-indigo-500/10", id: "licenciamento" },
  { name: "Ar-Condicionado", icon: Wind, color: "text-cyan-500", bg: "bg-cyan-500/10", id: "ar-condicionado" },
  { name: "Calibragem", icon: Gauge, color: "text-orange-500", bg: "bg-orange-500/10", id: "calibragem" },
  { name: "Abastecimento", icon: Fuel, color: "text-emerald-600", bg: "bg-emerald-600/10", id: "abastecimento" },
  { name: "Lavagem", icon: Waves, color: "text-blue-400", bg: "bg-blue-400/10", id: "lavagem" },
  { name: "Multas", icon: Ban, color: "text-red-600", bg: "bg-red-600/10", id: "multas" },
  { name: "Viagem", icon: Map, color: "text-rose-500", bg: "bg-rose-500/10", id: "viagem" },
  { name: "Pneus", icon: Disc, color: "text-slate-400", bg: "bg-slate-400/10", id: "pneus" },
  { name: "Alinhamento", icon: Compass, color: "text-teal-500", bg: "bg-teal-500/10", id: "alinhamento" },
  { name: "Revisões", icon: ClipboardCheck, color: "text-green-500", bg: "bg-green-500/10", id: "revisoes" },
  { name: "Filtros", icon: Filter, color: "text-yellow-600", bg: "bg-yellow-600/10", id: "filtros" },
];

interface QuickActionsProps {
  vehicleId?: string;
  compact?: boolean;
}

export default function DashboardQuickActions({ vehicleId, compact = false }: QuickActionsProps) {
  return (
    <div className={`grid ${compact ? 'grid-cols-4' : 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-8'} gap-2 sm:gap-4`}>
      {categories.map((cat, index) => (
        <motion.div
          key={cat.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.02 }}
        >
          <Link href={`/dashboard/history?category=${cat.id}${vehicleId ? `&vehicleId=${vehicleId}` : ''}`}>
            <Card className={`flex flex-col items-center justify-center ${compact ? 'p-2 h-20' : 'p-4 h-32'} hover:border-primary/50 transition-all group cursor-pointer border-border/40 bg-card/30 backdrop-blur-sm`}>
              <div className={`${cat.bg} ${compact ? 'p-1.5 mb-1.5' : 'p-3 rounded-2xl mb-3'} rounded-xl group-hover:scale-110 transition-transform`}>
                <cat.icon className={`${compact ? 'w-4 h-4' : 'w-6 h-6'} ${cat.color}`} />
              </div>
              <span className={`${compact ? 'text-[8px]' : 'text-[10px]'} font-bold uppercase tracking-wider text-center line-clamp-1 text-foreground/70`}>
                {cat.name}
              </span>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
