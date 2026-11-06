"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ChevronLeft, Save, CheckCircle2, Car as CarIcon, Sparkles } from "lucide-react";
import Link from "next/link";

export default function NewVehiclePage() {
  const [loading, setLoading] = useState(false);
  const [registerProgress, setRegisterProgress] = useState(0);
  const [registerBarVisible, setRegisterBarVisible] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
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
    setRegisterSuccess(false);
    setRegisterBarVisible(true);
    setRegisterProgress(0);

    if (!auth.currentUser) return;

    const progressTimer = window.setInterval(() => {
      setRegisterProgress((current) => (current >= 80 ? current : current + 2));
    }, 140);

    try {
      await addDoc(collection(db, `users/${auth.currentUser.uid}/vehicles`), {
        ...formData,
        plate: formData.plate.toUpperCase(),
        createdAt: new Date().toISOString(),
      });
      window.clearInterval(progressTimer);
      setRegisterProgress(100);
      setRegisterSuccess(true);
      window.setTimeout(() => {
        router.push("/dashboard");
      }, 1600);
    } catch (error) {
      console.error("Erro ao adicionar veículo:", error);
      window.clearInterval(progressTimer);
      setRegisterBarVisible(false);
      setRegisterProgress(0);
      alert("Erro ao salvar veículo. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative mx-auto max-w-2xl py-4">
      <div aria-hidden="true" className="pointer-events-none absolute -top-16 -left-16 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -top-10 -right-10 h-56 w-56 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 right-1/3 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />

      <Link href="/dashboard" className="relative mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 backdrop-blur transition-colors hover:bg-white/10 hover:text-white">
        <ChevronLeft className="w-4 h-4" />
        Voltar para o Dashboard
      </Link>

      <Card className="relative overflow-hidden rounded-[1.75rem] border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-900/95 to-violet-950/40 p-8 shadow-[0_25px_60px_-20px_rgba(168,85,247,0.35)] backdrop-blur md:p-10">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-400 to-amber-300" />
        <div aria-hidden="true" className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-fuchsia-500/15 blur-3xl" />

        <div className="relative mb-8 flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-fuchsia-500/30">
            <CarIcon className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-black uppercase tracking-tight text-white">
              Novo Veículo
              <Sparkles className="h-5 w-5 text-amber-300" />
            </h1>
            <p className="mt-1 text-sm text-zinc-400">Preencha os dados para adicionar à sua garagem.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="relative space-y-6">
          {registerBarVisible && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <div className="mb-3 flex items-center gap-3 text-emerald-300">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                <p className="text-sm font-bold uppercase tracking-widest text-emerald-400">
                  {registerSuccess ? "Cadastrado com sucesso!" : "Cadastrando..."}
                </p>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full border border-emerald-900/70 bg-zinc-900">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-700" style={{ width: `${registerProgress}%` }} />
              </div>
              <p className="mt-2 text-right text-xs text-emerald-300">{registerProgress}%</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Modelo"
              placeholder="Ex: Toyota Corolla"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              required
              className="rounded-xl bg-zinc-950/60"
            />

            <Input
              label="Placa"
              placeholder="ABC-1234"
              value={formData.plate}
              onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
              required
              className="rounded-xl bg-zinc-950/60"
            />

            <div className="space-y-1.5">
              <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Ano</label>
              <select
                className="flex h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950/60 px-4 py-2 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:border-zinc-500 transition-all"
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
                className="flex h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950/60 px-4 py-2 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:border-zinc-500 transition-all"
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
              className="rounded-xl bg-zinc-950/60"
            />

            <div className="space-y-1.5">
              <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Combustível</label>
              <select
                className="flex h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950/60 px-4 py-2 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:border-zinc-500 transition-all"
                value={formData.fuelType}
                onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
              >
                {fuelTypes.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <Button type="submit" className="flex-1 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 py-4 text-lg shadow-lg shadow-fuchsia-500/25 hover:brightness-110" isLoading={loading}>
              <Save className="w-5 h-5" />
              Salvar Veículo
            </Button>
            <Link href="/dashboard" className="flex-1">
              <Button variant="outline" type="button" className="w-full rounded-full py-4 text-lg">
                Cancelar
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
