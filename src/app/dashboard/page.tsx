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
import QuickActions from "@/components/dashboard/QuickActions";

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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Olá, {userName}! 👋</h1>
          <p className="text-foreground/60">Gerencie sua frota e acompanhe seus gastos.</p>
        </div>
        <Link href="/dashboard/vehicles/new">
          <Button className="h-12 px-6 rounded-2xl">
            <Plus className="w-5 h-5" />
            Adicionar Veículo
          </Button>
        </Link>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Meus Veículos</h2>
        <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">
          {vehicles.length} {vehicles.length === 1 ? 'Veículo' : 'Veículos'}
        </span>
      </div>

      {vehicles.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center border-dashed">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <CarIcon className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">Nenhum veículo cadastrado</h3>
          <p className="text-foreground/60 mb-6 max-w-sm">
            Comece adicionando seu primeiro veículo para acompanhar manutenções, 
            abastecimentos e gastos totais.
          </p>
          <Link href="/dashboard/vehicles/new">
            <Button variant="outline">Cadastrar meu primeiro carro</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {vehicles.map((vehicle, index) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group overflow-hidden flex flex-col h-full border-border/40 hover:border-primary/30 transition-all">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="bg-primary/10 p-3 rounded-2xl group-hover:bg-primary group-hover:text-white transition-all">
                      <CarIcon className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold uppercase tracking-widest text-foreground/40">Placa</span>
                      <p className="font-mono font-bold text-sm bg-white/5 px-2 py-1 rounded border border-border">
                        {vehicle.plate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-end justify-between mb-6">
                    <div>
                      <h3 className="text-3xl font-bold mb-2">{vehicle.model}</h3>
                      <div className="flex items-center gap-4 text-sm text-foreground/60">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {vehicle.year}
                        </div>
                        <div className="w-1 h-1 bg-border rounded-full"></div>
                        <div className="flex items-center gap-1.5">
                          <Fuel className="w-4 h-4" />
                          {vehicle.fuelType}
                        </div>
                      </div>
                    </div>
                    
                    <Link href={`/dashboard/vehicles/${vehicle.id}`}>
                      <Button size="sm" variant="ghost" className="gap-2 text-primary hover:text-primary hover:bg-primary/5">
                        Detalhes
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="mt-auto border-t border-border/50 bg-black/20 p-6">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-4">Ações Rápidas</p>
                  <QuickActions vehicleId={vehicle.id} compact={true} />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
