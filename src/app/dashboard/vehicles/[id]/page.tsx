"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { 
  doc, 
  getDoc, 
  collection, 
  getDocs,
  query,
  orderBy,
  deleteDoc
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
  const [deleteError, setDeleteError] = useState("");
  
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

    if (activeTab === "maintenance" && searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      return sorted.filter((item) =>
        String(getItemName(item, activeTab) ?? "").toLowerCase().includes(term)
      );
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
      case "fuel": return `${item.liters}L - ${item.pricePerLiter?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/L`;
      case "battery": return `${item.brand} - ${item.type}`;
      case "oil": return `${item.brand} - ${item.oilType}`;
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

    try {
      await deleteDoc(doc(db, `users/${user.uid}/${deleteTarget.tab}`, deleteTarget.item.id));
      removeRecordFromState(deleteTarget.tab, deleteTarget.item.id);
      setDeleteTarget(null);
    } catch (error) {
      console.error("Erro ao excluir registro:", error);
      setDeleteError("Não foi possível excluir o item. Tente novamente.");
    } finally {
      setIsDeleting(false);
    }
  };

  const totalMaintenanceCost = maintenances.reduce((acc, m) => acc + (Number(m.price) || 0), 0);
  const totalFuelCost = fuelings.reduce((acc, f) => acc + (Number(f.totalPrice) || 0), 0);
  const totalCost = totalMaintenanceCost + totalFuelCost;

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
    <div className="space-y-8 pb-20 bg-zinc-950 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para Garagem
        </Link>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.push(`/dashboard/vehicles/new?edit=${id}`)}
          className="gap-2 text-white border-zinc-700 hover:bg-zinc-800"
        >
          <Edit className="w-4 h-4" />
          Editar Veículo
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Info Sidebar */}
        <div className="w-full lg:w-1/3 space-y-6">
          <Card className="p-8 sticky top-28 bg-zinc-900/50 backdrop-blur-sm border-zinc-800">
            <div className="flex items-center gap-4 mb-6">
              <div className="border border-zinc-700 bg-zinc-900 p-4">
                <CarIcon className="text-white w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tight text-white">{vehicle.model}</h1>
                <p className="text-zinc-400 font-mono text-sm tracking-widest">{vehicle.plate}</p>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-zinc-800">
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Ano / Modelo</span>
                <span className="font-bold text-white">{vehicle.year}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Combustível</span>
                <span className="font-bold text-white">{vehicle.fuelType}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Cor</span>
                <span className="font-bold text-white">{vehicle.color}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="p-6 bg-zinc-900/40 border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-zinc-800 rounded-none text-zinc-300">
                  <DollarSign className="w-5 h-5" />
                </div>
                <TrendingUp className="w-4 h-4 text-zinc-400" />
              </div>
              <p className="text-sm text-zinc-400">Gasto Total</p>
              <h3 className="text-2xl font-bold text-white">
                {totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                {maintenances.length} serviços + {fuelings.length} abastecimentos
              </p>
            </Card>
            
            <Card className="p-6 bg-zinc-900/40 border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-zinc-800 rounded-none text-zinc-300">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm text-zinc-400">Última Atividade</p>
              <h3 className="text-2xl font-bold text-white">
                {lastActivity ? lastActivity.dateText : "Nenhuma atividade"}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                {lastActivity
                  ? `${lastActivityTab?.label ?? "Registro"} • ${
                      lastActivity.price !== null
                        ? lastActivity.price.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })
                        : "Sem valor registrado"
                    }`
                  : "Clique na aba para ver detalhes"}
              </p>
            </Card>
          </div>

          {/* Tabs Section */}
          <div className="space-y-6">
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2 pb-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSearchTerm("");
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 p-2 rounded-none text-[10px] sm:text-xs font-bold transition-all text-center h-full",
                    activeTab === tab.id 
                      ? "bg-white text-zinc-950 shadow-none" 
                      : "bg-zinc-900 border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"
                  )}
                  title={tab.label}
                >
                  <div className="shrink-0">{tab.icon}</div>
                  <span className="truncate w-full leading-tight">{tab.label}</span>
                </button>
              ))}
            </div>

            <Card className="overflow-hidden border-zinc-800 bg-zinc-900">
              <div className="p-6 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/50">
                <h3 className="font-bold text-white">
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
                        className="h-10 text-white border-zinc-700 bg-zinc-800/50 placeholder:text-zinc-500"
                        aria-label="Buscar serviço pelo nome"
                      />
                    </div>
                  )}
                  <Button size="sm" variant="outline" className="text-zinc-400 border-zinc-700 hover:text-white hover:bg-zinc-800">
                    Ver Histórico Completo
                  </Button>
                </div>
              </div>
              
              <div className="divide-y divide-zinc-800">
                {activeData.map((item: any) => {
                  const batteryLifespan = activeTab === "battery" ? getBatteryLifespan(item) : null;
                  const fuelLifespan = activeTab === "fuel" ? getFuelingLifespan(item) : null;
                  const recordLifespan = recordLifespanTabs.includes(activeTab)
                    ? getRecordLifespan(item, activeTab, activeData)
                    : null;

                  return (
                    <div key={item.id} className="p-6 flex items-center justify-between hover:bg-zinc-800/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-none bg-zinc-800 text-zinc-300">
                          {getTabIcon(activeTab)}
                        </div>
                        <div>
                          <p className="font-bold text-white">
                            {getItemName(item, activeTab)}
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
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
                          <p className="mt-1 text-xs text-zinc-400">
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
                      <div className="flex shrink-0 items-center gap-3">
                        <span className="font-bold text-zinc-100">
                          {getItemPrice(item, activeTab).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteError("");
                            setDeleteTarget({ item, tab: activeTab });
                          }}
                          className="p-2 text-zinc-500 transition-colors hover:text-red-400"
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
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 rounded-none bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                      {getTabIcon(activeTab)}
                    </div>
                    {activeTab === "maintenance" && searchTerm.trim() ? (
                      <>
                        <p className="text-zinc-400 text-sm italic">
                          Nenhum serviço encontrado para &quot;{searchTerm.trim()}&quot;.
                        </p>
                        <button
                          onClick={() => setSearchTerm("")}
                          className="text-zinc-400 text-xs mt-2 hover:text-zinc-300 transition-colors"
                        >
                          Limpar busca
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="text-zinc-400 text-sm italic">
                          Nenhum registro de {tabs.find(t => t.id === activeTab)?.label?.toLowerCase()} encontrado para este veículo.
                        </p>
                        <p className="text-zinc-500 text-xs mt-2">
                          Adicione pelo aplicativo Carro Máximo para ver aqui
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => {
          if (!isDeleting) {
            setDeleteTarget(null);
            setDeleteError("");
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