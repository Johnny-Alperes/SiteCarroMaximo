"use client";

import { useState, useEffect } from "react";
import { collection, query, onSnapshot, deleteDoc, doc, addDoc, getDoc, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Car as CarIcon, ChevronRight, Fuel, Calendar, Trash2, AlertTriangle, Pencil, BarChart3, Settings, MessageCircle, Mail, Phone, LogOut, Menu, RotateCcw, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Modal } from "@/components/ui/Modal";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface Vehicle {
  id: string;
  model: string;
  plate: string;
  year: string;
  color: string;
  fuelType: string;
  renavam?: string;
  createdAt?: string;
}

interface DeletedVehicle extends Vehicle {
  deletedAt?: string;
  originalId?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const [vehiclePickerMode, setVehiclePickerMode] = useState<"edit" | "delete" | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDeletingVehicle, setIsDeletingVehicle] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState(0);
  const [deleteBarVisible, setDeleteBarVisible] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
  const [deletedVehicles, setDeletedVehicles] = useState<DeletedVehicle[]>([]);
  const [loadingDeletedVehicles, setLoadingDeletedVehicles] = useState(false);
  const [renavamInputs, setRenavamInputs] = useState<Record<string, string>>({});
  const [recoveryErrors, setRecoveryErrors] = useState<Record<string, string>>({});
  const [recoveringId, setRecoveringId] = useState<string | null>(null);
  const [recoverySuccess, setRecoverySuccess] = useState("");

  const handleEditVehicleClick = () => {
    if (vehicles.length === 0) return;
    if (vehicles.length === 1) {
      router.push(`/dashboard/vehicles/${vehicles[0].id}/edit`);
      return;
    }
    setVehiclePickerMode("edit");
  };

  const handleDeleteVehicleClick = () => {
    if (vehicles.length === 0) return;
    if (vehicles.length === 1) {
      setDeleteError("");
      setDeleteBarVisible(false);
      setDeleteProgress(0);
      setVehicleToDelete(vehicles[0]);
      return;
    }
    setVehiclePickerMode("delete");
  };

  const handlePickVehicle = (vehicle: Vehicle) => {
    const mode = vehiclePickerMode;
    setVehiclePickerMode(null);
    if (mode === "edit") {
      router.push(`/dashboard/vehicles/${vehicle.id}/edit`);
    } else if (mode === "delete") {
      setDeleteError("");
      setDeleteBarVisible(false);
      setDeleteProgress(0);
      setVehicleToDelete(vehicle);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      Cookies.remove("session");
      setIsLogoutModalOpen(false);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  const getDeletedAtTime = (vehicle: DeletedVehicle) => {
    if (!vehicle.deletedAt) return 0;
    const time = new Date(vehicle.deletedAt).getTime();
    return Number.isNaN(time) ? 0 : time;
  };

  const getDaysRemaining = (vehicle: DeletedVehicle) => {
    const deletedTime = getDeletedAtTime(vehicle);
    if (!deletedTime) return 10;
    const elapsedMs = Date.now() - deletedTime;
    const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
    return Math.max(10 - elapsedDays, 0);
  };

  const getExpiresAt = (vehicle: DeletedVehicle) => {
    const deletedTime = getDeletedAtTime(vehicle);
    if (!deletedTime) return "";
    const expiresAt = new Date(deletedTime + 10 * 24 * 60 * 60 * 1000);
    return expiresAt.toLocaleDateString("pt-BR");
  };

  const fetchDeletedVehicles = async () => {
    const user = auth.currentUser;
    if (!user) return;
    setLoadingDeletedVehicles(true);
    try {
      const snapshot = await getDocs(collection(db, `users/${user.uid}/deleted_vehicles`));
      const items = snapshot.docs.map((itemDoc) => ({ id: itemDoc.id, ...itemDoc.data() })) as DeletedVehicle[];
      for (const item of items) {
        if (getDeletedAtTime(item) > 0 && getDaysRemaining(item) <= 0) {
          try {
            await deleteDoc(doc(db, `users/${user.uid}/deleted_vehicles`, item.id));
          } catch (error) {
            console.error("Erro ao excluir definitivamente veículo da lixeira:", error);
          }
        }
      }
      setDeletedVehicles(items.filter((item) => getDaysRemaining(item) > 0));
    } catch (error) {
      console.error("Erro ao carregar veículos excluídos:", error);
    } finally {
      setLoadingDeletedVehicles(false);
    }
  };

  useEffect(() => {
    if (isRecoveryModalOpen) {
      setRecoverySuccess("");
      setRecoveryErrors({});
      fetchDeletedVehicles();
    }
  }, [isRecoveryModalOpen]);

  const handleRecoverVehicle = async (deleted: DeletedVehicle) => {
    const user = auth.currentUser;
    if (!user) {
      setRecoveryErrors((current) => ({ ...current, [deleted.id]: "Sessão expirada. Faça login novamente." }));
      return;
    }

    const inputRenavam = (renavamInputs[deleted.id] || "").replace(/\D/g, "");
    const expectedRenavam = (deleted.renavam || "").replace(/\D/g, "");

    if (!expectedRenavam) {
      setRecoveryErrors((current) => ({ ...current, [deleted.id]: "Este veículo não possui Renavam cadastrado e não pode ser recuperado." }));
      return;
    }

    if (!inputRenavam) {
      setRecoveryErrors((current) => ({ ...current, [deleted.id]: "Digite o Renavam cadastrado do veículo para recuperar." }));
      return;
    }

    if (inputRenavam !== expectedRenavam) {
      setRecoveryErrors((current) => ({ ...current, [deleted.id]: "Renavam incorreto. Confira o Renavam cadastrado do veículo." }));
      return;
    }

    if (getDaysRemaining(deleted) <= 0) {
      setRecoveryErrors((current) => ({ ...current, [deleted.id]: "O prazo de 10 dias para recuperação expirou." }));
      return;
    }

    setRecoveringId(deleted.id);
    setRecoveryErrors((current) => ({ ...current, [deleted.id]: "" }));
    try {
      const { id: _deletedId, deletedAt: _deletedAt, originalId: _originalId, ...vehicleData } = deleted;
      await addDoc(collection(db, `users/${user.uid}/vehicles`), {
        ...vehicleData,
        createdAt: vehicleData.createdAt || new Date().toISOString(),
      });
      await deleteDoc(doc(db, `users/${user.uid}/deleted_vehicles`, deleted.id));
      setDeletedVehicles((current) => current.filter((item) => item.id !== deleted.id));
      setRenavamInputs((current) => {
        const next = { ...current };
        delete next[deleted.id];
        return next;
      });
      setRecoverySuccess(`Veículo ${deleted.model} recuperado com sucesso!`);
    } catch (error) {
      console.error("Erro ao recuperar veículo:", error);
      setRecoveryErrors((current) => ({ ...current, [deleted.id]: "Não foi possível recuperar o veículo. Tente novamente." }));
    } finally {
      setRecoveringId(null);
    }
  };

  const handleDeleteVehicle = async () => {
    if (!vehicleToDelete) return;
    const user = auth.currentUser;
    if (!user) {
      setDeleteError("Sessão expirada. Faça login novamente.");
      return;
    }

    const target = vehicleToDelete;
    setIsDeletingVehicle(true);
    setDeleteError("");
    setDeleteBarVisible(true);
    setDeleteProgress(0);

    const deleteTimer = window.setInterval(() => {
      setDeleteProgress((current) => current >= 80 ? current : current + 1);
    }, 320);

    try {
      const vehicleRef = doc(db, `users/${user.uid}/vehicles`, target.id);
      const vehicleSnap = await getDoc(vehicleRef);
      const vehicleData = vehicleSnap.exists() ? vehicleSnap.data() : { ...target };
      await addDoc(collection(db, `users/${user.uid}/deleted_vehicles`), {
        ...vehicleData,
        originalId: target.id,
        deletedAt: new Date().toISOString(),
      });
      await deleteDoc(vehicleRef);
      window.clearInterval(deleteTimer);
      setDeleteProgress(100);
      window.setTimeout(() => {
        setVehicles((current) => current.filter((vehicle) => vehicle.id !== target.id));
        setVehicleToDelete(null);
        setDeleteBarVisible(false);
        setDeleteProgress(0);
      }, 1600);
    } catch (error) {
      console.error("Erro ao excluir veículo:", error);
      window.clearInterval(deleteTimer);
      setDeleteBarVisible(false);
      setDeleteProgress(0);
      setDeleteError("Não foi possível excluir o veículo. Tente novamente.");
    } finally {
      setIsDeletingVehicle(false);
    }
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName || "Motorista");

        const q = query(collection(db, `users/${user.uid}/vehicles`));
        const unsubscribeFirestore = onSnapshot(q, (snapshot) => {
          const vehiclesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Vehicle[];
          setVehicles(vehiclesData);
          setLoading(false);
        });

        return () => unsubscribeFirestore();
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const vehicleAccents = [
    { text: "text-white", bg: "bg-white/10 border-white/20", gradient: "from-violet-600 to-fuchsia-500" },
    { text: "text-white", bg: "bg-white/10 border-white/20", gradient: "from-emerald-600 to-teal-500" },
    { text: "text-white", bg: "bg-white/10 border-white/20", gradient: "from-amber-500 to-orange-500" },
    { text: "text-white", bg: "bg-white/10 border-white/20", gradient: "from-cyan-500 to-sky-500" },
    { text: "text-white", bg: "bg-white/10 border-white/20", gradient: "from-rose-600 to-red-500" },
    { text: "text-white", bg: "bg-white/10 border-white/20", gradient: "from-blue-600 to-indigo-500" },
    { text: "text-white", bg: "bg-white/10 border-white/20", gradient: "from-pink-600 to-rose-500" },
    { text: "text-white", bg: "bg-white/10 border-white/20", gradient: "from-lime-600 to-green-500" },
    { text: "text-white", bg: "bg-white/10 border-white/20", gradient: "from-purple-600 to-violet-500" },
    { text: "text-white", bg: "bg-white/10 border-white/20", gradient: "from-orange-600 to-amber-500" },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin border border-zinc-700 border-b-white" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      <aside aria-label="Opções do Dashboard" className="w-full shrink-0 lg:sticky lg:top-20 lg:w-72">
        <nav className="flex flex-col gap-1 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-white shadow-sm dark:bg-zinc-900">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">Menu</p>
            <button
              type="button"
              onClick={() => setIsSidebarOpen((open) => !open)}
              aria-expanded={isSidebarOpen}
              aria-label="Alternar menu lateral"
              className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
          <div className={`${isSidebarOpen ? "flex" : "hidden"} flex-col gap-1 lg:flex`}>
            <Link
              href="/dashboard/vehicles/new"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold uppercase tracking-wide text-zinc-200 transition-colors hover:bg-zinc-800 hover:text-white"
            >
              <Plus className="h-4 w-4 shrink-0" />
              Cadastrar Veículo
            </Link>
            <button
              type="button"
              disabled={vehicles.length === 0}
              onClick={handleEditVehicleClick}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold uppercase tracking-wide text-zinc-200 transition-colors hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Pencil className="h-4 w-4 shrink-0" />
              Editar Veículo
            </button>
            <button
              type="button"
              disabled={vehicles.length === 0}
              onClick={handleDeleteVehicleClick}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold uppercase tracking-wide text-zinc-200 transition-colors hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4 shrink-0" />
              Excluir Veículo
            </button>
            <button
              type="button"
              onClick={() => setIsRecoveryModalOpen(true)}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold uppercase tracking-wide text-zinc-200 transition-colors hover:bg-zinc-800 hover:text-white"
            >
              <RotateCcw className="h-4 w-4 shrink-0" />
              Recuperar Veículo
            </button>
            <Link
              href="/dashboard/report"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold uppercase tracking-wide text-zinc-200 transition-colors hover:bg-zinc-800 hover:text-white"
            >
              <BarChart3 className="h-4 w-4 shrink-0" />
              Relatório em Gráfico
            </Link>
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold uppercase tracking-wide text-zinc-200 transition-colors hover:bg-zinc-800 hover:text-white"
            >
              <Settings className="h-4 w-4 shrink-0" />
              Configurações
            </Link>
            <button
              type="button"
              onClick={() => setIsContactModalOpen(true)}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold uppercase tracking-wide text-zinc-200 transition-colors hover:bg-zinc-800 hover:text-white"
            >
              <MessageCircle className="h-4 w-4 shrink-0" />
              Fale Conosco
            </button>
            <div className="mt-auto flex flex-col pt-4">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(true)}
                className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-3 text-sm font-bold uppercase tracking-wide text-red-500 transition-colors hover:border-red-500 hover:bg-red-500 hover:text-white"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                Sair
              </button>
            </div>
          </div>
        </nav>
      </aside>
      <div className="min-w-0 flex-1 space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">Garagem</p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
            Olá, {userName}
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Gerencie sua frota e acompanhe seus gastos.
          </p>
        </div>
        <Link href="/dashboard/vehicles/new">
          <Button className="h-11 rounded-full bg-white px-6 text-zinc-950 shadow-lg shadow-white/10 hover:bg-zinc-200 hover:text-zinc-950">
            <Plus className="w-4 h-4" />
            Adicionar Veículo
          </Button>
        </Link>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold uppercase tracking-widest text-white">
          Meus Veículos
        </h2>
        <span className="rounded-full border border-zinc-600 bg-zinc-800 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-200">
          {vehicles.length} {vehicles.length === 1 ? "Veículo" : "Veículos"}
        </span>
      </div>

      {vehicles.length === 0 ? (
        <Card className="modern-hover flex flex-col items-center justify-center rounded-2xl border-dashed border-violet-400/40 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/10 to-amber-400/10 p-12 text-center text-white">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-fuchsia-500/30">
            <CarIcon className="h-7 w-7 text-white" />
          </div>
          <h3 className="mb-2 text-xl font-black uppercase tracking-tight">
            Nenhum veículo cadastrado
          </h3>
          <p className="mb-6 max-w-sm text-sm text-zinc-400">
            Comece adicionando seu primeiro veículo para acompanhar manutenções,
            abastecimentos e gastos totais.
          </p>
          <Link href="/dashboard/vehicles/new">
            <Button variant="outline" className="rounded-full border-white bg-white text-zinc-950 hover:bg-zinc-200 hover:text-zinc-950">Cadastrar meu primeiro carro</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle, index) => {
            const accent = vehicleAccents[index % vehicleAccents.length];
            return (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -6 }}
            >
              <Card className="modern-hover group overflow-hidden rounded-2xl border-zinc-700/60 bg-zinc-900 text-white">
                <div className="p-5">
                  <div className="mb-4 flex items-start justify-between">
                    <div className={`rounded-2xl border p-3 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 ${accent.bg} ${accent.text}`}>
                      <CarIcon className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="text-right">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                          Placa
                        </span>
                        <p className="mt-1 rounded-lg border border-zinc-600/60 bg-zinc-800 px-2 py-1 font-mono text-sm font-bold text-white">
                          {vehicle.plate}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteError("");
                          setDeleteBarVisible(false);
                          setDeleteProgress(0);
                          setVehicleToDelete(vehicle);
                        }}
                        className="rounded-full p-1.5 text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                        title="Excluir veículo"
                        aria-label={`Excluir ${vehicle.model}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="mb-3 text-2xl font-black uppercase tracking-tight text-white leading-tight">
                    {vehicle.model}
                  </h3>

                  <div className="mb-5 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-600/60 bg-zinc-800/80 px-2.5 py-1 text-xs font-bold text-zinc-200">
                      <Calendar className="w-3.5 h-3.5" />
                      {vehicle.year}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${accent.bg} ${accent.text}`}>
                      <Fuel className="w-3.5 h-3.5" />
                      {vehicle.fuelType}
                    </span>
                    {vehicle.color && (
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${accent.bg} ${accent.text}`}>
                        {vehicle.color}
                      </span>
                    )}
                  </div>

                  <Link href={`/dashboard/vehicles/${vehicle.id}`} className="block">
                    <motion.button
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.94 }}
                      className={`group/btn relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r px-6 py-3.5 text-sm font-bold uppercase tracking-widest text-white shadow-lg transition-[filter] duration-300 hover:brightness-110 active:brightness-90 from-emerald-500 to-green-600 shadow-emerald-500/40`}
                    >
                      <motion.span
                        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                        initial={{ x: "-120%" }}
                        whileHover={{ x: "120%" }}
                        transition={{ duration: 0.7 }}
                      />
                      <span className="absolute inset-y-0 left-0 w-1 bg-white/25 transition-all duration-300 group-hover/btn:w-full group-hover/btn:bg-white/10" />
                      <span className="relative">Gerenciamento do Veículo</span>
                      <ChevronRight className="relative h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                    </motion.button>
                  </Link>
                </div>
              </Card>
            </motion.div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={vehiclePickerMode !== null}
        onClose={() => setVehiclePickerMode(null)}
        title={vehiclePickerMode === "delete" ? "Qual veículo deseja excluir?" : "Qual veículo deseja editar?"}
        subtitle={`Selecione o veículo para ${vehiclePickerMode === "delete" ? "excluir" : "editar"}.`}
        icon={
          <span className="flex items-center justify-center">
            {vehiclePickerMode === "delete" ? <Trash2 className="h-7 w-7" /> : <Pencil className="h-7 w-7" />}
          </span>
        }
        variant="balloon"
        className="max-w-xl max-h-[90vh] overflow-y-auto"
      >
        <div className="relative space-y-4">
          <div className="space-y-2">
            {vehicles.map((vehicle) => (
              <button
                key={vehicle.id}
                type="button"
                onClick={() => handlePickVehicle(vehicle)}
                className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-zinc-700 bg-zinc-950/60 p-4 text-left transition-all duration-300 hover:border-blue-500/60 hover:bg-zinc-900"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-zinc-950 shadow-lg shadow-white/10 transition-transform duration-300 group-hover:scale-105">
                    <CarIcon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-bold text-white">{vehicle.model}</span>
                    <span className="block text-xs text-zinc-400">{vehicle.plate}{vehicle.year ? ` • ${vehicle.year}` : ""}{vehicle.color ? ` • ${vehicle.color}` : ""}</span>
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-white" />
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setVehiclePickerMode(null)} className="rounded-full px-6 py-3">
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(vehicleToDelete)}
        onClose={() => {
          if (!isDeletingVehicle) {
            setVehicleToDelete(null);
            setDeleteError("");
            setDeleteBarVisible(false);
            setDeleteProgress(0);
          }
        }}
        title="Excluir veículo"
        subtitle="Confirme a exclusão do veículo selecionado."
        icon={<Trash2 className="h-7 w-7" />}
        variant="balloon"
        hideCloseButton
        className="max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="relative space-y-6">
          <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
            <div>
              <p className="text-sm text-zinc-300">Você está prestes a excluir:</p>
              <p className="mt-1 font-bold text-white">
                {vehicleToDelete ? `${vehicleToDelete.model} - ${vehicleToDelete.plate}` : ""}
              </p>
              <p className="mt-2 text-xs text-zinc-400">
                O veículo ficará salvo por 10 dias na lixeira antes de ser excluído definitivamente. Você pode recuperá-lo em Recuperar Veículo informando o Renavam cadastrado.
              </p>
            </div>
          </div>

          {deleteBarVisible && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
              <div className="mb-3 flex items-center gap-3 text-red-300">
                <Trash2 className="h-5 w-5 shrink-0 text-red-400" />
                <p className="text-sm font-bold uppercase tracking-widest text-red-400">Excluindo...</p>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full border border-red-900/70 bg-zinc-900">
                <div className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-700" style={{ width: `${deleteProgress}%` }} />
              </div>
              <p className="mt-2 text-right text-xs text-red-300">{deleteProgress}%</p>
            </div>
          )}

          {deleteError && (
            <p className="rounded-2xl border border-red-800 bg-red-900/30 p-3 text-xs text-red-300">
              {deleteError}
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => {
                setVehicleToDelete(null);
                setDeleteError("");
                setDeleteBarVisible(false);
                setDeleteProgress(0);
              }}
              disabled={isDeletingVehicle}
              className="flex-1 rounded-full py-3"
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteVehicle}
              isLoading={isDeletingVehicle}
              className="flex-1 rounded-full py-3"
            >
              Excluir
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isRecoveryModalOpen}
        onClose={() => setIsRecoveryModalOpen(false)}
        title="Recuperar Veículo"
        subtitle="Restaure um veículo excluído informando o Renavam cadastrado."
        icon={<RotateCcw className="h-7 w-7" />}
        variant="balloon"
        hideCloseButton
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="relative space-y-6">
          <p className="text-sm text-zinc-400">
            Veículos excluídos ficam salvos por 10 dias. Para recuperar, é obrigatório digitar o Renavam cadastrado do veículo.
          </p>

          {recoverySuccess && (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
              <p className="text-sm font-bold">{recoverySuccess}</p>
            </div>
          )}

          {loadingDeletedVehicles ? (
            <p className="text-sm text-zinc-400">Carregando veículos excluídos...</p>
          ) : deletedVehicles.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4 text-sm text-zinc-400">
              Nenhum veículo na lixeira.
            </p>
          ) : (
            <div className="space-y-4">
              {deletedVehicles.map((deleted) => (
                <div key={deleted.id} className="space-y-3 rounded-2xl border border-white/10 bg-zinc-950/40 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-bold text-white">{deleted.model} - {deleted.plate}</p>
                      <p className="mt-1 text-xs text-zinc-400">
                        {deleted.year}{deleted.color ? ` • ${deleted.color}` : ""}{deleted.fuelType ? ` • ${deleted.fuelType}` : ""}
                      </p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-300">
                      <Clock className="h-3 w-3" />
                      {getDaysRemaining(deleted)} dias restantes
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Excluído em {deleted.deletedAt ? new Date(deleted.deletedAt).toLocaleDateString("pt-BR") : "---"}
                    {getExpiresAt(deleted) ? ` • Expira em ${getExpiresAt(deleted)}` : ""}
                  </p>
                  <div className="space-y-1.5">
                    <label htmlFor={`renavam-${deleted.id}`} className="ml-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      Renavam do veículo (obrigatório)
                    </label>
                    <input
                      id={`renavam-${deleted.id}`}
                      type="text"
                      inputMode="numeric"
                      placeholder="Digite o Renavam cadastrado"
                      value={renavamInputs[deleted.id] || ""}
                      onChange={(event) => {
                        const value = event.target.value.replace(/\D/g, "").slice(0, 11);
                        setRenavamInputs((current) => ({ ...current, [deleted.id]: value }));
                        if (recoveryErrors[deleted.id]) {
                          setRecoveryErrors((current) => ({ ...current, [deleted.id]: "" }));
                        }
                      }}
                      maxLength={11}
                      className="flex h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950/60 px-4 py-2 text-sm text-zinc-100 outline-none transition-all placeholder:text-zinc-600 focus:border-zinc-500 focus-visible:ring-1 focus-visible:ring-white/20"
                    />
                  </div>
                  {recoveryErrors[deleted.id] && (
                    <p className="rounded-2xl border border-red-800 bg-red-900/30 p-3 text-xs text-red-300">
                      {recoveryErrors[deleted.id]}
                    </p>
                  )}
                  <Button
                    type="button"
                    onClick={() => handleRecoverVehicle(deleted)}
                    isLoading={recoveringId === deleted.id}
                    disabled={!renavamInputs[deleted.id]}
                    className="w-full rounded-full py-3"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Recuperar Veículo
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsRecoveryModalOpen(false)} className="rounded-full px-6 py-3">
              Fechar
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        title="Fale Conosco"
        hideCloseButton
        className="overflow-hidden rounded-[1.75rem] border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-900/95 to-white/5 shadow-[0_25px_60px_-20px_rgba(255,255,255,0.15)] backdrop-blur"
      >
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-white/60 via-white/30 to-white/10" />
        <div aria-hidden="true" className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="relative space-y-4">
          <p className="text-sm text-zinc-400">
            Entre em contato com a gente pelos canais abaixo:
          </p>
          <a
            href="mailto:Johnnypereiradacostajr@gmail.com"
            className="flex items-center gap-3 rounded-[1.25rem] border border-white/10 bg-white/5 p-4 text-sm text-zinc-200 backdrop-blur transition-colors hover:bg-white/10 hover:text-white"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white text-zinc-950 shadow-lg shadow-white/10">
              <Mail className="h-5 w-5 shrink-0 text-zinc-950" />
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500">E-mail</span>
              Johnnypereiradacostajr@gmail.com
            </span>
          </a>
          <a
            href="tel:+5583991387121"
            className="flex items-center gap-3 rounded-[1.25rem] border border-white/10 bg-white/5 p-4 text-sm text-zinc-200 backdrop-blur transition-colors hover:bg-white/10 hover:text-white"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white text-zinc-950 shadow-lg shadow-white/10">
              <Phone className="h-5 w-5 shrink-0 text-zinc-950" />
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500">Telefone</span>
              (83) 99138-7121
            </span>
          </a>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsContactModalOpen(false)} className="rounded-full">
              Fechar
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Sair da conta?"
        subtitle="Tem certeza de que deseja realmente sair da sua conta?"
        icon={<LogOut className="h-7 w-7 text-zinc-950" />}
        variant="balloon"
        hideCloseButton
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => setIsLogoutModalOpen(false)}
            className="flex-1 rounded-full py-3"
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={handleLogout}
            className="flex-1 rounded-full py-3"
          >
            Sair
          </Button>
        </div>
      </Modal>
      </div>
    </div>
  );
}
