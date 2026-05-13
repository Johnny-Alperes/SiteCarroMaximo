"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy,
  getDocs
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  ChevronLeft, 
  Search, 
  Filter,
  Calendar,
  DollarSign,
  Car as CarIcon,
  Wrench, AlertTriangle, Droplet, Battery, FileText, CreditCard, 
  Wind, Disc, Fuel, Waves, Ban, Map, Compass, ClipboardCheck, Gauge
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const categoryIcons: any = {
  servicos: Wrench,
  defeitos: AlertTriangle,
  oleo: Droplet,
  bateria: Battery,
  ipva: FileText,
  licenciamento: CreditCard,
  "ar-condicionado": Wind,
  calibragem: Gauge,
  abastecimento: Fuel,
  lavagem: Waves,
  multas: Ban,
  viagem: Map,
  pneus: Disc,
  alinhamento: Compass,
  revisoes: ClipboardCheck,
  filtros: Filter,
};

const categoryNames: any = {
  servicos: "Serviços",
  defeitos: "Defeitos",
  oleo: "Óleo",
  bateria: "Bateria",
  ipva: "IPVA",
  licenciamento: "Licenciamento",
  "ar-condicionado": "Ar-Condicionado",
  calibragem: "Calibragem",
  abastecimento: "Abastecimento",
  lavagem: "Lavagem",
  multas: "Multas",
  viagem: "Viagem",
  pneus: "Pneus",
  alinhamento: "Alinhamento",
  revisoes: "Revisões",
  filtros: "Filtros",
};

const categoryKeywords: any = {
  oleo: ["óleo", "lubrificante"],
  bateria: ["bateria", "elétrica"],
  "ar-condicionado": ["ar", "condicionado", "higienização"],
  calibragem: ["calibragem", "pneu", "pressão"],
  lavagem: ["lavagem", "ducha", "estética", "limpeza"],
  pneus: ["pneu", "borracharia"],
  alinhamento: ["alinhamento", "balanceamento", "cambagem"],
  filtros: ["filtro", "combustível", "ar", "cabine"],
  revisoes: ["revisão", "periódica", "check-up"],
  defeitos: ["defeito", "problema", "quebra", "conserto"],
};

function HistoryContent() {
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get("category");
  
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // In a real scenario, we would fetch from multiple collections (maintenance, fuel, etc.)
        // and merge them. For now, we'll fetch from maintenance as a base.
        // Coleções EXATAS conforme estrutura do App
        const collections = [
          "alignment", "battery", "defects", "filters", "fuel", 
          "maintenance", "oil", "revision", "tires_records", "fines", "ipva"
        ];
        
        const fetchAll = async () => {
          let allRecords: any[] = [];
          
          try {
            const results = await Promise.all(
              collections.map(async (colName) => {
                const colRef = collection(db, `users/${user.uid}/${colName}`);
                const snapshot = await getDocs(colRef);
                return snapshot.docs.map(doc => {
                  const d = doc.data();
                  
                  // Nome dinâmico (Prioridade total para brand/type da Bateria conforme print)
                  let recordName = d.name || d.nome || d.descricao || d.servico || d.title || d.titulo;
                  if (!recordName || recordName === "Sem nome") {
                    if (d.brand && d.type) recordName = `${d.brand} (${d.type})`;
                    else if (d.brand) recordName = d.brand;
                    else if (d.type) recordName = d.type;
                    else if (colName === 'battery') recordName = "Bateria";
                    else recordName = "Sem nome";
                  }

                  // Extração robusta do vehicleId (pode ser string ou Reference)
                  const rawVehicleId = d.vehicleId || d.id_veiculo || d.veiculoId || d.idVeiculo;
                  const extractedVehicleId = typeof rawVehicleId === 'string' ? rawVehicleId : rawVehicleId?.id;

                  return {
                    id: doc.id,
                    type: colName,
                    name: recordName,
                    date: d.date || d.data || d.createdAt || d.updatedAt || "---",
                    price: d.price || d.valor || d.total || d.totalPrice || d.custo || d.preco || 0,
                    category: d.category || d.categoria || colName,
                    vehicleId: extractedVehicleId,
                    vehicleModel: d.vehicleModel || d.modeloVeiculo || d.modelo || d.veiculo || "---",
                    ...d
                  };
                });
              })
            );
            
            allRecords = results.flat();
            
            // Ordenar por data
            allRecords.sort((a, b) => {
              const getTime = (date: any) => {
                if (!date) return 0;
                if (date.seconds) return date.seconds * 1000;
                const t = new Date(date).getTime();
                return isNaN(t) ? 0 : t;
              };
              return getTime(b.date) - getTime(a.date);
            });
            
            if (categoryFilter) {
              allRecords = allRecords.filter(r => {
                const type = r.type.toLowerCase();
                const cat = categoryFilter.toLowerCase();
                
                const typeMap: any = {
                  "bateria": ["battery"],
                  "ar-condicionado": ["ac", "air_conditioning"],
                  "alinhamento": ["alignment"],
                  "oleo": ["oil"],
                  "abastecimento": ["fuel"],
                  "multas": ["fines"],
                  "pneus": ["tires_records"],
                  "lavagem": ["wash"],
                  "viagem": ["travel", "trip"],
                  "revisoes": ["revision"],
                  "filtros": ["filters"],
                  "calibragem": ["calibration"],
                  "defeitos": ["defects"],
                  "ipva": ["ipva"],
                  "licenciamento": ["licensing"],
                  "servicos": ["maintenance"]
                };

                if (typeMap[cat]?.includes(type)) return true;
                if (r.category === categoryFilter || r.categoria === categoryFilter) return true;
                
                const keywords = categoryKeywords[cat] || [];
                const recordName = (r.name || "").toLowerCase();
                return keywords.some((kw: string) => recordName.includes(kw));
              });
            }
            
            // FILTRO DE VEÍCULO (Opcional se vier da URL)
            const vehicleIdFilter = searchParams.get("vehicleId");
            if (vehicleIdFilter) {
              allRecords = allRecords.filter(r => r.vehicleId === vehicleIdFilter);
            }
            
            setRecords(allRecords);
            setLoading(false);
          } catch (err) {
            console.error("Erro geral ao buscar histórico:", err);
            setLoading(false);
          }
        };

        fetchAll();
      }
    });

    return () => unsubscribeAuth();
  }, [categoryFilter, searchParams]);

  const filteredRecords = records.filter(r => 
    (r.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (r.model?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (r.vehicleModel?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateVal: any) => {
    if (!dateVal || dateVal === "---") return "---";
    if (dateVal.seconds) {
      const d = new Date(dateVal.seconds * 1000);
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    }
    
    if (typeof dateVal === 'string') {
      if (/^\d{2}\/\d{2}\/\d{4}/.test(dateVal)) return dateVal.split(/[\sT]+/)[0];
      if (/^\d{4}-\d{2}-\d{2}/.test(dateVal)) {
        const parts = dateVal.split('T')[0].split('-');
        if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }

    try {
      const d = new Date(dateVal);
      if (!isNaN(d.getTime())) {
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
      }
      return String(dateVal);
    } catch {
      return String(dateVal);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-primary transition-colors mb-4">
            <ChevronLeft className="w-4 h-4" />
            Voltar para o Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Histórico de {categoryFilter ? categoryNames[categoryFilter] : "Atividades"}</h1>
          <p className="text-foreground/60">Visualize todos os registros salvos em sua conta.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <input 
              type="text" 
              placeholder="Pesquisar por nome ou veículo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-card border border-border rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-primary/50 transition-all"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-card/50 border border-border rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : filteredRecords.length === 0 ? (
        <Card className="p-20 text-center flex flex-col items-center justify-center border-dashed">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <Filter className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">Nenhum registro encontrado</h3>
          <p className="text-foreground/60">Não encontramos nenhum histórico para os filtros selecionados.</p>
          <p className="text-xs text-foreground/40 mt-2">Verifique se você possui dados cadastrados no App para esta categoria.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredRecords.map((record, index) => {
              const Icon = categoryIcons[record.category] || categoryIcons[record.type] || CarIcon;
              return (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-4 hover:border-primary/30 transition-all group">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="p-3 bg-primary/10 rounded-2xl group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h4 className="font-bold truncate max-w-full text-sm sm:text-base">{record.name}</h4>
                            {record.vehicleModel && record.vehicleModel !== "---" && (
                              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/5 border border-border shrink-0">
                                {record.vehicleModel}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-foreground/40">
                            <div className="flex items-center gap-1 shrink-0">
                              <Calendar className="w-3 h-3" />
                              <span className="truncate">{formatDate(record.date)}</span>
                            </div>
                            <div className="w-1 h-1 bg-border rounded-full shrink-0"></div>
                            <div className="capitalize truncate">{categoryNames[record.type] || record.type}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right shrink-0">
                        <p className="font-bold text-sm sm:text-lg whitespace-nowrap">
                          {record.price ? `R$ ${record.price}` : "---"}
                        </p>
                        <p className="text-[10px] text-foreground/40 uppercase font-bold">Valor</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center">Carregando...</div>}>
      <HistoryContent />
    </Suspense>
  );
}
