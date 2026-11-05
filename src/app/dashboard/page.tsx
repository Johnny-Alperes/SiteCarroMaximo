"use client";

import { useState, useEffect } from "react";
import { collection, query, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Car as CarIcon, ChevronRight, Fuel, Calendar, Trash2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Modal } from "@/components/ui/Modal";

interface Vehicle {
  id: string;
  model: string;
  plate: string;
  year: string;
  color: string;
  fuelType: string;
}

export default function DashboardPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const [isDeletingVehicle, setIsDeletingVehicle] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState(0);
  const [deleteBarVisible, setDeleteBarVisible] = useState(false);
  const [deleteError, setDeleteError] = useState("");

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
      await deleteDoc(doc(db, `users/${user.uid}/vehicles`, target.id));
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

  const vehicleGradients = [
    "from-violet-600 to-fuchsia-500",
    "from-emerald-600 to-teal-500",
    "from-amber-500 to-orange-500",
    "from-cyan-500 to-sky-500",
    "from-rose-600 to-red-500",
    "from-blue-600 to-indigo-500",
    "from-pink-600 to-rose-500",
    "from-lime-600 to-green-500",
    "from-purple-600 to-violet-500",
    "from-orange-600 to-amber-500",
  ];
  const vehicleShadows = [
    "shadow-violet-500/40",
    "shadow-emerald-500/40",
    "shadow-amber-500/40",
    "shadow-sky-500/40",
    "shadow-rose-500/40",
    "shadow-indigo-500/40",
    "shadow-pink-500/40",
    "shadow-lime-500/40",
    "shadow-purple-500/40",
    "shadow-orange-500/40",
  ];
  const vehicleCardBgs = [
    "bg-gradient-to-br from-violet-600/25 via-zinc-900 to-zinc-900",
    "bg-gradient-to-br from-emerald-600/25 via-zinc-900 to-zinc-900",
    "bg-gradient-to-br from-amber-500/25 via-zinc-900 to-zinc-900",
    "bg-gradient-to-br from-cyan-500/25 via-zinc-900 to-zinc-900",
    "bg-gradient-to-br from-rose-600/25 via-zinc-900 to-zinc-900",
    "bg-gradient-to-br from-blue-600/25 via-zinc-900 to-zinc-900",
    "bg-gradient-to-br from-pink-600/25 via-zinc-900 to-zinc-900",
    "bg-gradient-to-br from-lime-600/25 via-zinc-900 to-zinc-900",
    "bg-gradient-to-br from-purple-600/25 via-zinc-900 to-zinc-900",
    "bg-gradient-to-br from-orange-600/25 via-zinc-900 to-zinc-900",
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin border border-zinc-700 border-b-white" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">Garagem</p>
          <h1 className="bg-gradient-to-r from-violet-300 via-fuchsia-200 to-amber-200 bg-clip-text text-3xl md:text-4xl font-black uppercase tracking-tight text-transparent">
            Olá, {userName}
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Gerencie sua frota e acompanhe seus gastos.
          </p>
        </div>
        <Link href="/dashboard/vehicles/new">
          <Button className="h-11 rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 px-6 text-white shadow-lg shadow-violet-500/30 hover:brightness-110">
            <Plus className="w-4 h-4" />
            Adicionar Veículo
          </Button>
        </Link>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="bg-gradient-to-r from-violet-300 to-fuchsia-200 bg-clip-text text-lg font-bold uppercase tracking-widest text-transparent">
          Meus Veículos
        </h2>
        <span className="rounded-full border border-violet-300/30 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-violet-200 backdrop-blur">
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
          {vehicles.map((vehicle, index) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -6 }}
            >
              <Card className={`modern-hover group overflow-hidden rounded-2xl border-2 ${vehicleCardBgs[index % vehicleCardBgs.length]} text-white shadow-2xl ${vehicleShadows[index % vehicleShadows.length]}`}>
                <div className={`h-2 bg-gradient-to-r ${vehicleGradients[index % vehicleGradients.length]}`} />
                <div className={`h-1 bg-gradient-to-r opacity-60 ${vehicleGradients[index % vehicleGradients.length]} blur-[1px]`} />
                <div className="p-5">
                  <div className="mb-4 flex items-start justify-between">
                    <div className={`rounded-2xl bg-gradient-to-br p-3 text-white shadow-xl ${vehicleGradients[index % vehicleGradients.length]} ${vehicleShadows[index % vehicleShadows.length]} transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110`}>
                      <CarIcon className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="text-right">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-300">
                          Placa
                        </span>
                        <p className={`mt-1 rounded-lg border border-white/20 bg-zinc-800 px-2 py-1 font-mono text-sm font-bold text-white shadow ${vehicleShadows[index % vehicleShadows.length]}`}>
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
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-zinc-800/80 px-2.5 py-1 text-xs font-bold text-white">
                      <Calendar className="w-3.5 h-3.5" />
                      {vehicle.year}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r px-2.5 py-1 text-xs font-bold text-white shadow ${vehicleGradients[index % vehicleGradients.length]} ${vehicleShadows[index % vehicleShadows.length]}`}>
                      <Fuel className="w-3.5 h-3.5" />
                      {vehicle.fuelType}
                    </span>
                    {vehicle.color && (
                      <span className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r px-2.5 py-1 text-xs font-bold text-white shadow ${vehicleGradients[index % vehicleGradients.length]} ${vehicleShadows[index % vehicleShadows.length]}`}>
                        {vehicle.color}
                      </span>
                    )}
                  </div>

                  <motion.div whileTap={{ scale: 0.94 }}>
                    <Link href={`/dashboard/vehicles/${vehicle.id}`} className="block">
                      <motion.button
                        whileHover={{ scale: 1.03, y: -2, rotate: -0.3 }}
                        whileTap={{ scale: 0.9, rotate: 0.5, transition: { type: "spring", stiffness: 500, damping: 15 } }}
                        onPointerDown={(e) => {
                          const ripple = document.createElement("span");
                          ripple.style.cssText = `position:absolute;left:${e.clientX - (e.currentTarget as HTMLButtonElement).getBoundingClientRect().left - 14}px;top:${e.clientY - (e.currentTarget as HTMLButtonElement).getBoundingClientRect().top - 14}px;width:28px;height:28px;border-radius:9999px;background:rgba(255,255,255,0.5);pointer-events:none;animation:ripple 0.6s ease-out forwards;`;
                          (e.currentTarget as HTMLButtonElement).appendChild(ripple);
                          window.setTimeout(() => ripple.remove(), 650);
                        }}
                        className={`group/btn relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r px-6 py-3.5 text-sm font-bold uppercase tracking-widest text-white shadow-lg transition-[filter] duration-300 hover:brightness-110 active:brightness-90 ${vehicleGradients[index % vehicleGradients.length]} ${vehicleShadows[index % vehicleShadows.length]}`}
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
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

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
      >
        <div className="space-y-6">
          <div className="flex items-start gap-3 border border-red-900/60 bg-red-950/30 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
            <div>
              <p className="text-sm text-zinc-300">Você está prestes a excluir:</p>
              <p className="mt-1 font-bold text-white">
                {vehicleToDelete ? `${vehicleToDelete.model} - ${vehicleToDelete.plate}` : ""}
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
                setVehicleToDelete(null);
                setDeleteError("");
                setDeleteBarVisible(false);
                setDeleteProgress(0);
              }}
              disabled={isDeletingVehicle}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteVehicle}
              isLoading={isDeletingVehicle}
            >
              Excluir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
