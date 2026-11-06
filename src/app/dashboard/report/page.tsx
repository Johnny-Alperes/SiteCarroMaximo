"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { Card } from "@/components/ui/Card";
import { ChevronLeft, BarChart3, TrendingUp, CalendarRange, DollarSign } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const COLLECTIONS = [
  "maintenance",
  "fuel",
  "battery",
  "oil",
  "defects",
  "filters",
  "revision",
  "tires_records",
  "alignment",
  "ac",
  "wash",
  "travel",
  "calibration",
  "licensing",
  "fines",
  "ipva",
];

const MONTHS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

type MonthlyExpense = {
  key: string;
  label: string;
  month: number;
  year: number;
  total: number;
  count: number;
};

function parseDateValue(value: any): Date | null {
  if (!value) return null;
  if (value.seconds) {
    return new Date(value.seconds * 1000);
  }
  if (typeof value === "string") {
    const brDate = value.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
    if (brDate) {
      return new Date(Number(brDate[3]), Number(brDate[2]) - 1, Number(brDate[1]));
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getRecordDate(data: any): Date | null {
  return (
    parseDateValue(data.date) ||
    parseDateValue(data.data) ||
    parseDateValue(data.lastDate) ||
    parseDateValue(data.lastServiceDate) ||
    parseDateValue(data.dueDate) ||
    parseDateValue(data.createdAt) ||
    parseDateValue(data.updatedAt)
  );
}

function getRecordPrice(data: any): number {
  const raw =
    data.price ??
    data.totalPrice ??
    data.total ??
    data.value ??
    data.valor ??
    data.custo ??
    data.preco;
  const numeric = Number(raw);
  if (Number.isFinite(numeric) && numeric > 0) return numeric;
  if (data.liters && data.pricePerLiter) {
    const computed = Number(data.liters) * Number(data.pricePerLiter);
    if (Number.isFinite(computed) && computed > 0) return computed;
  }
  return 0;
}

export default function ReportPage() {
  const [monthly, setMonthly] = useState<MonthlyExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>("all");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const results = await Promise.all(
          COLLECTIONS.map(async (colName) => {
            const colRef = collection(db, `users/${user.uid}/${colName}`);
            const snapshot = await getDocs(colRef);
            return snapshot.docs.map((itemDoc) => itemDoc.data());
          })
        );
        const allRecords = results.flat();
        const grouped = new Map<string, MonthlyExpense>();
        for (const data of allRecords) {
          const date = getRecordDate(data);
          const price = getRecordPrice(data);
          if (!date || !price) continue;
          const month = date.getMonth();
          const year = date.getFullYear();
          const key = `${year}-${String(month + 1).padStart(2, "0")}`;
          const current = grouped.get(key);
          if (current) {
            current.total += price;
            current.count += 1;
          } else {
            grouped.set(key, {
              key,
              label: `${MONTHS[month]}/${year}`,
              month,
              year,
              total: price,
              count: 1,
            });
          }
        }
        const sorted = Array.from(grouped.values()).sort((a, b) =>
          a.year === b.year ? a.month - b.month : a.year - b.year
        );
        setMonthly(sorted);
      } catch (error) {
        console.error("Erro ao carregar relatório:", error);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const years = useMemo(() => {
    return Array.from(new Set(monthly.map((item) => item.year))).sort((a, b) => b - a);
  }, [monthly]);

  const chartData = useMemo(() => {
    const filtered = selectedYear === "all" ? monthly : monthly.filter((item) => item.year === Number(selectedYear));
    return filtered.map((item) => ({
      ...item,
      gasto: Math.round(item.total * 100) / 100,
    }));
  }, [monthly, selectedYear]);

  const totalGeneral = useMemo(() => chartData.reduce((sum, item) => sum + item.total, 0), [chartData]);
  const avgMonthly = chartData.length ? totalGeneral / chartData.length : 0;
  const bestMonth = useMemo(
    () => (chartData.length ? chartData.reduce((max, item) => (item.total > max.total ? item : max), chartData[0]) : null),
    [chartData]
  );

  const formatBRL = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin border border-zinc-700 border-b-white" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <Link
        href="/dashboard"
        aria-label="Voltar para o Dashboard"
        title="Voltar para o Dashboard"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/40 text-zinc-400 transition-colors hover:border-zinc-600 hover:text-white"
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
            <BarChart3 className="h-3.5 w-3.5" />
            Relatório
          </p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">Relatório em Gráfico</h1>
          <p className="mt-1 text-sm text-zinc-400">Gasto por mês e ano em gráfico de barras.</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="report-year" className="ml-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Ano
          </label>
          <select
            id="report-year"
            value={selectedYear}
            onChange={(event) => setSelectedYear(event.target.value)}
            className="flex h-11 w-full min-w-44 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:border-zinc-500"
          >
            <option value="all">Todos os anos</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="modern-hover rounded-2xl border-zinc-700/60 bg-zinc-900 p-5 text-white">
          <div className="flex items-center gap-2 text-zinc-400">
            <DollarSign className="h-4 w-4 text-emerald-400" />
            <p className="text-[10px] font-bold uppercase tracking-widest">Total geral</p>
          </div>
          <p className="mt-2 text-2xl font-black text-white">{formatBRL(totalGeneral)}</p>
          <p className="mt-1 text-xs text-zinc-400">{chartData.reduce((sum, item) => sum + item.count, 0)} registros</p>
        </Card>
        <Card className="modern-hover rounded-2xl border-zinc-700/60 bg-zinc-900 p-5 text-white">
          <div className="flex items-center gap-2 text-zinc-400">
            <TrendingUp className="h-4 w-4 text-violet-400" />
            <p className="text-[10px] font-bold uppercase tracking-widest">Média por mês</p>
          </div>
          <p className="mt-2 text-2xl font-black text-white">{formatBRL(avgMonthly)}</p>
          <p className="mt-1 text-xs text-zinc-400">{chartData.length} {chartData.length === 1 ? "mês" : "meses"}</p>
        </Card>
        <Card className="modern-hover rounded-2xl border-zinc-700/60 bg-zinc-900 p-5 text-white">
          <div className="flex items-center gap-2 text-zinc-400">
            <CalendarRange className="h-4 w-4 text-amber-400" />
            <p className="text-[10px] font-bold uppercase tracking-widest">Maior gasto</p>
          </div>
          <p className="mt-2 text-2xl font-black text-white">{bestMonth ? formatBRL(bestMonth.total) : "---"}</p>
          <p className="mt-1 text-xs text-zinc-400">{bestMonth ? bestMonth.label : "Sem registros"}</p>
        </Card>
      </div>

      <Card className="modern-hover overflow-hidden rounded-2xl border-zinc-700/60 bg-zinc-900 p-5 text-white md:p-6">
        <div className="mb-5 flex flex-col gap-1">
          <h2 className="text-lg font-black uppercase tracking-wide text-white">Gasto por mês e ano</h2>
          <p className="text-xs text-zinc-400">Cada barra representa a soma dos gastos daquele mês.</p>
        </div>

        {chartData.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/50 p-12 text-center">
            <BarChart3 className="mx-auto mb-3 h-8 w-8 text-zinc-500" />
            <p className="font-bold text-white">Nenhum gasto encontrado</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-400">
              Cadastre serviços, abastecimentos e registros com valor para acompanhar seu gasto por mês e ano.
            </p>
          </div>
        ) : (
          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "#a1a1aa", fontSize: 12 }} stroke="#52525b" />
                <YAxis
                  tick={{ fill: "#a1a1aa", fontSize: 12 }}
                  stroke="#52525b"
                  tickFormatter={(value: number) =>
                    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
                  }
                />
                <Tooltip
                  contentStyle={{ background: "#09090b", border: "1px solid #3f3f46", borderRadius: 12, color: "#fff" }}
                  labelStyle={{ color: "#fff", fontWeight: 700 }}
                  formatter={(value: any, _name: any) => [formatBRL(Number(value)), "Gasto"]}
                />
                <Bar dataKey="gasto" name="Gasto" radius={[8, 8, 0, 0]} fill="#a855f7">
                  {chartData.map((entry, index) => (
                    <Cell key={entry.key} fill={index % 2 === 0 ? "#a855f7" : "#22c55e"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {chartData.length > 0 && (
        <Card className="overflow-hidden rounded-2xl border-zinc-700/60 bg-zinc-900 text-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-[10px] uppercase tracking-widest text-zinc-500">
                  <th className="px-5 py-3 font-bold">Mês</th>
                  <th className="px-5 py-3 font-bold">Ano</th>
                  <th className="px-5 py-3 font-bold">Registros</th>
                  <th className="px-5 py-3 text-right font-bold">Gasto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {chartData.map((item) => (
                  <tr key={item.key} className="hover:bg-white/5">
                    <td className="px-5 py-3 font-bold text-white">{item.label}</td>
                    <td className="px-5 py-3 text-zinc-300">{item.year}</td>
                    <td className="px-5 py-3 text-zinc-300">{item.count}</td>
                    <td className="px-5 py-3 text-right font-bold text-white">{formatBRL(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
