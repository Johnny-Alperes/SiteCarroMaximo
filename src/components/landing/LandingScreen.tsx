"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BatteryCharging,
  Car,
  Fuel,
  Gauge,
  Radio,
  ShieldCheck,
  Sparkles,
  Thermometer,
  TriangleAlert,
  Wrench,
} from "lucide-react";

const metrics = [
  { icon: Fuel, label: "Combustível", value: 78, bar: "bg-emerald-400", text: "text-emerald-400" },
  { icon: Wrench, label: "Óleo / filtros", value: 64, bar: "bg-indigo-400", text: "text-indigo-400" },
  { icon: Gauge, label: "Pneus", value: 92, bar: "bg-sky-400", text: "text-sky-400" },
];

const features = [
  { icon: Gauge, title: "Telemetria", desc: "Dados em tempo real" },
  { icon: Wrench, title: "Manutenção", desc: "Alertas preventivos" },
  { icon: Fuel, title: "Custos", desc: "Controle por km" },
  { icon: ShieldCheck, title: "Segurança", desc: "Dados criptografados" },
];

const stats = [
  { value: "12k+", label: "Veículos" },
  { value: "98%", label: "Uptime" },
  { value: "R$ 4,8M", label: "Economizados" },
];

function TechBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_-10%,rgba(99,102,241,0.22),transparent_45%),radial-gradient(circle_at_88%_110%,rgba(16,185,129,0.16),transparent_45%)]" />
      <div className="absolute inset-0 opacity-[0.16] bg-[linear-gradient(to_right,rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.14)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]" />

      <motion.div
        className="absolute -left-32 top-1/4 h-80 w-80 rounded-full bg-primary/25 blur-[120px]"
        animate={{ opacity: [0.35, 0.6, 0.35], scale: [1, 1.08, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-secondary/20 blur-[130px]"
        animate={{ opacity: [0.3, 0.55, 0.3], scale: [1.05, 1, 1.05] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
        animate={{ top: ["8%", "92%", "8%"] }}
        transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
      />

      <div className="absolute inset-4 rounded-3xl border border-white/5 [mask-image:linear-gradient(to_bottom,black,transparent_35%,transparent_65%,black)]" />
    </div>
  );
}

function LandingHeader() {
  return (
    <header className="relative z-20 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-background/40 px-4 backdrop-blur-xl [@media(max-height:560px)]:h-14 sm:px-6 lg:h-[72px] lg:px-10">
      <Link href="/" className="group flex items-center gap-3">
        <div className="relative grid h-10 w-10 place-items-center rounded-xl border border-primary/40 bg-primary/10">
          <Car className="h-5 w-5 text-primary" />
          <span className="absolute inset-0 animate-ping rounded-xl border border-primary/20 opacity-20" />
        </div>
        <div className="leading-none">
          <p className="text-sm font-black tracking-[0.2em] text-foreground">CARRO MÁXIMO</p>
          <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.32em] text-primary/70">Control Deck</p>
        </div>
      </Link>

      <nav className="hidden items-center gap-7 text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/45 md:flex">
        <a href="#features" className="transition-colors hover:text-primary">Sistema</a>
        <a href="#telemetry" className="transition-colors hover:text-primary">Telemetria</a>
        <a href="#features" className="transition-colors hover:text-primary">Segurança</a>
      </nav>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1.5 sm:flex">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-secondary" />
          </span>
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-secondary">Online</span>
        </div>
        <Link
          href="/login"
          className="rounded-lg px-3 py-2 text-xs font-semibold text-foreground/70 transition-colors hover:text-primary"
        >
          Entrar
        </Link>
        <Link
          href="/register"
          className="group inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/15 px-3 py-2 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-white"
        >
          Começar
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </header>
  );
}

function LandingHero() {
  return (
    <section className="relative flex min-h-0 w-full flex-1 flex-col justify-center py-1 lg:py-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 [@media(max-height:560px)]:hidden"
      >
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-primary sm:text-[10px]">
          Gestão automotiva inteligente · v2.0
        </span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.05 }}
        className="max-w-[16ch] text-[clamp(2rem,5vw,4.4rem)] font-black leading-[0.98] tracking-tight"
      >
        Controle total do seu veículo em{" "}
        <span className="text-gradient">uma única tela.</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.12 }}
        className="mt-4 max-w-xl text-[clamp(0.8rem,1.1vw,1.02rem)] leading-relaxed text-foreground/55 [@media(max-height:700px)]:hidden"
      >
        Telemetria, manutenção e custos em um painel inteligente. Tome decisões
        com dados em tempo real e mantenha cada detalhe sob controle.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.18 }}
        className="mt-5 flex flex-wrap items-center gap-2 [@media(max-height:560px)]:mt-3 sm:gap-3"
      >
        <Link
          href="/login"
          className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-[0_0_35px_-8px_rgba(99,102,241,0.9)] transition-all hover:bg-primary/90"
        >
          Acessar painel
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
        <Link
          href="/register"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-foreground/80 backdrop-blur-md transition-all hover:border-primary/30 hover:text-primary"
        >
          Criar conta
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-6 grid max-w-lg grid-cols-3 gap-2 [@media(max-height:660px)]:hidden"
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 backdrop-blur-sm"
          >
            <p className="text-[clamp(0.95rem,1.4vw,1.25rem)] font-black leading-none text-foreground">
              {stat.value}
            </p>
            <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-foreground/40">
              {stat.label}
            </p>
          </div>
        ))}
      </motion.div>
    </section>
  );
}

function StatusGauge({ value }: { value: number }) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative h-28 w-28 shrink-0">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-white/10"
        />
        <motion.circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="url(#gauge-gradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - value / 100) }}
          transition={{ duration: 1.3, ease: "easeOut", delay: 0.4 }}
        />
        <defs>
          <linearGradient id="gauge-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black leading-none">
          {value}
          <span className="text-xs text-foreground/40">%</span>
        </span>
        <span className="mt-1 text-[8px] font-semibold uppercase tracking-[0.2em] text-foreground/40">
          Saúde
        </span>
      </div>
    </div>
  );
}

function TelemetryPanel() {
  return (
    <aside
      id="telemetry"
      className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-2xl"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-foreground/60">
            Telemetria ao vivo
          </span>
        </div>
        <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-secondary">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-secondary" />
          Ativo
        </span>
      </div>

      <div className="mt-3 flex min-h-0 flex-1 flex-col gap-3">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-background/40 p-3">
          <StatusGauge value={82} />
          <div className="flex min-w-0 flex-1 flex-col justify-center">
            <div className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.2em] text-secondary">
              <Radio className="h-3 w-3" />
              Sincronizado
            </div>
            <h3 className="mt-1 truncate text-base font-black leading-tight">
              Honda Civic Touring
            </h3>
            <p className="text-[10px] text-foreground/40">ABC-1D23 · 2024</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-1.5 py-1 text-[9px] font-semibold text-foreground/60">
                <Thermometer className="h-3 w-3 text-sky-400" />
                82°C
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-1.5 py-1 text-[9px] font-semibold text-foreground/60">
                <BatteryCharging className="h-3 w-3 text-emerald-400" />
                13,8V
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-background/40 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-foreground/45">
              Diagnóstico
            </span>
            <span className="text-[9px] font-semibold text-secondary">Tudo certo</span>
          </div>
          <div className="space-y-2">
            {metrics.map((metric) => (
              <div key={metric.label}>
                <div className="mb-1 flex items-center justify-between text-[10px]">
                  <span className="flex items-center gap-1.5 text-foreground/55">
                    <metric.icon className={`h-3 w-3 ${metric.text}`} />
                    {metric.label}
                  </span>
                  <span className="font-bold text-foreground/70">{metric.value}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className={`h-full rounded-full ${metric.bar}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.value}%` }}
                    transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex min-h-0 flex-1 gap-3 [@media(max-height:720px)]:hidden">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col rounded-2xl border border-white/10 bg-background/40 p-3">
            <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.18em]">
              <span className="flex items-center gap-1.5 text-foreground/45">
                <Activity className="h-3 w-3 text-primary" />
                Consumo
              </span>
              <span className="text-secondary">-12,4%</span>
            </div>
            <svg
              viewBox="0 0 200 60"
              preserveAspectRatio="none"
              className="mt-2 min-h-0 w-full flex-1"
            >
              <defs>
                <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[15, 30, 45].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="200"
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-white/10"
                />
              ))}
              <path
                d="M0,48 L20,44 L40,46 L60,36 L80,38 L100,28 L120,32 L140,22 L160,26 L180,16 L200,18 L200,60 L0,60 Z"
                fill="url(#chart-fill)"
              />
              <motion.path
                d="M0,48 L20,44 L40,46 L60,36 L80,38 L100,28 L120,32 L140,22 L160,26 L180,16 L200,18"
                fill="none"
                stroke="#6366f1"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.6, delay: 0.6, ease: "easeOut" }}
              />
            </svg>
          </div>

          <div className="flex w-[38%] min-w-[118px] flex-col justify-between rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-3">
            <TriangleAlert className="h-4 w-4 text-amber-400" />
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-amber-400/80">
                Próxima revisão
              </p>
              <p className="mt-1 text-sm font-black leading-tight">1.240 km</p>
              <p className="text-[9px] text-foreground/40">Óleo e filtros</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function FeatureRail() {
  return (
    <section
      id="features"
      className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3"
    >
      {features.map((feature, index) => (
        <motion.div
          key={feature.title}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.35 + index * 0.08 }}
          className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 backdrop-blur-sm transition-colors hover:border-primary/30 hover:bg-primary/[0.06] [@media(max-height:560px)]:py-1.5"
        >
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-primary/20 bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
            <feature.icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold leading-tight">{feature.title}</p>
            <p className="truncate text-[9px] uppercase tracking-[0.12em] text-foreground/35">
              {feature.desc}
            </p>
          </div>
        </motion.div>
      ))}
    </section>
  );
}

export default function LandingScreen() {
  return (
    <main className="relative flex h-[100dvh] max-h-[100dvh] w-full flex-col overflow-hidden overscroll-none bg-background text-foreground">
      <TechBackground />
      <LandingHeader />

      <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-[1700px] flex-1 flex-col gap-3 px-4 py-4 [@media(max-height:560px)]:py-2 sm:px-6 lg:gap-5 lg:px-10 lg:py-6">
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
          <div className="flex min-h-0 lg:col-span-7">
            <LandingHero />
          </div>
          <div className="hidden min-h-0 lg:col-span-5 lg:flex">
            <TelemetryPanel />
          </div>
        </div>

        <FeatureRail />
      </div>
    </main>
  );
}
