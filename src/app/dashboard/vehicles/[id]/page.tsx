"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { 
  doc, 
  getDoc, 
  collection, 
  getDocs,
  query, 
  where, 
  onSnapshot,
  orderBy
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  ChevronLeft, 
  Plus, 
  Settings, 
  Fuel, 
  AlertTriangle, 
  FileText,
  TrendingUp,
  Calendar,
  DollarSign,
  Car as CarIcon,
  ChevronRight,
  Battery,
  Droplet
} from "lucide-react";
import Link from "next/link";
import { 
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

interface Vehicle {
  id: string;
  model: string;
  plate: string;
  year: string;
  color: string;
  fuelType: string;
}

export default function VehicleDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [activeTab, setActiveTab] = useState("maintenance");
  const [loading, setLoading] = useState(true);
  
  // Estados para dados sincronizados do App (16 Categorias)
  const [maintenances, setMaintenances] = useState<any[]>([]);
  const [fuelings, setFuelings] = useState<any[]>([]);
  const [batteries, setBatteries] = useState<any[]>([]);
  const [oils, setOils] = useState<any[]>([]);
  const [defects, setDefects] = useState<any[]>([]);
  const [filters, setFilters] = useState<any[]>([]);
  const [revisions, setRevisions] = useState<any[]>([]);
  const [tires, setTires] = useState<any[]>([]);
  const [alignments, setAlignments] = useState<any[]>([]);
  const [acRecords, setAcRecords] = useState<any[]>([]);
  const [washRecords, setWashRecords] = useState<any[]>([]);
  const [travels, setTravels] = useState<any[]>([]);
  const [calibrations, setCalibrations] = useState<any[]>([]);
  const [licensings, setLicensings] = useState<any[]>([]);
  const [fines, setFines] = useState<any[]>([]);
  const [ipvas, setIpvas] = useState<any[]>([]);
  
  const router = useRouter();

  useEffect(() => {
    if (!id) return;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // 1. Fetch Vehicle Info
        const docRef = doc(db, `users/${user.uid}/vehicles`, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setVehicle({ id: docSnap.id, ...docSnap.data() } as Vehicle);
        }

        // 2. LÓGICA REPLICADA DO APP: Buscar na raiz e filtrar pelo vehicleId
        const fetchCollection = async (colName: string) => {
          try {
            const colRef = collection(db, `users/${user.uid}/${colName}`);
            const snapshot = await getDocs(colRef);
            return snapshot.docs
              .map(doc => ({ id: doc.id, ...doc.data() }))
              .filter((item: any) => item.vehicleId === id);
          } catch (e) {
            console.error(`Erro ao buscar ${colName}:`, e);
            return [];
          }
        };

        // Carregar todas as 16 sessões em paralelo
        const results = await Promise.all([
          fetchCollection("maintenance"), fetchCollection("fuel"),
          fetchCollection("battery"), fetchCollection("oil"),
          fetchCollection("defects"), fetchCollection("filters"),
          fetchCollection("revision"), fetchCollection("tires_records"),
          fetchCollection("alignment"), fetchCollection("ac"),
          fetchCollection("wash"), fetchCollection("travel"),
          fetchCollection("calibration"), fetchCollection("licensing"),
          fetchCollection("fines"), fetchCollection("ipva")
        ]);

        setMaintenances(results[0]); setFuelings(results[1]);
        setBatteries(results[2]); setOils(results[3]);
        setDefects(results[4]); setFilters(results[5]);
        setRevisions(results[6]); setTires(results[7]);
        setAlignments(results[8]); setAcRecords(results[9]);
        setWashRecords(results[10]); setTravels(results[11]);
        setCalibrations(results[12]); setLicensings(results[13]);
        setFines(results[14]); setIpvas(results[15]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [id]);

  if (loading) return <div className="p-20 text-center">Carregando dados do veículo...</div>;
  if (!vehicle) return <div className="p-20 text-center">Veículo não encontrado.</div>;

  const tabs = [
    { id: "maintenance", label: "Serviços", icon: <Settings className="w-4 h-4" /> },
    { id: "fuel", label: "Abastecimento", icon: <Fuel className="w-4 h-4" /> },
    { id: "battery", label: "Bateria", icon: <Battery className="w-4 h-4" /> },
    { id: "oil", label: "Óleo", icon: <Droplet className="w-4 h-4" /> },
    { id: "defects", label: "Defeitos", icon: <AlertTriangle className="w-4 h-4" /> },
    { id: "filters", label: "Filtros", icon: <Filter className="w-4 h-4" /> },
    { id: "revision", label: "Revisões", icon: <ClipboardCheck className="w-4 h-4" /> },
    { id: "tires_records", label: "Pneus", icon: <Disc className="w-4 h-4" /> },
    { id: "alignment", label: "Alinhamentos", icon: <Compass className="w-4 h-4" /> },
    { id: "ac", label: "Ar-Condicionado", icon: <Wind className="w-4 h-4" /> },
    { id: "wash", label: "Lavagem", icon: <Waves className="w-4 h-4" /> },
    { id: "travel", label: "Viagem", icon: <Map className="w-4 h-4" /> },
    { id: "calibration", label: "Calibragem", icon: <Gauge className="w-4 h-4" /> },
    { id: "licensing", label: "Licenciamento", icon: <CreditCard className="w-4 h-4" /> },
    { id: "fines", label: "Multas", icon: <Ban className="w-4 h-4" /> },
    { id: "ipva", label: "IPVA", icon: <FileText className="w-4 h-4" /> },
  ];

  const getActiveData = () => {
    switch (activeTab) {
      case "maintenance": return maintenances;
      case "fuel": return fuelings;
      case "battery": return batteries;
      case "oil": return oils;
      case "defects": return defects;
      case "filters": return filters;
      case "revision": return revisions;
      case "tires_records": return tires;
      case "alignment": return alignments;
      case "ac": return acRecords;
      case "wash": return washRecords;
      case "travel": return travels;
      case "calibration": return calibrations;
      case "licensing": return licensings;
      case "fines": return fines;
      case "ipva": return ipvas;
      default: return [];
    }
  };

  const getTabIcon = (tabId: string) => {
    switch (tabId) {
      case 'maintenance': return <Settings className="w-4 h-4" />;
      case 'fuel': return <Fuel className="w-4 h-4" />;
      case 'battery': return <Battery className="w-4 h-4" />;
      case 'oil': return <Droplet className="w-4 h-4" />;
      case 'defects': return <AlertTriangle className="w-4 h-4" />;
      case 'filters': return <Filter className="w-4 h-4" />;
      case 'revision': return <ClipboardCheck className="w-4 h-4" />;
      case 'tires_records': return <Disc className="w-4 h-4" />;
      case 'alignment': return <Compass className="w-4 h-4" />;
      case 'ac': return <Wind className="w-4 h-4" />;
      case 'wash': return <Waves className="w-4 h-4" />;
      case 'travel': return <Map className="w-4 h-4" />;
      case 'calibration': return <Gauge className="w-4 h-4" />;
      case 'licensing': return <CreditCard className="w-4 h-4" />;
      case 'fines': return <Ban className="w-4 h-4" />;
      case 'ipva': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-primary transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Voltar para Garagem
        </Link>
        <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/vehicles/new?edit=${id}`)}>
          Editar Veículo
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Info Sidebar */}
        <div className="w-full lg:w-1/3 space-y-6">
          <Card className="p-8 sticky top-28 bg-card/50 backdrop-blur-sm border-border/40">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-primary p-4 rounded-3xl shadow-lg shadow-primary/20">
                <CarIcon className="text-white w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{vehicle.model}</h1>
                <p className="text-foreground/40 font-mono text-sm tracking-widest">{vehicle.plate}</p>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-border/50">
              <div className="flex justify-between items-center">
                <span className="text-sm text-foreground/60">Ano / Modelo</span>
                <span className="font-bold">{vehicle.year}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-foreground/60">Combustível</span>
                <span className="font-bold">{vehicle.fuelType}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-foreground/60">Cor</span>
                <span className="font-bold">{vehicle.color}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="p-6 bg-blue-500/5 border-blue-500/10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-500">
                  <DollarSign className="w-5 h-5" />
                </div>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-sm text-foreground/60">Gasto Total em Serviços</p>
              <h3 className="text-2xl font-bold">
                R$ {(maintenances.reduce((acc, m) => acc + (Number(m.price) || 0), 0) + 
                     fuelings.reduce((acc, f) => acc + (Number(f.totalPrice) || 0), 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h3>
            </Card>
            <Card className="p-6 bg-indigo-500/5 border-indigo-500/10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-500">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm text-foreground/60">Última Atividade</p>
              <h3 className="text-2xl font-bold">
                {maintenances[0]?.date || fuelings[0]?.date || "Nenhuma"}
              </h3>
            </Card>
          </div>

          {/* Tabs Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap",
                    activeTab === tab.id 
                      ? "bg-primary text-white shadow-lg shadow-primary/30" 
                      : "bg-card border border-border text-foreground/60 hover:border-primary/40"
                  )}
                >
                  {getTabIcon(tab.id)}
                  {tab.label}
                </button>
              ))}
            </div>

            <Card className="p-0 overflow-hidden border-border/40">
              <div className="p-6 border-b border-border flex items-center justify-between bg-card/30">
                <h3 className="font-bold">Registros de {tabs.find(t => t.id === activeTab)?.label}</h3>
                <Link href={`/dashboard/history?category=${activeTab === 'maintenance' ? 'servicos' : activeTab}&vehicleId=${id}`}>
                  <Button size="sm" variant="outline">Ver Histórico Detalhado</Button>
                </Link>
              </div>
              
              <div className="divide-y divide-border">
                {getActiveData().map((item: any) => (
                  <div key={item.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl bg-primary/10 text-primary`}>
                        {getTabIcon(activeTab)}
                      </div>
                      <div>
                        <p className="font-bold">{item.name || item.brand || item.descricao || (item.liters ? `${item.liters}L` : "Registro")}</p>
                        <p className="text-xs text-foreground/40">{item.date || item.data || "---"}</p>
                      </div>
                    </div>
                    <span className="font-bold">R$ {(Number(item.price || item.totalPrice || item.valor || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}

                {getActiveData().length === 0 && (
                  <div className="p-12 text-center text-foreground/40 text-sm italic">
                    Nenhum registro de {tabs.find(t => t.id === activeTab)?.label.toLowerCase()} encontrado para este veículo.
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function for conditional classes
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
