"use client";

import { useState, useEffect, use, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  doc, 
  getDoc, 
  collection, 
  getDocs,
  query,
  orderBy,
  deleteDoc,
  addDoc
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
  CheckCircle2,
  Edit,
  Plus,
  ChevronRight,
  Search
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

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
  station?: string;
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
  interval?: string;
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

const filterTypeTranslations: Record<string, string> = {
  oil: "Óleo Motor",
  oleo: "Óleo Motor",
  oleo_motor: "Óleo Motor",
  air: "Ar Motor",
  ar: "Ar Motor",
  ar_motor: "Ar Motor",
  air_filter: "Ar Motor",
  airfilter: "Ar Motor",
  filtro_de_ar: "Ar Motor",
  fuel: "Combustível",
  combustivel: "Combustível",
  fuel_filter: "Combustível",
  fuelfilter: "Combustível",
  filtro_de_combustivel: "Combustível",
  cabin: "Ar Cabine",
  cabine: "Ar Cabine",
  ar_cabine: "Ar Cabine",
  cabin_filter: "Ar Cabine",
  cabinfilter: "Ar Cabine",
  cabin_air: "Ar Cabine",
  pollen: "Ar Cabine",
  pollen_filter: "Ar Cabine",
  filtro_de_cabine: "Ar Cabine",
  ac: "Ar Cabine",
  ac_filter: "Ar Cabine",
  air_conditioning: "Ar Cabine",
  ar_condicionado: "Ar Cabine",
  oil_filter: "Filtro Óleo",
  oilfilter: "Filtro Óleo",
  filtro_de_oleo: "Filtro Óleo",
  filtro_oleo: "Filtro Óleo",
  transmission: "Filtro de Câmbio",
  transmission_filter: "Filtro de Câmbio",
  cambio: "Filtro de Câmbio",
  filtro_de_cambio: "Filtro de Câmbio",
  hydraulic: "Filtro Hidráulico",
  hydraulic_filter: "Filtro Hidráulico",
  hidraulico: "Filtro Hidráulico",
  filtro_hidraulico: "Filtro Hidráulico",
  water: "Filtro de Água",
  water_filter: "Filtro de Água",
  agua: "Filtro de Água",
  filtro_de_agua: "Filtro de Água",
  dryer: "Filtro Secador",
  air_dryer: "Filtro Secador",
  secador: "Filtro Secador",
};

const getFilterTypeLabel = (type: unknown) => {
  if (!type) return "";
  const raw = String(type).trim();
  if (!raw) return "";

  const key = raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return filterTypeTranslations[key] ?? raw;
};

const getFilterLabels = (type: unknown) => {
  if (type === null || type === undefined) return [];
  return String(type)
    .split(",")
    .map((part) => getFilterTypeLabel(part.trim()))
    .filter(Boolean);
};

const recordLifespanTabs = [
  "oil",
  "filters",
  "revision",
  "tires_records",
  "alignment",
  "ac",
  "wash",
  "calibration",
];

const tabsWithPrice = [
  "maintenance",
  "fuel",
  "battery",
  "oil",
  "filters",
  "revision",
  "tires_records",
  "alignment",
  "ac",
  "wash",
  "licensing",
  "fines",
  "ipva",
];

const recordLifespanNextLabels: Record<string, string> = {
  oil: "trocado em",
  filters: "trocado em",
  tires_records: "trocado em",
  revision: "próxima revisão em",
  alignment: "próximo alinhamento em",
  ac: "próxima manutenção em",
  wash: "próxima lavagem em",
  calibration: "próxima calibragem em",
};

export default function VehicleDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [activeTab, setActiveTab] = useState("maintenance");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{ item: any; tab: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState(0);
  const [deleteBarVisible, setDeleteBarVisible] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSavingService, setIsSavingService] = useState(false);
  const [serviceProgress, setServiceProgress] = useState(0);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [registerBarVisible, setRegisterBarVisible] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const wasDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; scrollLeft: number } | null>(null);

  const tabStyle: Record<string, { from: string; to: string; shadow: string; ring: string }> = {
    maintenance: { from: "from-violet-600", to: "to-fuchsia-500", shadow: "shadow-violet-500/40", ring: "ring-violet-300" },
    fuel: { from: "from-emerald-600", to: "to-teal-500", shadow: "shadow-emerald-500/40", ring: "ring-emerald-300" },
    battery: { from: "from-amber-500", to: "to-orange-500", shadow: "shadow-amber-500/40", ring: "ring-amber-300" },
    oil: { from: "from-cyan-500", to: "to-sky-500", shadow: "shadow-sky-500/40", ring: "ring-sky-300" },
    defects: { from: "from-rose-600", to: "to-red-500", shadow: "shadow-rose-500/40", ring: "ring-rose-300" },
    filters: { from: "from-blue-600", to: "to-indigo-500", shadow: "shadow-indigo-500/40", ring: "ring-indigo-300" },
    revision: { from: "from-pink-600", to: "to-rose-500", shadow: "shadow-pink-500/40", ring: "ring-pink-300" },
    tires_records: { from: "from-slate-600", to: "to-zinc-500", shadow: "shadow-zinc-500/40", ring: "ring-zinc-300" },
    alignment: { from: "from-lime-600", to: "to-green-500", shadow: "shadow-lime-500/40", ring: "ring-lime-300" },
    ac: { from: "from-sky-500", to: "to-cyan-400", shadow: "shadow-cyan-500/40", ring: "ring-cyan-300" },
    wash: { from: "from-teal-500", to: "to-emerald-400", shadow: "shadow-teal-500/40", ring: "ring-teal-300" },
    travel: { from: "from-purple-600", to: "to-violet-500", shadow: "shadow-purple-500/40", ring: "ring-purple-300" },
    calibration: { from: "from-orange-600", to: "to-amber-500", shadow: "shadow-orange-500/40", ring: "ring-orange-300" },
    licensing: { from: "from-stone-600", to: "to-neutral-500", shadow: "shadow-stone-500/40", ring: "ring-stone-300" },
    fines: { from: "from-red-700", to: "to-red-500", shadow: "shadow-red-600/40", ring: "ring-red-300" },
    ipva: { from: "from-yellow-600", to: "to-amber-500", shadow: "shadow-yellow-500/40", ring: "ring-yellow-300" },
  };
  
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
    { id: "maintenance", label: "Serviços", icon: <Settings className="w-5 h-5" /> },
    { id: "fuel", label: "Abastecimento", icon: <Fuel className="w-5 h-5" /> },
    { id: "battery", label: "Bateria", icon: <Battery className="w-5 h-5" /> },
    { id: "oil", label: "Óleo", icon: <Droplet className="w-5 h-5" /> },
    { id: "defects", label: "Defeitos", icon: <AlertTriangle className="w-5 h-5" /> },
    { id: "filters", label: "Filtros", icon: <Filter className="w-5 h-5" /> },
    { id: "revision", label: "Revisões", icon: <ClipboardCheck className="w-5 h-5" /> },
    { id: "tires_records", label: "Pneus", icon: <Disc className="w-5 h-5" /> },
    { id: "alignment", label: "Alinhamentos", icon: <Compass className="w-5 h-5" /> },
    { id: "ac", label: "Ar-Condicionado", icon: <Wind className="w-5 h-5" /> },
    { id: "wash", label: "Lavagem", icon: <Waves className="w-5 h-5" /> },
    { id: "travel", label: "Viagem", icon: <Map className="w-5 h-5" /> },
    { id: "calibration", label: "Calibragem", icon: <Gauge className="w-5 h-5" /> },
    { id: "licensing", label: "Licenciamento", icon: <CreditCard className="w-5 h-5" /> },
    { id: "fines", label: "Multas", icon: <Ban className="w-5 h-5" /> },
    { id: "ipva", label: "IPVA", icon: <FileText className="w-5 h-5" /> },
  ];

  const onCarouselMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = carouselRef.current;
    if (!el) return;
    dragStartRef.current = { x: e.clientX, scrollLeft: el.scrollLeft };
    wasDraggingRef.current = false;
    setIsDragging(true);
  };

  const onCarouselMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = carouselRef.current;
    if (!el || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    if (Math.abs(dx) > 4) wasDraggingRef.current = true;
    el.scrollLeft = dragStartRef.current.scrollLeft - dx;
    const half = el.scrollWidth / 2;
    if (el.scrollLeft >= half) el.scrollLeft -= half;
    else if (el.scrollLeft <= 0) el.scrollLeft += half;
  };

  const onCarouselMouseUp = () => {
    dragStartRef.current = null;
    setIsDragging(false);
    const el = carouselRef.current;
    if (el) {
      const half = el.scrollWidth / 2;
      if (el.scrollLeft >= half) el.scrollLeft -= half;
      else if (el.scrollLeft <= 0) el.scrollLeft += half;
    }
    window.setTimeout(() => { wasDraggingRef.current = false; }, 0);
  };

  const toggleTab = (tabId: string) => {
    if (wasDraggingRef.current) {
      wasDraggingRef.current = false;
      return;
    }
    if (activeTab === tabId && historyOpen) {
      setHistoryOpen(false);
      return;
    }
    setActiveTab(tabId);
    setSearchTerm("");
    setHistoryOpen(true);
  };

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

    const sorted = [...data].sort((a, b) => {
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

    if (searchTerm.trim()) {
      const term = searchTerm
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      return sorted.filter((item) => {
        const name = String(getItemName(item, activeTab) ?? "")
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
        const date = String(getItemDate(item, activeTab) ?? "").toLowerCase();
        return name.includes(term) || date.includes(term);
      });
    }

    return sorted;
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

  const parseDateValue = (dateVal: any): Date | null => {
    if (!dateVal || dateVal === "---") return null;
    if (dateVal instanceof Date) {
      return isNaN(dateVal.getTime()) ? null : dateVal;
    }
    if (typeof dateVal?.toDate === "function") {
      const d = dateVal.toDate();
      return isNaN(d.getTime()) ? null : d;
    }
    if (typeof dateVal === "object" && dateVal.seconds != null) {
      return new Date(dateVal.seconds * 1000);
    }
    if (typeof dateVal === "string") {
      const br = dateVal.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
      if (br) return new Date(Number(br[3]), Number(br[2]) - 1, Number(br[1]));
      const iso = dateVal.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
    }
    const parsed = new Date(dateVal);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const getElapsedTime = (start: Date, end: Date) => {
    const totalDays = Math.floor((end.getTime() - start.getTime()) / 86400000);
    if (totalDays < 0) return "0 dias";

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    if (days < 0) {
      months -= 1;
      const daysInPreviousMonth = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
      days += daysInPreviousMonth;
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const plural = (value: number, singular: string, pluralForm: string) =>
      `${value} ${value === 1 ? singular : pluralForm}`;

    if (years > 0) {
      const yearText = plural(years, "ano", "anos");
      return months > 0 ? `${yearText} e ${plural(months, "mês", "meses")}` : yearText;
    }
    if (months > 0) {
      const monthText = plural(months, "mês", "meses");
      return days > 0 ? `${monthText} e ${plural(days, "dia", "dias")}` : monthText;
    }
    return plural(Math.max(days, 0), "dia", "dias");
  };

  const getBatteryLifespan = (item: any) => {
    const start = parseDateValue(item.date);
    if (!start) return { text: null, replacedOn: null };

    let replacement: Date | null = null;
    for (const other of batteries) {
      if (other.id === item.id) continue;
      const otherDate = parseDateValue(other.date);
      if (!otherDate || otherDate.getTime() <= start.getTime()) continue;
      if (!replacement || otherDate.getTime() < replacement.getTime()) {
        replacement = otherDate;
      }
    }

    return {
      text: getElapsedTime(start, replacement ?? new Date()),
      replacedOn: replacement ? getItemDate({ date: replacement }, "battery") : null,
    };
  };

  const getDaysBetween = (start: Date, end: Date) => {
    const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
    const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
    return Math.max(0, Math.round((endUtc - startUtc) / 86400000));
  };

  const formatDays = (days: number) => `${days} ${days === 1 ? "dia" : "dias"}`;

  const getFuelingLifespan = (item: any) => {
    const start = parseDateValue(item.date);
    if (!start) return null;

    let nextFueling: Date | null = null;
    for (const other of fuelings) {
      if (other.id === item.id) continue;
      const otherDate = parseDateValue(other.date);
      if (!otherDate || otherDate.getTime() <= start.getTime()) continue;
      if (!nextFueling || otherDate.getTime() < nextFueling.getTime()) {
        nextFueling = otherDate;
      }
    }

    const end = nextFueling ?? new Date();
    return {
      days: getDaysBetween(start, end),
      isCurrent: !nextFueling,
      nextDate: nextFueling ? getItemDate({ date: nextFueling }, "fuel") : null,
    };
  };

  const getTabRecordDate = (item: any, tabId: string) => {
    switch (tabId) {
      case "oil": return item.lastDate;
      case "ac": return item.lastServiceDate;
      default: return item.date;
    }
  };

  const getRecordLifespan = (item: any, tabId: string, records: any[]) => {
    const start = parseDateValue(getTabRecordDate(item, tabId));
    if (!start) return null;

    let nextRecord: Date | null = null;
    for (const other of records) {
      if (other.id === item.id) continue;
      const otherDate = parseDateValue(getTabRecordDate(other, tabId));
      if (!otherDate || otherDate.getTime() <= start.getTime()) continue;
      if (!nextRecord || otherDate.getTime() < nextRecord.getTime()) {
        nextRecord = otherDate;
      }
    }

    return {
      text: getElapsedTime(start, nextRecord ?? new Date()),
      isCurrent: !nextRecord,
      startOn: getItemDate(item, tabId),
      nextOn: nextRecord ? getItemDate({ date: nextRecord }, "maintenance") : null,
    };
  };

  const getItemName = (item: any, tabId: string) => {
    switch (tabId) {
      case "maintenance": return item.name;
      case "fuel": return item.station ? `${item.station} - ${item.liters}L` : `${item.liters}L - ${item.pricePerLiter?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/L`;
      case "battery": return `${item.brand} - ${item.type}`;
      case "oil": return item.interval ? `${item.brand} - ${item.oilType} (${item.interval})` : `${item.brand} - ${item.oilType}`;
      case "defects": return item.description;
      case "filters": {
        const labels = getFilterLabels(item.type);
        return [labels.length > 0 ? labels.join(" + ") : "Filtro", item.brand].filter(Boolean).join(" - ");
      }
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

  const removeRecordFromState = (tabId: string, recordId: string) => {
    const filterById = <T extends { id: string }>(records: T[]) =>
      records.filter((record) => record.id !== recordId);

    switch (tabId) {
      case "maintenance": setMaintenances(prev => filterById(prev)); break;
      case "fuel": setFuelings(prev => filterById(prev)); break;
      case "battery": setBatteries(prev => filterById(prev)); break;
      case "oil": setOils(prev => filterById(prev)); break;
      case "defects": setDefects(prev => filterById(prev)); break;
      case "filters": setFilters(prev => filterById(prev)); break;
      case "revision": setRevisions(prev => filterById(prev)); break;
      case "tires_records": setTires(prev => filterById(prev)); break;
      case "alignment": setAlignments(prev => filterById(prev)); break;
      case "ac": setAcRecords(prev => filterById(prev)); break;
      case "wash": setWashRecords(prev => filterById(prev)); break;
      case "travel": setTravels(prev => filterById(prev)); break;
      case "calibration": setCalibrations(prev => filterById(prev)); break;
      case "licensing": setLicensings(prev => filterById(prev)); break;
      case "fines": setFines(prev => filterById(prev)); break;
      case "ipva": setIpvas(prev => filterById(prev)); break;
    }
  };

  const handleDeleteRecord = async () => {
    if (!deleteTarget) return;

    const user = auth.currentUser;
    if (!user) {
      setDeleteError("Sessão expirada. Faça login novamente.");
      return;
    }

    setIsDeleting(true);
    setDeleteError("");
    setDeleteBarVisible(true);
    setDeleteProgress(0);

    const deleteTimer = window.setInterval(() => {
      setDeleteProgress((current) => current >= 80 ? current : current + 1);
    }, 320);

    try {
      const target = deleteTarget;
      await deleteDoc(doc(db, `users/${user.uid}/${target.tab}`, target.item.id));
      window.clearInterval(deleteTimer);
      setDeleteProgress(100);
      window.setTimeout(() => {
        removeRecordFromState(target.tab, target.item.id);
        setDeleteTarget(null);
        setDeleteBarVisible(false);
        setDeleteProgress(0);
      }, 1600);
    } catch (error) {
      console.error("Erro ao excluir registro:", error);
      window.clearInterval(deleteTimer);
      setDeleteBarVisible(false);
      setDeleteProgress(0);
      setDeleteError("Não foi possível excluir o item. Tente novamente.");
    } finally {
      setIsDeleting(false);
    }
  };

  const totalMaintenanceCost = maintenances.reduce((acc, m) => acc + (Number(m.price) || 0), 0);
  const totalFuelCost = fuelings.reduce((acc, f) => acc + (Number(f.totalPrice) || 0), 0);
  const totalCost = totalMaintenanceCost + totalFuelCost;

  const formatCurrencyInput = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 12);
    if (!digits) return "";
    const amount = (Number(digits) / 100).toFixed(2).replace(".", ",");
    return `R$ ${amount}`;
  };

  const parseCurrencyInput = (value: string) => Number(value.replace(/[^\d]/g, "") || 0) / 100;

  const getRegisterFields = (tabId: string) => {
    const dateValue = formData.date || new Date().toISOString().slice(0, 10);
    const priceField = { key: "price", label: "Valor (R$)", type: "currency", required: true };

    switch (tabId) {
      case "fuel":
        return [
          { key: "date", label: "Data", type: "date", required: true, value: dateValue },
          { key: "station", label: "Posto de combustível", type: "select", required: true, options: ["Petrobras", "Shell", "Ipiranga", "Ultrabax", "Ale", "Raízen", "Vibra", "Atra", "Sette", "Avental", "Outro"] },
          { key: "liters", label: "Quantidade (L)", type: "number", required: true },
          { key: "pricePerLiter", label: "Preço por litro (R$)", type: "currency", required: true },
          { key: "kmAtFueling", label: "Km do abastecimento", type: "number", required: true },
        ];
      case "battery":
        return [
          { key: "date", label: "Data", type: "date", required: true, value: dateValue },
          { key: "brand", label: "Marca", type: "text", required: true },
          { key: "type", label: "Amperagem", type: "select", required: true, options: ["50 amperes", "60 amperes"] },
          priceField,
        ];
      case "oil":
        return [
          { key: "lastDate", label: "Data da troca", type: "date", required: true, value: dateValue },
          { key: "brand", label: "Marca", type: "select", required: true, options: ["Shell", "Castrol", "Ipiranga", "Petronas", "Mobil", "Motul", "Texaco", "Liqui Moly", "Havoline", "TotalEnergies", "Outra"] },
          { key: "oilType", label: "Tipo do óleo", type: "select", required: true, options: ["0W-20", "0W-30", "0W-40", "5W-20", "5W-30", "5W-40", "10W-30", "10W-40", "15W-40", "15W-50", "20W-50", "Sintético", "Semissintético", "Mineral"] },
          { key: "interval", label: "Troca indicada", type: "select", required: true, options: ["5 mil km", "10 mil km", "Outro"] },
          priceField,
        ];
      case "defects":
        return [
          { key: "description", label: "Descrição do defeito", type: "text", required: true },
          { key: "date", label: "Data", type: "date", required: true, value: dateValue },
          { key: "severity", label: "Gravidade", type: "select", required: true, options: ["Baixa", "Média", "Alta"] },
          { key: "resolved", label: "Resolvido?", type: "select", required: true, options: ["Não", "Sim"] },
        ];
      case "filters":
        return [
          { key: "date", label: "Data", type: "date", required: true, value: dateValue },
          { key: "type", label: "Tipo do filtro", type: "select", required: true, options: ["Óleo Motor", "Ar Motor", "Combustível", "Ar Cabine", "Filtro Óleo", "Filtro de Câmbio", "Filtro Hidráulico", "Filtro de Água", "Filtro Secador"] },
          { key: "brand", label: "Marca", type: "text", required: true },
          priceField,
        ];
      case "revision":
        return [
          { key: "date", label: "Data", type: "date", required: true, value: dateValue },
          { key: "type", label: "Tipo da revisão", type: "text", required: true },
          { key: "kmAtRevision", label: "Km da revisão", type: "number", required: true },
          priceField,
        ];
      case "tires_records":
        return [
          { key: "date", label: "Data", type: "date", required: true, value: dateValue },
          { key: "brand", label: "Marca", type: "text", required: true },
          { key: "model", label: "Modelo", type: "text", required: true },
          { key: "position", label: "Posição", type: "select", required: true, options: ["Dianteiro esquerdo", "Dianteiro direito", "Traseiro esquerdo", "Traseiro direito", "Estepe"] },
          priceField,
        ];
      case "alignment":
        return [
          { key: "date", label: "Data", type: "date", required: true, value: dateValue },
          { key: "kmAtAlignment", label: "Km do alinhamento", type: "number", required: true },
          priceField,
        ];
      case "ac":
        return [
          { key: "lastServiceDate", label: "Data da manutenção", type: "date", required: true, value: dateValue },
          { key: "type", label: "Tipo de serviço", type: "select", required: true, options: ["Troca do gás", "Higienização", "Troca do filtro", "Manutenção preventiva", "Reparação de vazamento", "Limpeza do evaporador", "Troca do compressor", "Outros"] },
          priceField,
          { key: "observations", label: "Observações", type: "text", required: false },
        ];
      case "wash":
        return [
          { key: "date", label: "Data", type: "date", required: true, value: dateValue },
          { key: "type", label: "Tipo da lavagem", type: "select", required: true, options: ["Simples", "Completa", "Higienização"] },
          { key: "location", label: "Local", type: "text", required: true },
          priceField,
        ];
      case "travel":
        return [
          { key: "date", label: "Data", type: "date", required: true, value: dateValue },
          { key: "origin", label: "Origem", type: "text", required: true },
          { key: "destination", label: "Destino", type: "text", required: true },
          { key: "distance", label: "Distância (km)", type: "number", required: true },
        ];
      case "calibration":
        return [
          { key: "date", label: "Data", type: "date", required: true, value: dateValue },
          { key: "frontLeft", label: "Pressão dianteiro esquerdo", type: "number", required: true },
          { key: "frontRight", label: "Pressão dianteiro direito", type: "number", required: true },
          { key: "rearLeft", label: "Pressão traseiro esquerdo", type: "number", required: true },
          { key: "rearRight", label: "Pressão traseiro direito", type: "number", required: true },
        ];
      case "licensing":
        return [
          { key: "year", label: "Ano", type: "text", required: true },
          { key: "value", label: "Valor (R$)", type: "currency", required: true },
          { key: "dueDate", label: "Vencimento", type: "date", required: true, value: dateValue },
          { key: "paid", label: "Pago?", type: "select", required: true, options: ["Não", "Sim"] },
        ];
      case "fines":
        return [
          { key: "date", label: "Data", type: "date", required: true, value: dateValue },
          { key: "description", label: "Descrição da multa", type: "text", required: true },
          { key: "value", label: "Valor (R$)", type: "currency", required: true },
          { key: "points", label: "Pontos na CNH", type: "number", required: true },
          { key: "paid", label: "Pago?", type: "select", required: true, options: ["Não", "Sim"] },
        ];
      case "ipva":
        return [
          { key: "year", label: "Ano", type: "text", required: true },
          { key: "value", label: "Valor (R$)", type: "currency", required: true },
          { key: "dueDate", label: "Vencimento", type: "date", required: true, value: dateValue },
          { key: "paid", label: "Pago?", type: "select", required: true, options: ["Não", "Sim"] },
        ];
      default:
        return [
          { key: "name", label: "Nome do serviço", type: "text", required: true },
          { key: "date", label: "Data", type: "date", required: true, value: dateValue },
          priceField,
        ];
    }
  };

  const parseNumberInput = (value: string) => Number(value.replace(",", "."));

  const buildRecordPayload = (tabId: string) => {
    const payload: Record<string, unknown> = { vehicleId: id, createdAt: new Date().toISOString() };
    for (const field of getRegisterFields(tabId)) {
      const rawValue = formData[field.key] ?? field.value ?? "";
      if (field.type === "currency") payload[field.key] = parseCurrencyInput(rawValue);
      else if (field.type === "number") payload[field.key] = parseNumberInput(rawValue);
      else if (field.key === "resolved" || field.key === "paid") payload[field.key] = rawValue === "Sim";
      else payload[field.key] = rawValue;
    }
    if (tabId === "fuel") {
      const liters = parseNumberInput(formData.liters || "");
      const pricePerLiter = parseCurrencyInput(formData.pricePerLiter || "");
      payload.totalPrice = liters * pricePerLiter;
    }
    return payload;
  };

  const validateRecordPayload = (tabId: string, payload: Record<string, unknown>) => {
    for (const field of getRegisterFields(tabId)) {
      if (!field.required) continue;
      const value = payload[field.key];
      if (value === "" || value === undefined || value === null || (typeof value === "number" && Number.isNaN(value))) {
        return `Preencha ${field.label.toLowerCase()}.`;
      }
    }
    return "";
  };

  const handleRegisterService = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    const tabId = activeTab;
    const payload = buildRecordPayload(tabId);
    const validationError = validateRecordPayload(tabId, payload);
    if (!user || validationError) {
      setRegisterError(user ? validationError : "Sessão expirada. Faça login novamente.");
      return;
    }

    setIsSavingService(true);
    setRegisterSuccess(false);
    setRegisterError("");
    setRegisterBarVisible(true);
    setServiceProgress(0);

    const progressTimer = window.setInterval(() => {
      setServiceProgress((current) => current >= 80 ? current : current + 2);
    }, 140);

    try {
      const docRef = await addDoc(collection(db, `users/${user.uid}/${tabId}`), payload);
      window.clearInterval(progressTimer);
      setServiceProgress(100);
      window.setTimeout(() => {
        const newRecord = { id: docRef.id, ...payload } as any;
        if (tabId === "maintenance") setMaintenances((current) => [newRecord, ...current]);
        else if (tabId === "fuel") setFuelings((current) => [newRecord, ...current]);
        else if (tabId === "battery") setBatteries((current) => [newRecord, ...current]);
        else if (tabId === "oil") setOils((current) => [newRecord, ...current]);
        else if (tabId === "defects") setDefects((current) => [newRecord, ...current]);
        else if (tabId === "filters") setFilters((current) => [newRecord, ...current]);
        else if (tabId === "revision") setRevisions((current) => [newRecord, ...current]);
        else if (tabId === "tires_records") setTires((current) => [newRecord, ...current]);
        else if (tabId === "alignment") setAlignments((current) => [newRecord, ...current]);
        else if (tabId === "ac") setAcRecords((current) => [newRecord, ...current]);
        else if (tabId === "wash") setWashRecords((current) => [newRecord, ...current]);
        else if (tabId === "travel") setTravels((current) => [newRecord, ...current]);
        else if (tabId === "calibration") setCalibrations((current) => [newRecord, ...current]);
        else if (tabId === "licensing") setLicensings((current) => [newRecord, ...current]);
        else if (tabId === "fines") setFines((current) => [newRecord, ...current]);
        else if (tabId === "ipva") setIpvas((current) => [newRecord, ...current]);

        setRegisterSuccess(true);
        setFormData({});
        window.setTimeout(() => {
          setRegisterBarVisible(false);
          setIsRegisterModalOpen(false);
          setRegisterSuccess(false);
          setRegisterError("");
          setServiceProgress(0);
        }, 1800);
      }, 1000);
    } catch (error) {
      console.error("Erro ao cadastrar item:", error);
      window.clearInterval(progressTimer);
      setRegisterBarVisible(false);
      setServiceProgress(0);
      setRegisterError("Não foi possível cadastrar. Tente novamente.");
    } finally {
      setIsSavingService(false);
    }
  };

  const getLastActivity = () => {
    const collections: { tabId: string; records: unknown[] }[] = [
      { tabId: "maintenance", records: maintenances },
      { tabId: "fuel", records: fuelings },
      { tabId: "battery", records: batteries },
      { tabId: "oil", records: oils },
      { tabId: "defects", records: defects },
      { tabId: "filters", records: filters },
      { tabId: "revision", records: revisions },
      { tabId: "tires_records", records: tires },
      { tabId: "alignment", records: alignments },
      { tabId: "ac", records: acRecords },
      { tabId: "wash", records: washRecords },
      { tabId: "travel", records: travels },
      { tabId: "calibration", records: calibrations },
      { tabId: "licensing", records: licensings },
      { tabId: "fines", records: fines },
      { tabId: "ipva", records: ipvas },
    ];

    let latest: { tabId: string; date: Date; dateText: string; price: number | null } | null = null;

    for (const { tabId, records } of collections) {
      for (const record of records) {
        const parsed = parseDateValue(getTabRecordDate(record, tabId));
        if (!parsed) continue;
        if (latest && parsed.getTime() <= latest.date.getTime()) continue;

        latest = {
          tabId,
          date: parsed,
          dateText: getItemDate(record, tabId),
          price: tabsWithPrice.includes(tabId) ? getItemPrice(record, tabId) : null,
        };
      }
    }

    return latest;
  };

  const activeData = getActiveData();
  const lastActivity = getLastActivity();
  const lastActivityTab = lastActivity ? tabs.find((tab) => tab.id === lastActivity.tabId) : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 animate-pulse items-center justify-center bg-zinc-800">
            <CarIcon className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '0.15s' }} />
            <div className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '0.3s' }} />
          </div>
          <p className="text-sm text-zinc-400">Carregando dados do veículo...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <CarIcon className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Veículo não encontrado</h2>
          <p className="text-zinc-400 mb-6">O veículo que você está procurando não existe ou foi removido.</p>
          <Link href="/dashboard">
            <Button>Voltar para Garagem</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 bg-zinc-950 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white backdrop-blur transition-all hover:bg-white/20"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para Garagem
        </Link>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.push(`/dashboard/vehicles/${id}/edit`)}
          className="gap-2 rounded-full bg-white text-zinc-950 border-white hover:bg-zinc-200 hover:text-zinc-950"
        >
          <Edit className="w-4 h-4" />
          Editar Veículo
        </Button>
      </div>

      <section aria-label="Sessões" className="space-y-3">
        <div className="flex items-center justify-center gap-3">
          <h2 className="text-sm font-black uppercase tracking-[0.25em] text-white text-center">
            --- Sessões ---
          </h2>
        </div>
        <div
          className="relative overflow-hidden"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          <div
            ref={carouselRef}
            onMouseDown={onCarouselMouseDown}
            onMouseMove={onCarouselMouseMove}
            onMouseUp={onCarouselMouseUp}
            onMouseLeave={onCarouselMouseUp}
            className="carousel-track select-none cursor-grab overflow-x-auto active:cursor-grabbing"
          >
            <div
              className={cn("carousel-march flex w-max gap-3 pb-1 pt-1 pr-3", (!isAutoPlaying || isDragging) && "paused")}
            >
              {[...tabs, ...tabs].map((tab, idx) => {
                const style = tabStyle[tab.id];
                const isActive = activeTab === tab.id && historyOpen;
                return (
                  <button
                    key={`${tab.id}-${idx}`}
                    type="button"
                    data-active={isActive}
                    onClick={() => toggleTab(tab.id)}
                    aria-pressed={isActive}
                    title={tab.label}
                    className={cn(
                      "group relative min-w-[124px] shrink-0 cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br p-[1.5px] text-left text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 hover:-translate-y-1",
                      style.from, style.to
                    )}
                  >
                    <span className={cn(
                      "relative flex h-full w-full flex-col items-center justify-center gap-1.5 rounded-[calc(1rem-1px)] px-3 py-4 text-center text-[11px] font-bold uppercase tracking-wide backdrop-blur transition-all",
                      isActive
                        ? "bg-white/20 ring-2 ring-white/80 shadow-[0_14px_30px_-10px_rgba(255,255,255,0.5)]"
                        : "bg-black/25 group-hover:bg-black/10"
                    )}>
                      <span className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110">{tab.icon}</span>
                      <span className="leading-tight">{tab.label}</span>
                    </span>
                    <span className={cn("pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-br from-white/30 to-transparent")} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

          <AnimatePresence initial={false}>
            {!historyOpen && (
              <motion.div
                key="details"
                initial={{ opacity: 0, height: 0, y: -12 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden space-y-6"
              >
      <Card className="px-4 py-3 md:px-5 md:py-3.5 rounded-2xl bg-gradient-to-br from-violet-500/20 via-fuchsia-500/10 to-amber-400/20 backdrop-blur-sm border-violet-300/30 text-white">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-white/30 bg-gradient-to-br from-violet-500 to-fuchsia-500 p-2 shadow-lg shadow-fuchsia-500/30">
              <CarIcon className="text-white w-5 h-5" />
            </div>
            <div className="flex flex-wrap items-baseline gap-x-3">
              <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white leading-none">{vehicle.model}</h1>
              <p className="text-zinc-300 font-mono text-xs tracking-widest">{vehicle.plate}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 md:border-l md:border-white/20 md:pl-5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-zinc-300">Ano</span>
              <p className="font-bold text-white text-sm">{vehicle.year}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-zinc-300">Combustível</span>
              <p className="font-bold text-white text-sm">{vehicle.fuelType}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-zinc-300">Cor</span>
              <p className="font-bold text-white text-sm">{vehicle.color}</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card className="modern-hover group p-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-cyan-400/20 border-emerald-300/30 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/40 transition-all duration-300 group-hover:-rotate-6 group-hover:scale-110">
                  <DollarSign className="w-4 h-4" />
                </div>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-300 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white" />
              </div>
              <p className="text-xs text-emerald-100 transition-colors duration-300 group-hover:text-white">Gasto Total</p>
              <h3 className="text-xl font-bold text-white transition-transform duration-300 group-hover:translate-x-0.5">
                {totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </h3>
              <p className="text-[11px] text-zinc-300 mt-0.5">
                {maintenances.length} serviços + {fuelings.length} abastecimentos
              </p>
            </Card>
            
            <Card className="modern-hover group p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-pink-500/20 border-amber-300/30 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-500/40 transition-all duration-300 group-hover:rotate-6 group-hover:scale-110">
                  <Calendar className="w-4 h-4" />
                </div>
                <TrendingUp className="hidden" />
              </div>
              <p className="text-xs text-amber-100 transition-colors duration-300 group-hover:text-white">Última Atividade</p>
              <h3 className="text-xl font-bold text-white transition-transform duration-300 group-hover:translate-x-0.5">
                {lastActivity ? lastActivity.dateText : "Nenhuma atividade"}
              </h3>
              <p className="text-[11px] text-zinc-300 mt-0.5">
                {lastActivity
                  ? `${lastActivityTab?.label ?? "Registro"} • ${
                      lastActivity.price !== null
                        ? lastActivity.price.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })
                        : "Sem valor registrado"
                    }`
                  : "Toque em uma sessão para ver detalhes"}
              </p>
            </Card>
          </div>
      </div>
              </motion.div>
            )}

            {historyOpen && (
              <motion.div
                key="history"
                initial={{ opacity: 0, height: 0, y: -12 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
          {/* History Section */}
          <div className="space-y-6">
            <Card hoverable={false} className="modern-hover overflow-hidden rounded-2xl border-violet-400/40 bg-gradient-to-br from-white via-violet-50 to-cyan-50 text-zinc-950">
              <div className="p-4 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/50">
                <h3 className="font-bold text-zinc-950">
                  Registros de {tabs.find(t => t.id === activeTab)?.label}
                </h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
                  {activeTab === "maintenance" && (
                    <div className="w-full sm:w-64">
                      <Input
                        icon={<Search className="w-4 h-4" />}
                        placeholder="Buscar serviço pelo nome..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-10 rounded-xl text-zinc-950 border-zinc-300 bg-white placeholder:text-zinc-400"
                        aria-label="Buscar serviço pelo nome"
                      />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterModalOpen(true);
                      setRegisterSuccess(false);
                      setRegisterError("");
                      setServiceProgress(0);
                      setRegisterBarVisible(false);
                      setFormData({});
                    }}
                    className="group relative flex shrink-0 items-center gap-2 overflow-hidden rounded-xl border border-violet-600 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/40 hover:brightness-110"
                  >
                    <span className="absolute inset-y-0 left-0 w-1 bg-white/30 transition-all duration-300 group-hover:w-full group-hover:bg-white/10" />
                    <Plus className="relative h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
                    <span className="relative">Cadastrar Item</span>
                  </button>
                </div>
              </div>
              
              <div className="divide-y divide-zinc-200">
                {activeData.map((item: any) => {
                  const batteryLifespan = activeTab === "battery" ? getBatteryLifespan(item) : null;
                  const fuelLifespan = activeTab === "fuel" ? getFuelingLifespan(item) : null;
                  const recordLifespan = recordLifespanTabs.includes(activeTab)
                    ? getRecordLifespan(item, activeTab, activeData)
                    : null;

                  return (
                    <div key={item.id} className="modern-record group px-4 py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={cn("modern-record-icon p-2 shrink-0 rounded-xl bg-gradient-to-br text-white shadow-md", tabStyle[activeTab].from, tabStyle[activeTab].to, tabStyle[activeTab].shadow)}>
                          {getTabIcon(activeTab)}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <p className="font-bold text-zinc-950">
                              {getItemName(item, activeTab)}
                            </p>
                            {(batteryLifespan?.text || fuelLifespan || recordLifespan) && (
                              <span className="text-zinc-400">-</span>
                            )}
                            {batteryLifespan?.text && (
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold",
                                  batteryLifespan.replacedOn
                                    ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                                    : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                )}
                                title={
                                  batteryLifespan.replacedOn
                                    ? `Substituída em ${batteryLifespan.replacedOn}`
                                    : `Tempo de uso desde ${getItemDate(item, activeTab)}`
                                }
                              >
                                {batteryLifespan.text} de uso
                              </span>
                            )}
                            {fuelLifespan && (
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold",
                                  fuelLifespan.isCurrent
                                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                    : "border-blue-500/20 bg-blue-500/10 text-blue-400"
                                )}
                                title={
                                  fuelLifespan.isCurrent
                                    ? `Abastecimento atual desde ${getItemDate(item, activeTab)}`
                                    : `Durou até o próximo abastecimento em ${fuelLifespan.nextDate}`
                                }
                              >
                                {fuelLifespan.isCurrent
                                  ? fuelLifespan.days === 0
                                    ? "abastecido hoje"
                                    : `há ${formatDays(fuelLifespan.days)}`
                                  : fuelLifespan.days === 0
                                    ? "durou menos de 1 dia"
                                    : `durou ${formatDays(fuelLifespan.days)}`}
                              </span>
                            )}
                            {recordLifespan && (
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold",
                                  recordLifespan.isCurrent
                                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                    : "border-amber-500/20 bg-amber-500/10 text-amber-400"
                                )}
                                title={
                                  recordLifespan.isCurrent
                                    ? `Tempo de uso desde ${recordLifespan.startOn}`
                                    : `${recordLifespanNextLabels[activeTab] ?? "próximo registro em"} ${recordLifespan.nextOn}`
                                }
                              >
                                {recordLifespan.text} de uso
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-[11px] leading-tight text-zinc-500">
                            {getItemDate(item, activeTab)}
                            {batteryLifespan?.replacedOn && (
                              <span className="text-amber-400/80">
                                {" "}• substituída em {batteryLifespan.replacedOn}
                              </span>
                            )}
                            {recordLifespan?.nextOn && (
                              <span className="text-amber-400/80">
                                {" "}• {recordLifespanNextLabels[activeTab] ?? "próximo registro em"} {recordLifespan.nextOn}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="font-bold text-sm text-zinc-950 whitespace-nowrap">
                          {getItemPrice(item, activeTab).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteError("");
                            setDeleteTarget({ item, tab: activeTab });
                          }}
                          className="p-1.5 text-zinc-400 transition-colors hover:text-red-600"
                          title="Excluir registro"
                          aria-label={`Excluir ${getItemName(item, activeTab)}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {activeData.length === 0 && (
                  <div className="p-8 text-center">
                    <div className={cn("w-12 h-12 rounded-2xl bg-gradient-to-br text-white flex items-center justify-center mx-auto mb-3 shadow-lg", tabStyle[activeTab].from, tabStyle[activeTab].to, tabStyle[activeTab].shadow)}>
                      {getTabIcon(activeTab)}
                    </div>
                    {activeTab === "maintenance" && searchTerm.trim() ? (
                      <>
                        <p className="text-zinc-500 text-sm italic">
                          Nenhum serviço encontrado para &quot;{searchTerm.trim()}&quot;.
                        </p>
                        <button
                          onClick={() => setSearchTerm("")}
                          className="text-zinc-500 text-xs mt-2 hover:text-zinc-950 transition-colors"
                        >
                          Limpar busca
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="text-zinc-500 text-sm italic">
                          Nenhum registro de {tabs.find(t => t.id === activeTab)?.label?.toLowerCase()} encontrado para este veículo.
                        </p>
                        <p className="text-zinc-400 text-xs mt-2">
                          Adicione pelo aplicativo Carro Máximo para ver aqui
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>
              </motion.div>
            )}
          </AnimatePresence>

      <Modal
        isOpen={isRegisterModalOpen}
          onClose={() => {
            if (!isSavingService) {
              setIsRegisterModalOpen(false);
              setRegisterSuccess(false);
              setRegisterError("");
              setRegisterBarVisible(false);
              setServiceProgress(0);
            }
          }}
          title={`Cadastrar - ${tabs.find(t => t.id === activeTab)?.label ?? "Item"}`}
        >
          <form onSubmit={handleRegisterService} className="space-y-4">
            {registerBarVisible && (
              <div className="border border-emerald-900/70 bg-emerald-500/10 p-4">
                <div className="mb-3 flex items-center gap-3 text-emerald-300">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <p className="text-sm font-bold uppercase tracking-widest">
                    {registerSuccess ? "Cadastrado com sucesso!" : "Cadastrando..."}
                  </p>
                </div>
                <div className="h-2 border border-emerald-900/70 bg-zinc-900 transition-opacity duration-700">
                  <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${serviceProgress}%` }} />
                </div>
                <p className="mt-2 text-right text-xs text-emerald-300">{serviceProgress}%</p>
              </div>
            )}
            <div className="space-y-4">
              {getRegisterFields(activeTab).map((field) => {
                const fieldValue = formData[field.key] ?? field.value ?? "";
                if (field.type === "select") {
                  return (
                    <div key={field.key} className="space-y-1.5">
                      <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">{field.label} *</label>
                      <select
                        required={field.required}
                        value={fieldValue}
                        onChange={(e) => setFormData((current) => ({ ...current, [field.key]: e.target.value }))}
                        className="flex h-12 w-full rounded-none border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:border-zinc-500 transition-all"
                      >
                        <option value="" disabled>Selecione...</option>
                        {field.options?.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  );
                }
                return (
                  <Input
                    key={field.key}
                    label={`${field.label} *`}
                    type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
                    inputMode={field.type === "currency" || field.type === "number" ? "decimal" : undefined}
                    placeholder={field.type === "currency" ? "0,00" : `Digite ${field.label.toLowerCase()}`}
                    value={fieldValue}
                    onChange={(e) => {
                      const nextValue = field.type === "currency" ? formatCurrencyInput(e.target.value) : e.target.value;
                      setFormData((current) => ({ ...current, [field.key]: nextValue }));
                    }}
                    icon={field.type === "currency" ? <DollarSign className="h-4 w-4" /> : undefined}
                    required={field.required}
                  />
                );
              })}
            </div>
            {registerError && (
              <p className="border border-red-900/60 bg-red-950/30 p-3 text-xs text-red-300">{registerError}</p>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsRegisterModalOpen(false)}
                disabled={isSavingService}
              >
                Cancelar
              </Button>
              <Button type="submit" isLoading={isSavingService} className="gap-2">
                <Plus className="h-4 w-4" />
                Cadastrar Item
              </Button>
            </div>
          </form>
      </Modal>

      <Modal
        isOpen={Boolean(deleteTarget)}
          onClose={() => {
            if (!isDeleting) {
              setDeleteTarget(null);
              setDeleteError("");
              setDeleteBarVisible(false);
              setDeleteProgress(0);
            }
          }}
        title="Excluir registro"
      >
        <div className="space-y-6">
          <div className="flex items-start gap-3 border border-red-900/60 bg-red-950/30 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
            <div>
              <p className="text-sm text-zinc-300">Você está prestes a excluir:</p>
              <p className="mt-1 font-bold text-white">
                {deleteTarget ? getItemName(deleteTarget.item, deleteTarget.tab) : ""}
              </p>
              <p className="mt-2 text-xs text-zinc-400">
                Esta exclusão é permanente e não poderá ser desfeita.
              </p>
            </div>
          </div>

          {deleteBarVisible && (
            <div className="border border-red-900/70 bg-red-500/10 p-4">
              <div className="mb-3 flex items-center gap-3 text-red-300">
                <Trash2 className="h-5 w-5 shrink-0" />
                <p className="text-sm font-bold uppercase tracking-widest">Excluindo...</p>
              </div>
              <div className="h-2 border border-red-900/70 bg-zinc-900">
                <div className="h-full bg-red-500 transition-all duration-700" style={{ width: `${deleteProgress}%` }} />
              </div>
              <p className="mt-2 text-right text-xs text-red-300">{deleteProgress}%</p>
            </div>
          )}

          {deleteError && (
            <p className="border border-red-900/60 bg-red-950/30 p-3 text-xs text-red-300">
              {deleteError}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteTarget(null);
                setDeleteError("");
              }}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteRecord}
              isLoading={isDeleting}
            >
              Excluir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}