"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ChevronLeft, Save } from "lucide-react";
import Link from "next/link";

export default function NewVehiclePage() {
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!auth.currentUser) return;

    try {
      await addDoc(collection(db, `users/${auth.currentUser.uid}/vehicles`), {
        ...formData,
        plate: formData.plate.toUpperCase(),
        createdAt: new Date().toISOString(),
      });
      router.push("/dashboard");
    } catch (error) {
      console.error("Erro ao adicionar veículo:", error);
      alert("Erro ao salvar veículo. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-primary transition-colors mb-4">
        <ChevronLeft className="w-4 h-4" />
        Voltar para o Dashboard
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Novo Veículo</h1>
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
              <label className="text-sm font-semibold ml-1 text-foreground/70">Ano</label>
              <select
                className="flex h-12 w-full rounded-2xl border border-border bg-background/50 px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold ml-1 text-foreground/70">Cor</label>
              <select
                className="flex h-12 w-full rounded-2xl border border-border bg-background/50 px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all"
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
              <label className="text-sm font-semibold ml-1 text-foreground/70">Combustível</label>
              <select
                className="flex h-12 w-full rounded-2xl border border-border bg-background/50 px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all"
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
              Salvar Veículo
            </Button>
            <Link href="/dashboard" className="flex-1">
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
