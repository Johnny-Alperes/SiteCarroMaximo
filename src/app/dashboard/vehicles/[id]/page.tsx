"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  onSnapshot,
  orderBy
} from "firebase/firestore";
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
  DollarSign
} from "lucide-react";
import Link from "next/link";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  const [maintenances, setMaintenances] = useState<any[]>([]);
  const [fuelings, setFuelings] = useState<any[]>([]);
  
  const router = useRouter();

  useEffect(() => {
    if (!id) return;

    const user = auth.currentUser;
    if (!user) return;

    // Fetch Vehicle Info
    const fetchVehicle = async () => {
      const docRef = doc(db, `users/${user.uid}/vehicles`, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setVehicle({ id: docSnap.id, ...docSnap.data() } as Vehicle);
      }
      setLoading(false);
    };

    fetchVehicle();

    // Fetch Maintenance
    const qM = query(
      collection(db, `users/${user.uid}/maintenance`), 
      where("vehicleId", "==", id),
      orderBy("date", "desc")
    );
    const unsubM = onSnapshot(qM, (snapshot) => {
      setMaintenances(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch Fuel
    const qF = query(
      collection(db, `users/${user.uid}/fuel`), 
      where("vehicleId", "==", id),
      orderBy("date", "desc")
    );
    const unsubF = onSnapshot(qF, (snapshot) => {
      setFuelings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubM();
      unsubF();
    };
  }, [id]);

  if (loading) return <div className="p-20 text-center">Carregando...</div>;
  if (!vehicle) return <div className="p-20 text-center">Veículo não encontrado.</div>;

  // Chart Data Mockup (would be calculated from data)
  const chartData = [
    { name: "Jan", total: 400 },
    { name: "Fev", total: 300 },
    { name: "Mar", total: 600 },
    { name: "Abr", total: 800 },
    { name: "Mai", total: 500 },
    { name: "Jun", total: 700 },
  ];

  const tabs = [
    { id: "maintenance", label: "Manutenções", icon: <Settings className="w-4 h-4" /> },
    { id: "fuel", label: "Abastecimentos", icon: <Fuel className="w-4 h-4" /> },
    { id: "fines", label: "Multas", icon: <AlertTriangle className="w-4 h-4" /> },
    { id: "ipva", label: "IPVA/Licenc.", icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-8 pb-20">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-primary transition-colors">
        <ChevronLeft className="w-4 h-4" />
        Voltar
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Info Sidebar */}
        <div className="w-full lg:w-1/3 space-y-6">
          <Card className="p-8 sticky top-28">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-primary p-4 rounded-3xl">
                <Settings className="text-white w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{vehicle.model}</h1>
                <p className="text-foreground/40 font-mono text-sm tracking-widest">{vehicle.plate}</p>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="text-sm text-foreground/60">Ano</span>
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

            <Button className="w-full mt-8" variant="outline">
              Editar Veículo
            </Button>
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
              <p className="text-sm text-foreground/60">Gasto Total (30 dias)</p>
              <h3 className="text-2xl font-bold">R$ 1.240,50</h3>
            </Card>
            <Card className="p-6 bg-indigo-500/5 border-indigo-500/10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-500">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm text-foreground/60">Próxima Revisão</p>
              <h3 className="text-2xl font-bold">15 Jul 2026</h3>
            </Card>
          </div>

          {/* Chart Section */}
          <Card className="p-8">
            <h3 className="text-lg font-bold mb-6">Histórico de Gastos Mensais</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f1f1f" />
                  <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0a0a0a", border: "1px solid #1f1f1f", borderRadius: "12px" }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Area type="monotone" dataKey="total" stroke="#6366f1" fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Tabs Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap",
                    activeTab === tab.id 
                      ? "bg-primary text-white premium-shadow" 
                      : "bg-card border border-border text-foreground/60 hover:border-primary/40"
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            <Card className="p-0 overflow-hidden">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h3 className="font-bold">Lista de Registros</h3>
                <Button size="sm">
                  <Plus className="w-4 h-4" />
                  Novo Registro
                </Button>
              </div>
              
              <div className="divide-y divide-border">
                {activeTab === "maintenance" && maintenances.map((m) => (
                  <div key={m.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-500/10 rounded-2xl">
                        <Settings className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-bold">{m.name}</p>
                        <p className="text-xs text-foreground/40">{m.date}</p>
                      </div>
                    </div>
                    <span className="font-bold">R$ {m.price}</span>
                  </div>
                ))}
                
                {activeTab === "fuel" && fuelings.map((f) => (
                  <div key={f.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-500/10 rounded-2xl">
                        <Fuel className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="font-bold">{f.liters} Litros</p>
                        <p className="text-xs text-foreground/40">{f.date}</p>
                      </div>
                    </div>
                    <span className="font-bold">R$ {f.totalPrice}</span>
                  </div>
                ))}

                {(activeTab === "maintenance" ? maintenances : fuelings).length === 0 && (
                  <div className="p-12 text-center text-foreground/40 text-sm">
                    Nenhum registro encontrado nesta categoria.
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
