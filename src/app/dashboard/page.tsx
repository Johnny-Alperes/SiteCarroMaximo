"use client";

import { useState, useEffect } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Car as CarIcon, ChevronRight, Fuel, Calendar } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

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
                  <div className="text-right">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                      Placa
                    </span>
                    <p className="mt-1 border border-zinc-700 bg-zinc-900 px-2 py-1 font-mono text-sm font-bold text-zinc-200">
                      {vehicle.plate}
                    </p>
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
                  <Button variant="outline" className="group/btn w-full justify-between">
                    Ver detalhes
                    <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </Link>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
