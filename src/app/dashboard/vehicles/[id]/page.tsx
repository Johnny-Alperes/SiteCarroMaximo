"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { 
  doc, 
  getDoc, 
  collection, 
  getDocs,
  query,
  orderBy
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  ChevronLeft, 
  Settings, 
  Fuel, 
  AlertTriangle, 
  FileText,
  TrendingUp,
  Calendar,
  DollarSign,
  Car as CarIcon,
  Battery,
  Droplet,
  Filter,
  ClipboardCheck,
  Disc,
  Compass,
  Wind,
  Waves,
  Map,
  Gauge,
  CreditCard,
  Ban,
  Trash2,
  Edit,
  Plus,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Vehicle {
  id: string;
  model: string;
  plate: string;
  year: string;
  color: string;
  fuelType: string;
}

interface MaintenanceItem {
  id: string;
  name: string;
  date: string;
  price: number;
  vehicleId: string;
}

interface FuelItem {
  id: string;
  date: string;
  liters: number;
  pricePerLiter: number;
  totalPrice: number;
  kmAtFueling: number;
  vehicleId: string;
}

interface BatteryItem {
  id: string;
  date: string;
  brand: string;
  type: string;
  price: number;
  vehicleId: string;
}

interface OilItem {
  id: string;
  lastDate: string;
  brand: string;
  oilType: string;
  price: number;
  vehicleId: string;
}

interface DefectItem {
  id: string;
  description: string;
  date: string;
  severity: string;
  resolved: boolean;
  vehicleId: string;
}

interface FilterItem {
  id: string;
  date: string;
  type: string;
  brand: string;
  price: number;
  vehicleId: string;
}

interface RevisionItem {
  id: string;
  date: string;
  type: string;
  price: number;
  kmAtRevision: number;
  vehicleId: string;
}

interface TireItem {
  id: string;
  date: string;
  brand: string;
  model: string;
  price: number;
  position: string;
  vehicleId: string;
}

interface AlignmentItem {
  id: string;
  date: string;
  price: number;
  kmAtAlignment: number;
  vehicleId: string;
}

interface ACItem {
  id: string;
  lastServiceDate: string;
  nextServiceDate: string;
  price: number;
  vehicleId: string;
}

interface WashItem {
  id: string;
  date: string;
  price: number;
  location: string;
  type: string;
  vehicleId: string;
}

interface TravelItem {
  id: string;
  date: string;
  origin: string;
  destination: string;
  distance: number;
  vehicleId: string;
}

interface CalibrationItem {
  id: string;
  date: string;
  frontLeft: number;
  frontRight: number;
  rearLeft: number;
  rearRight: number;
  vehicleId: string;
}

interface LicensingItem {
  id: string;
  year: string;
  value: number;
  dueDate: string;
  paid: boolean;
  vehicleId: string;
}

interface FineItem {
  id: string;
  date: string;
  description: string;
  value: number;
  points: number;
  paid: boolean;
  vehicleId: string;
}

interface IpvaItem {
  id: string;
  year: string;
  value: number;
  dueDate: string;
  paid: boolean;
  vehicleId: string;
}

export default function VehicleDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [activeTab, setActiveTab] = useState("maintenance");
  const [loading, setLoading] = useState(true);
  
  const [maintenances, setMaintenances] = useState<MaintenanceItem[]>([]);
  const [fuelings, setFuelings] = useState<FuelItem[]>([]);
  const [batteries, setBatteries] = useState<BatteryItem[]>([]);
  const [oils, setOils] = useState<OilItem[]>([]);
  const [defects, setDefects] = useState<DefectItem[]>([]);
  const [filters, setFilters] = useState<FilterItem[]>([]);
  const [revisions, setRevisions] = useState<RevisionItem[]>([]);
  const [tires, setTires] = useState<TireItem[]>([]);
  const [alignments, setAlignments] = useState<AlignmentItem[]>([]);
  const [acRecords, setAcRecords] = useState<ACItem[]>([]);
  const [washRecords, setWashRecords] = useState<WashItem[]>([]);
  const [travels, setTravels] = useState<TravelItem[]>([]);
  const [calibrations, setCalibrations] = useState<CalibrationItem[]>([]);
  const [licensings, setLicensings] = useState<LicensingItem[]>([]);
  const [fines, setFines] = useState<FineItem[]>([]);
  const [ipvas, setIpvas] = useState<IpvaItem[]>([]);
  
  const router = useRouter();

  useEffect(() => {
    if (!id) return;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, `users/${user.uid}/vehicles`, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setVehicle({ id: docSnap.id, ...docSnap.data() } as Vehicle);
        }

        // Função para coleções que usam campo 'date'
        const fetchCollection = async (colName: string) => {
          try {
            const colRef = collection(db, `users/${user.uid}/${colName}`);
            const q = query(colRef, orderBy("date", "desc"));
            const snapshot = await getDocs(q);
            return snapshot.docs
              .map(doc => ({ id: doc.id, ...doc.data() }))
              .filter((item: any) => item.vehicleId === id);
          } catch (e) {
            console.error(`Erro ao buscar ${colName}:`, e);
            return [];
          }
        };

        // Função para óleo (usa 'lastDate')
        const fetchOilCollection = async () => {
          try {
            const colRef = collection(db, `users/${user.uid}/oil`);
            const q = query(colRef, orderBy("lastDate", "desc"));
            const snapshot = await getDocs(q);
            return snapshot.docs
              .map(doc => ({ id: doc.id, ...doc.data() }))
              .filter((item: any) => item.vehicleId === id);
          } catch (e) {
            console.error(`Erro ao buscar oil:`, e);
            return [];
          }
        };

        // Função para AC (usa 'lastServiceDate')
        const fetchACCollection = async () => {
          try {
            const colRef = collection(db, `users/${user.uid}/ac`);
            const q = query(colRef, orderBy("lastServiceDate", "desc"));
            const snapshot = await getDocs(q);
            return snapshot.docs
              .map(doc => ({ id: doc.id, ...doc.data() }))
              .filter((item: any) => item.vehicleId === id);
          } catch (e) {
            console.error(`Erro ao buscar ac:`, e);
            return [];
          }
        };

        // Função para licenciamento e IPVA (usa 'dueDate')
        const fetchDueDateCollection = async (colName: string) => {
          try {
            const colRef = collection(db, `users/${user.uid}/${colName}`);
            const q = query(colRef, orderBy("dueDate", "desc"));
            const snapshot = await getDocs(q);
            return snapshot.docs
              .map(doc => ({ id: doc.id, ...doc.data() }))
              .filter((item: any) => item.vehicleId === id);
          } catch (e) {
            console.error(`Erro ao buscar ${colName}:`, e);
            return [];
          }
        };

        const results = await Promise.all([
          fetchCollection("maintenance"),
          fetchCollection("fuel"),
          fetchCollection("battery"),
          fetchOilCollection(),
          fetchCollection("defects"),
          fetchCollection("filters"),
          fetchCollection("revision"),
          fetchCollection("tires_records"),
          fetchCollection("alignment"),
          fetchACCollection(),
          fetchCollection("wash"),
          fetchCollection("travel"),
          fetchCollection("calibration"),
          fetchDueDateCollection("licensing"),
          fetchCollection("fines"),
          fetchDueDateCollection("ipva")
        ]);

        setMaintenances(results[0] as MaintenanceItem[]);
        setFuelings(results[1] as FuelItem[]);
        setBatteries(results[2] as BatteryItem[]);
        setOils(results[3] as OilItem[]);
        setDefects(results[4] as DefectItem[]);
        setFilters(results[5] as FilterItem[]);
        setRevisions(results[6] as RevisionItem[]);
        setTires(results[7] as TireItem[]);
        setAlignments(results[8] as AlignmentItem[]);
        setAcRecords(results[9] as ACItem[]);
        setWashRecords(results[10] as WashItem[]);
        setTravels(results[11] as TravelItem[]);
        setCalibrations(results[12] as CalibrationItem[]);
        setLicensings(results[13] as LicensingItem[]);
        setFines(results[14] as FineItem[]);
        setIpvas(results[15] as IpvaItem[]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [id]);

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
    let data: any[] = [];
    switch (activeTab) {
      case "maintenance": data = maintenances; break;
      case "fuel": data = fuelings; break;
      case "battery": data = batteries; break;
      case "oil": data = oils; break;
      case "defects": data = defects; break;
      case "filters": data = filters; break;
      case "revision": data = revisions; break;
      case "tires_records": data = tires; break;
      case "alignment": data = alignments; break;
      case "ac": data = acRecords; break;
      case "wash": data = washRecords; break;
      case "travel": data = travels; break;
      case "calibration": data = calibrations; break;
      case "licensing": data = licensings; break;
      case "fines": data = fines; break;
      case "ipva": data = ipvas; break;
      default: data = []; break;
    }

    return [...data].sort((a, b) => {
      const dateA = getItemDate(a, activeTab);
      const dateB = getItemDate(b, activeTab);

      const getTime = (dateVal: any) => {
        if (!dateVal || dateVal === "---") return 0;
        if (dateVal.seconds) return dateVal.seconds * 1000;
        
        // Tenta parsear formato DD/MM/YYYY ou DD/MM/YYYY HH:MM
        if (typeof dateVal === 'string' && dateVal.includes('/')) {
          const parts = dateVal.split(/[\s/:]+/);
          if (parts.length >= 3) {
            const day = parts[0].padStart(2, '0');
            const month = parts[1].padStart(2, '0');
            const year = parts[2];
            // Construir ISO compatível
            let isoStr = `${year}-${month}-${day}`;
            if (parts.length >= 5) {
               isoStr += `T${parts[3].padStart(2, '0')}:${parts[4].padStart(2, '0')}:00`;
            }
            const t = new Date(isoStr).getTime();
            if (!isNaN(t)) return t;
          }
        }
        
        const t = new Date(dateVal).getTime();
        return isNaN(t) ? 0 : t;
      };

      return getTime(dateB) - getTime(dateA); // Do mais recente para o mais antigo
    });
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

  const getItemName = (item: any, tabId: string) => {
    switch (tabId) {
      case "maintenance": return item.name;
      case "fuel": return `${item.liters}L - ${item.pricePerLiter?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/L`;
      case "battery": return `${item.brand} - ${item.type}`;
      case "oil": return `${item.brand} - ${item.oilType}`;
      case "defects": return item.description;
      case "filters": return `${item.type} - ${item.brand}`;
      case "revision": return `Revisão ${item.type} - ${item.kmAtRevision}km`;
      case "tires_records": return `${item.brand} - ${item.model} (${item.position})`;
      case "alignment": return `Alinhamento - ${item.kmAtAlignment}km`;
      case "ac": return "Manutenção Ar-Condicionado";
      case "wash": return `${item.type} - ${item.location}`;
      case "travel": return `${item.origin} → ${item.destination} (${item.distance}km)`;
      case "calibration": return "Calibragem dos Pneus";
      case "licensing": return `Licenciamento ${item.year}`;
      case "fines": return item.description;
      case "ipva": return `IPVA ${item.year}`;
      default: return "Registro";
    }
  };

  const getItemDate = (item: any, tabId: string) => {
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

    let rawDate = "---";
    switch (tabId) {
      case "maintenance": rawDate = item.date; break;
      case "fuel": rawDate = item.date; break;
      case "battery": rawDate = item.date; break;
      case "oil": rawDate = item.lastDate; break;
      case "defects": rawDate = item.date; break;
      case "filters": rawDate = item.date; break;
      case "revision": rawDate = item.date; break;
      case "tires_records": rawDate = item.date; break;
      case "alignment": rawDate = item.date; break;
      case "ac": rawDate = item.lastServiceDate; break;
      case "wash": rawDate = item.date; break;
      case "travel": rawDate = item.date; break;
      case "calibration": rawDate = item.date; break;
      case "licensing": rawDate = item.dueDate; break;
      case "fines": rawDate = item.date; break;
      case "ipva": rawDate = item.dueDate; break;
    }
    return formatDate(rawDate);
  };

  const getItemPrice = (item: any, tabId: string) => {
    switch (tabId) {
      case "maintenance": return item.price;
      case "fuel": return item.totalPrice;
      case "battery": return item.price;
      case "oil": return item.price;
      case "filters": return item.price;
      case "revision": return item.price;
      case "tires_records": return item.price;
      case "alignment": return item.price;
      case "ac": return item.price;
      case "wash": return item.price;
      case "licensing": return item.value;
      case "fines": return item.value;
      case "ipva": return item.value;
      default: return 0;
    }
  };

  const totalMaintenanceCost = maintenances.reduce((acc, m) => acc + (Number(m.price) || 0), 0);
  const totalFuelCost = fuelings.reduce((acc, f) => acc + (Number(f.totalPrice) || 0), 0);
  const totalCost = totalMaintenanceCost + totalFuelCost;

  const lastActivity = () => {
    const allDates = [
      ...maintenances.map(m => m.date),
      ...fuelings.map(f => f.date),
      ...batteries.map(b => b.date),
      ...oils.map(o => o.lastDate),
    ].filter(Boolean);
    
    if (allDates.length === 0) return "Nenhuma atividade";
    const sorted = allDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    return sorted[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center animate-pulse">
            <CarIcon className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0.15s' }} />
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.3s' }} />
          </div>
          <p className="text-sm text-slate-400">Carregando dados do veículo...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <CarIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Veículo não encontrado</h2>
          <p className="text-slate-400 mb-6">O veículo que você está procurando não existe ou foi removido.</p>
          <Link href="/dashboard">
            <Button>Voltar para Garagem</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 bg-slate-950 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-blue-400 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para Garagem
        </Link>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.push(`/dashboard/vehicles/new?edit=${id}`)}
          className="gap-2 text-white border-slate-700 hover:bg-slate-800"
        >
          <Edit className="w-4 h-4" />
          Editar Veículo
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Info Sidebar */}
        <div className="w-full lg:w-1/3 space-y-6">
          <Card className="p-8 sticky top-28 bg-slate-900/50 backdrop-blur-sm border-slate-800">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-4 rounded-3xl shadow-lg shadow-blue-500/20">
                <CarIcon className="text-white w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{vehicle.model}</h1>
                <p className="text-slate-400 font-mono text-sm tracking-widest">{vehicle.plate}</p>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-800">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Ano / Modelo</span>
                <span className="font-bold text-white">{vehicle.year}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Combustível</span>
                <span className="font-bold text-white">{vehicle.fuelType}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Cor</span>
                <span className="font-bold text-white">{vehicle.color}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                  <DollarSign className="w-5 h-5" />
                </div>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-sm text-slate-400">Gasto Total</p>
              <h3 className="text-2xl font-bold text-white">
                {totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {maintenances.length} serviços + {fuelings.length} abastecimentos
              </p>
            </Card>
            
            <Card className="p-6 bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 border-indigo-500/20">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm text-slate-400">Última Atividade</p>
              <h3 className="text-2xl font-bold text-white">
                {lastActivity()}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Clique na aba para ver detalhes
              </p>
            </Card>
          </div>

          {/* Tabs Section */}
          <div className="space-y-6">
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2 pb-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 p-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all text-center h-full",
                    activeTab === tab.id 
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/20" 
                      : "bg-slate-900 border border-slate-700 text-slate-400 hover:border-blue-500 hover:text-white"
                  )}
                  title={tab.label}
                >
                  <div className="shrink-0">{tab.icon}</div>
                  <span className="truncate w-full leading-tight">{tab.label}</span>
                </button>
              ))}
            </div>

            <Card className="overflow-hidden border-slate-800 bg-slate-900">
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                <h3 className="font-bold text-white">
                  Registros de {tabs.find(t => t.id === activeTab)?.label}
                </h3>
                <Button size="sm" variant="outline" className="text-slate-400 border-slate-700 hover:text-white hover:bg-slate-800">
                  Ver Histórico Completo
                </Button>
              </div>
              
              <div className="divide-y divide-slate-800">
                {getActiveData().map((item: any) => (
                  <div key={item.id} className="p-6 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-blue-400">
                        {getTabIcon(activeTab)}
                      </div>
                      <div>
                        <p className="font-bold text-white">
                          {getItemName(item, activeTab)}
                        </p>
                        <p className="text-xs text-slate-400">
                          {getItemDate(item, activeTab)}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-emerald-400">
                      {getItemPrice(item, activeTab).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                ))}

                {getActiveData().length === 0 && (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
                      {getTabIcon(activeTab)}
                    </div>
                    <p className="text-slate-400 text-sm italic">
                      Nenhum registro de {tabs.find(t => t.id === activeTab)?.label?.toLowerCase()} encontrado para este veículo.
                    </p>
                    <p className="text-slate-500 text-xs mt-2">
                      Adicione pelo aplicativo Carro Máximo para ver aqui
                    </p>
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