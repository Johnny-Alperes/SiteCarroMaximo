"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ChevronLeft, Save } from "lucide-react";
import Link from "next/link";

export default function EditVehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    model: "",
    plate: "",
    year: new Date().getFullYear().toString(),
    color: "Prata",
    renavam: "",
    fuelType: "Flex",
  });

  const years = Array.from(
    { length: new Date().getFullYear() - 1980 + 2 },
    (_, i) => (new Date().getFullYear() + 1 - i).toString()
  );

  const colors = [
    "Branco", "Preto", "Prata", "Cinza", "Vermelho", 
    "Azul", "Verde", "Amarelo", "Bege", "Marrom"
  ];

  const fuelTypes = ["Flex", "Gasolina", "Etanol", "Diesel", "GNV", "Elétrico", "Híbrido"];

  useEffect(() => {
    if (!id) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setFetching(false);
        return;
      }

      try {
        const docRef = doc(db, `users/${user.uid}/vehicles`, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            model: data.model ?? "",
            plate: data.plate ?? "",
            year: data.year ?? new Date().getFullYear().toString(),
            color: data.color ?? "Prata",
            renavam: data.renavam ?? "",
            fuelType: data.fuelType ?? "Flex",
          });
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error("Erro ao carregar veículo:", error);
        setNotFound(true);
      } finally {
        setFetching(false);
      }
    });

    return () => unsubscribe();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!auth.currentUser) return;

    try {
      const docRef = doc(db, `users/${auth.currentUser.uid}/vehicles`, id);
      await updateDoc(docRef, {
        ...formData,
        plate: formData.plate.toUpperCase(),
      });
      router.push(`/dashboard/vehicles/${id}`);
    } catch (error) {
      console.error("Erro ao atualizar veículo:", error);
      alert("Erro ao salvar veículo. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <p className="text-sm text-foreground/60">Carregando veículo...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-primary transition-colors mb-4">
          <ChevronLeft className="w-4 h-4" />
          Voltar para o Dashboard
        </Link>
        <h1 className="text-3xl font-black uppercase tracking-tight">Veículo não encontrado</h1>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href={`/dashboard/vehicles/${id}`} className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-primary transition-colors mb-4">
        <ChevronLeft className="w-4 h-4" />
        Voltar para o veículo
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black uppercase tracking-tight">Editar Veículo</h1>
      </div>

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Modelo"
              placeholder="Ex: Toyota Corolla"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              required
            />

            <Input
              label="Placa"
              placeholder="ABC-1234"
              value={formData.plate}
              onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
              required
            />

            <div className="space-y-1.5">
              <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Ano</label>
              <select
                className="flex h-12 w-full rounded-none border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:border-zinc-500 transition-all"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Cor</label>
              <select
                className="flex h-12 w-full rounded-none border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:border-zinc-500 transition-all"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              >
                {colors.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <Input
              label="Renavam (Opcional)"
              placeholder="Apenas números"
              value={formData.renavam}
              onChange={(e) => setFormData({ ...formData, renavam: e.target.value.replace(/\D/g, "") })}
              maxLength={11}
            />

            <div className="space-y-1.5">
              <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Combustível</label>
              <select
                className="flex h-12 w-full rounded-none border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:border-zinc-500 transition-all"
                value={formData.fuelType}
                onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
              >
                {fuelTypes.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <Button type="submit" className="flex-1 py-4 text-lg" isLoading={loading}>
              <Save className="w-5 h-5" />
              Salvar Alterações
            </Button>
            <Link href={`/dashboard/vehicles/${id}`} className="flex-1">
              <Button variant="outline" type="button" className="w-full py-4 text-lg">
                Cancelar
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
