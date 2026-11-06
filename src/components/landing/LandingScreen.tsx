"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";
import Cookies from "js-cookie";
import { auth } from "@/lib/firebase";
import {
  AlertCircle,
  Car,
  Lock,
  Mail,
  Menu,
  X,
  MapPin,
  Phone,
  CalendarDays,
  Code2,
  Smartphone,
  Building2,
  ArrowUpRight,
  Eye,
  EyeOff,
} from "lucide-react";

const backgroundImage =
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=80";

const googleIcon = (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

export default function LandingScreen() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAbout, setShowAbout] = useState(false);
  const [loggedUser, setLoggedUser] = useState<any>(null);

  useEffect(() => {
    setLoggedUser(auth.currentUser);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoggedUser(user);
    });
    return () => unsubscribe();
  }, []);

  const userDisplayName = loggedUser?.displayName || loggedUser?.email || "";

  const toggleLogin = () => {
    setError("");
    setShowLogin((open) => !open);
  };

  const closeLogin = () => {
    setShowLogin(false);
    setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      Cookies.set("session", token, { expires: 7 });
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("E-mail ou senha incorretos. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      Cookies.set("session", token, { expires: 7 });
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Erro ao autenticar com o Google.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderAboutModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
        onClick={() => setShowAbout(false)}
      />
      <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-5 text-zinc-950 shadow-2xl md:p-6" role="dialog" aria-modal="true" aria-label="Sobre a NPX Soluções Tecnológicas">
        <div className="mb-4 flex items-start justify-between gap-6">
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">Sobre nós</p>
            <h2 className="text-2xl font-black uppercase tracking-tight text-zinc-950 md:text-3xl">NPX Soluções Tecnológicas</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">
              Tecnologia para colocar ideias em movimento, com produtos digitais modernos, rápidos e preparados para crescer.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAbout(false)}
            className="border border-zinc-300 p-2 text-zinc-600 transition-colors hover:border-zinc-950 hover:bg-zinc-950 hover:text-white"
            aria-label="Fechar sobre nós"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="border border-zinc-200 bg-zinc-50 p-3">
            <div className="mb-2 flex items-center gap-2 text-zinc-950"><Building2 className="h-4 w-4 text-zinc-500" /><h3 className="text-xs font-bold uppercase tracking-widest">A empresa</h3></div>
            <p className="text-sm leading-relaxed text-zinc-600">A <strong className="text-zinc-950">NPX Soluções Tecnológicas</strong> foi fundada em <strong className="text-zinc-950">2024</strong> pelo <strong className="text-zinc-950">Johnny Alperes</strong>, com a missão de transformar desafios em produtos digitais simples, eficientes e com alto impacto.</p>
          </div>
          <div className="border border-zinc-200 bg-zinc-50 p-3">
            <div className="mb-2 flex items-center gap-2 text-zinc-950"><MapPin className="h-4 w-4 text-zinc-500" /><h3 className="text-xs font-bold uppercase tracking-widest">Sede</h3></div>
            <p className="text-sm leading-relaxed text-zinc-600">Estamos sediados em <strong className="text-zinc-950">João Pessoa – PB</strong>, atendendo clientes de todo o Brasil com comunicação direta, suporte próximo e uma visão moderna de tecnologia.</p>
          </div>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="border border-zinc-200 bg-zinc-50 p-3">
            <div className="mb-2 flex items-center gap-2 text-zinc-950"><Smartphone className="h-4 w-4 text-zinc-500" /><h3 className="text-xs font-bold uppercase tracking-widest">Mobile e web</h3></div>
            <p className="text-sm leading-relaxed text-zinc-600">Desenvolvemos <strong className="text-zinc-950">aplicações mobile e web</strong>, sistemas internos, páginas institucionais, e-commerce, automações e plataformas sob medida — do planejamento ao lançamento.</p>
          </div>
          <div className="border border-zinc-200 bg-zinc-50 p-3">
            <div className="mb-2 flex items-center gap-2 text-zinc-950"><Code2 className="h-4 w-4 text-zinc-500" /><h3 className="text-xs font-bold uppercase tracking-widest">Como trabalhamos</h3></div>
            <p className="text-sm leading-relaxed text-zinc-600">Valorizamos design, performance, segurança e experiência do usuário. Criamos produtos que unem estética, funcionalidade e escalabilidade para o seu negócio crescer.</p>
          </div>
        </div>

        <div className="mt-4 border border-zinc-200 bg-zinc-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">Fale com a NPX</p>
              <p className="text-sm leading-relaxed text-zinc-700">Vamos tirar sua ideia do papel? Receba um atendimento direto e sem burocracia.</p>
              <a href="tel:+5583998691921" className="mt-2 inline-flex items-center gap-2 border border-zinc-950 bg-zinc-950 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-zinc-800">
                <Phone className="h-3.5 w-3.5" /> (83) 99869-1921 <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
            <div className="flex items-center gap-2 text-zinc-600">
              <CalendarDays className="h-4 w-4" />
              <span className="text-xs uppercase tracking-widest">Fundada em 2024</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLoginFields = () => (
    <div className="space-y-3">
      {error && (
        <div className="flex items-center gap-2 border border-red-700 bg-red-900/40 px-3 py-2 text-[10px] uppercase tracking-wider text-red-300">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} noValidate className="space-y-3">
        <div className="relative">
          <Mail className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-600" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-zinc-700 bg-zinc-900 px-2.5 py-2.5 pl-8 text-xs text-zinc-300 outline-none transition-colors placeholder:text-zinc-600 focus:border-zinc-500"
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-600" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            aria-label="Senha"
            className="w-full border border-zinc-700 bg-zinc-900 px-2.5 py-2.5 pl-8 pr-9 text-xs text-zinc-300 outline-none transition-colors placeholder:text-zinc-600 focus:border-zinc-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            title={showPassword ? "Ocultar senha" : "Mostrar senha"}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-none p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

          <div className="text-right">
            <a href="#" data-testid="esqueceu-a-senha" onClick={(e) => e.preventDefault()} className="inline-block cursor-pointer text-xs uppercase tracking-widest text-zinc-300 underline underline-offset-4 transition-colors hover:text-white">Esqueceu a senha?</a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white py-2.5 text-xs font-bold uppercase tracking-widest text-zinc-950 transition-all hover:bg-zinc-200 disabled:opacity-50"
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-zinc-800" />
        </div>
        <div className="relative flex justify-center text-[9px] uppercase tracking-widest">
          <span className="bg-zinc-950 px-3 text-zinc-600">Ou continue com</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 border border-white bg-white py-2.5 text-xs font-bold tracking-widest text-zinc-950 transition-all hover:bg-zinc-200 hover:text-zinc-950 hover:border-zinc-300 disabled:opacity-50"
      >
        {googleIcon}
        Conectar com Google
      </button>

      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={closeLogin}
          className="text-[10px] uppercase tracking-widest text-zinc-600 transition-colors hover:text-zinc-400"
        >
          ← Voltar
        </button>
        <Link
          href="/register"
          className="text-[10px] uppercase tracking-widest text-zinc-500 transition-colors hover:text-white"
        >
          Cadastrar-se
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {showAbout && renderAboutModal()}
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-zinc-950 font-mono text-white antialiased selection:bg-zinc-700">
      <div className="absolute inset-0">
        <div
          className="h-full w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      </div>
      <div className="absolute inset-0 bg-zinc-950/70" />

      <header className="relative z-20 flex h-14 shrink-0 items-center justify-between border-b border-zinc-800 px-6">
        <Link href="/" className="flex items-center gap-3">
          <Car className="h-4 w-4 text-zinc-500" />
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
            Carro Máximo
          </span>
        </Link>

        <nav className="hidden items-center gap-3 md:flex">
          <Link
            href="/register"
            className="text-xs uppercase tracking-widest text-zinc-300 transition-colors hover:text-white"
          >
            Cadastrar
          </Link>
          {loggedUser ? (
            <Link
              href="/dashboard"
              className="max-w-44 truncate bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-zinc-950 transition-all hover:bg-zinc-200"
              title="Ir para o Dashboard"
            >
              {userDisplayName}
            </Link>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={toggleLogin}
                className="bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-zinc-950 transition-all hover:bg-zinc-200"
              >
                {showLogin ? "Fechar" : "Entrar"}
              </button>

              {showLogin && (
                <div className="absolute right-0 top-full z-30 mt-3 w-80 border border-zinc-800 bg-zinc-950 p-5 shadow-2xl">
                  {renderLoginFields()}
                </div>
              )}
            </div>
          )}
        </nav>

        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="text-zinc-500 transition-colors hover:text-white md:hidden"
          aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
        >
          {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </header>

      {isMenuOpen && (
        <div className="relative z-20 space-y-3 border-b border-zinc-800 bg-zinc-950 px-6 py-4 md:hidden">
          <Link
            href="/register"
            onClick={() => setIsMenuOpen(false)}
            className="block text-xs uppercase tracking-widest text-zinc-300"
          >
            Cadastrar
          </Link>
          {loggedUser ? (
            <Link
              href="/dashboard"
              onClick={() => setIsMenuOpen(false)}
              className="block truncate bg-white px-4 py-2 text-center text-xs font-bold uppercase tracking-widest text-zinc-950"
              title="Ir para o Dashboard"
            >
              {userDisplayName}
            </Link>
          ) : (
            <>
              <button
                type="button"
                onClick={toggleLogin}
                className="block w-full bg-white px-4 py-2 text-center text-xs font-bold uppercase tracking-widest text-zinc-950"
              >
                {showLogin ? "Fechar" : "Entrar"}
              </button>
              {showLogin && (
                <div className="border border-zinc-800 bg-zinc-950 p-4">
                  {renderLoginFields()}
                </div>
              )}
            </>
          )}
        </div>
      )}

      <main className="relative z-10 flex flex-1 items-center justify-center p-6">
        <div className="space-y-6 text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-zinc-300">
            Gestão Automotiva Inteligente
          </span>

          <h1 className="text-4xl font-black leading-[0.85] tracking-tighter text-white md:text-7xl">
            SEU
            <br />
            <span className="text-zinc-500">VEÍCULO</span>
            <br />
            NO CONTROLE
          </h1>

          <p className="mx-auto max-w-lg text-base leading-relaxed text-zinc-300 md:text-lg">
            Manutenção, combustível, custos e alertas em um só lugar.
            Controle total do seu veículo em tempo real.
          </p>

          <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row">
            <Link
              href="/register"
              className="bg-white px-8 py-4 text-base font-bold uppercase tracking-widest text-zinc-950 transition-all hover:bg-zinc-200"
            >
              Cadastrar-se
            </Link>
            <button
              type="button"
              onClick={() => setShowAbout(true)}
              className="border border-zinc-600 px-8 py-4 text-base font-bold uppercase tracking-widest text-zinc-300 transition-all hover:border-zinc-500 hover:text-white"
            >
              Sobre nós
            </button>
          </div>
        </div>
      </main>

      <footer className="relative z-10 flex h-12 items-center border-t border-zinc-800 px-6 text-[9px] uppercase tracking-[0.15em] text-zinc-700">
        <span>&copy; 2026 — Carro Máximo</span>
      </footer>
    </div>
    </>
  );
}
