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
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">
            Olá, {userName}
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Gerencie sua frota e acompanhe seus gastos.
          </p>
        </div>
        <Link href="/dashboard/vehicles/new">
          <Button className="h-11 px-6">
            <Plus className="w-4 h-4" />
            Adicionar Veículo
          </Button>
        </Link>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold uppercase tracking-widest text-zinc-300">
          Meus Veículos
        </h2>
        <span className="border border-zinc-700 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          {vehicles.length} {vehicles.length === 1 ? "Veículo" : "Veículos"}
        </span>
      </div>

      {vehicles.length === 0 ? (
        <Card className="flex flex-col items-center justify-center border-dashed p-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center border border-zinc-700 bg-zinc-900">
            <CarIcon className="h-7 w-7 text-zinc-400" />
          </div>
          <h3 className="mb-2 text-xl font-black uppercase tracking-tight">
            Nenhum veículo cadastrado
          </h3>
          <p className="mb-6 max-w-sm text-sm text-zinc-400">
            Comece adicionando seu primeiro veículo para acompanhar manutenções,
            abastecimentos e gastos totais.
          </p>
          <Link href="/dashboard/vehicles/new">
            <Button variant="outline">Cadastrar meu primeiro carro</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle, index) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group overflow-hidden">
                <div className="mb-6 flex items-start justify-between">
                  <div className="border border-zinc-700 bg-zinc-900 p-3 text-zinc-400 transition-colors group-hover:border-zinc-500 group-hover:text-white">
                    <CarIcon className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                        Placa
                      </span>
                      <p className="mt-1 border border-zinc-700 bg-zinc-900 px-2 py-1 font-mono text-sm font-bold text-zinc-200">
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
                      className="flex items-center gap-1.5 p-2 text-zinc-500 transition-colors hover:text-red-400"
                      title="Excluir veículo"
                      aria-label={`Excluir ${vehicle.model}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <h3 className="mb-4 text-2xl font-black uppercase tracking-tight text-white">
                  {vehicle.model}
                </h3>

                <div className="mb-6 flex items-center gap-4 text-sm text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {vehicle.year}
                  </div>
                  <div className="h-1 w-1 rounded-full bg-zinc-700" />
                  <div className="flex items-center gap-1.5">
                    <Fuel className="w-4 h-4" />
                    {vehicle.fuelType}
                  </div>
                </div>

                <Link href={`/dashboard/vehicles/${vehicle.id}`}>
                  <button className="group/btn relative flex w-full items-center justify-center gap-3 overflow-hidden border border-white bg-white px-6 py-4 text-sm font-bold uppercase tracking-widest text-zinc-950 transition-all duration-300 hover:bg-zinc-200 hover:text-zinc-950 hover:shadow-[0_0_28px_rgba(255,255,255,0.16)]">
                    <span className="absolute inset-y-0 left-0 w-1 bg-zinc-950/20 transition-all duration-300 group-hover/btn:w-full group-hover/btn:bg-zinc-950/10" />
                    <span className="relative">Gerenciamento do Veículo</span>
                    <ChevronRight className="relative h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                  </button>
                </Link>
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
