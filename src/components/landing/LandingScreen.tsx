"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
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
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modoRecuperacao, setModoRecuperacao] = useState(false);
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
    setSuccess("");
    setModoRecuperacao(false);
    setShowLogin((open) => !open);
  };

  const closeLogin = () => {
    setShowLogin(false);
    setError("");
    setSuccess("");
    setModoRecuperacao(false);
  };

  const abrirRecuperacaoSenha = (e: React.MouseEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setModoRecuperacao(true);
  };

  const voltarParaLogin = () => {
    setError("");
    setSuccess("");
    setModoRecuperacao(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Informe seu e-mail para recuperar a senha.");
      return;
    }

    const destino = email.trim();
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, destino);
      setSuccess(`Enviamos um link de recuperação para ${destino}. Verifique a caixa de entrada e o spam.`);
      setEmail("");
      setModoRecuperacao(false);
    } catch (err: any) {
      console.error(err);
      const code = err?.code;
      if (code === "auth/invalid-email") {
        setError("E-mail inválido. Verifique e tente novamente.");
      } else if (code === "auth/user-not-found") {
        setError("Não encontramos uma conta com esse e-mail.");
      } else if (code === "auth/too-many-requests") {
        setError("Muitas tentativas. Aguarde alguns minutos e tente novamente.");
      } else if (code === "auth/network-request-failed") {
        setError("Falha de conexão. Verifique sua internet e tente novamente.");
      } else {
        setError("Não foi possível enviar o e-mail de recuperação. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
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
      <div className="relative z-10 max-h-[92vh] w-full max-w-xl overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-900/95 to-white/5 p-4 text-white shadow-[0_25px_60px_-20px_rgba(255,255,255,0.15)] backdrop-blur md:p-5" role="dialog" aria-modal="true" aria-label="Sobre a NPX Soluções Tecnológicas">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-white/60 via-white/30 to-white/10" />
        <div aria-hidden="true" className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <button
          type="button"
          onClick={() => setShowAbout(false)}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-white text-zinc-950 shadow-lg shadow-white/10 transition-colors hover:bg-zinc-200"
          aria-label="Fechar sobre nós"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <div className="relative space-y-3">
          <div className="px-8 text-center">
            <p className="mb-1 text-[9px] font-bold tracking-[0.3em] text-zinc-500">Sobre nós</p>
            <h2 className="text-xl font-black tracking-tight text-white md:text-2xl">NPX Soluções Tecnológicas</h2>
            <p className="mt-1 text-xs leading-snug text-zinc-400">
              Tecnologia para colocar ideias em movimento, com produtos digitais modernos, rápidos e preparados para crescer.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur">
              <div className="mb-1.5 flex items-center gap-2 text-white">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white text-zinc-950 shadow-lg shadow-white/10">
                  <Building2 className="h-3.5 w-3.5" />
                </span>
                <h3 className="text-[11px] font-bold tracking-wider text-zinc-300">A empresa</h3>
              </div>
              <p className="text-xs leading-snug text-zinc-400">A <strong className="text-white">NPX Soluções Tecnológicas</strong> foi fundada em <strong className="text-white">2024</strong> pelo <strong className="text-white">Johnny Alperes</strong>, com a missão de transformar desafios em produtos digitais simples, eficientes e com alto impacto.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur">
              <div className="mb-1.5 flex items-center gap-2 text-white">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white text-zinc-950 shadow-lg shadow-white/10">
                  <MapPin className="h-3.5 w-3.5" />
                </span>
                <h3 className="text-[11px] font-bold tracking-wider text-zinc-300">Sede</h3>
              </div>
              <p className="text-xs leading-snug text-zinc-400">Estamos sediados em <strong className="text-white">João Pessoa – PB</strong>, atendendo clientes de todo o Brasil com comunicação direta, suporte próximo e uma visão moderna de tecnologia.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur">
              <div className="mb-1.5 flex items-center gap-2 text-white">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white text-zinc-950 shadow-lg shadow-white/10">
                  <Smartphone className="h-3.5 w-3.5" />
                </span>
                <h3 className="text-[11px] font-bold tracking-wider text-zinc-300">Mobile e web</h3>
              </div>
              <p className="text-xs leading-snug text-zinc-400">Desenvolvemos <strong className="text-white">aplicações mobile e web</strong>, sistemas internos, páginas institucionais, e-commerce, automações e plataformas sob medida — do planejamento ao lançamento.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur">
              <div className="mb-1.5 flex items-center gap-2 text-white">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white text-zinc-950 shadow-lg shadow-white/10">
                  <Code2 className="h-3.5 w-3.5" />
                </span>
                <h3 className="text-[11px] font-bold tracking-wider text-zinc-300">Como trabalhamos</h3>
              </div>
              <p className="text-xs leading-snug text-zinc-400">Valorizamos design, performance, segurança e experiência do usuário. Criamos produtos que unem estética, funcionalidade e escalabilidade para o seu negócio crescer.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center backdrop-blur">
            <p className="mb-1 text-[9px] font-bold tracking-[0.3em] text-zinc-500">Fale com a NPX</p>
            <p className="text-xs leading-snug text-zinc-400">Vamos tirar sua ideia do papel? Receba um atendimento direto e sem burocracia.</p>
            <a href="tel:+5583998691921" className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white px-3 py-1.5 text-[11px] font-bold tracking-widest text-zinc-950 shadow-lg shadow-white/10 transition-colors hover:bg-zinc-200">
              <Phone className="h-3 w-3" /> (83) 99869-1921 <ArrowUpRight className="h-3 w-3" />
            </a>
            <div className="mt-2 flex items-center justify-center gap-2 text-zinc-500">
              <CalendarDays className="h-3.5 w-3.5" />
              <span className="text-[10px] tracking-widest">Fundada em 2024</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLoginFields = () => (
    <div className="relative w-80 max-w-[calc(100vw-3rem)] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-900/95 to-white/5 p-5 shadow-[0_25px_60px_-20px_rgba(255,255,255,0.15)] backdrop-blur">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-white/60 via-white/30 to-white/10" />
      <div aria-hidden="true" className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

      <div className="relative mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white text-zinc-950 shadow-lg shadow-white/10">
          <Car className="h-5 w-5 text-zinc-950" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="flex items-center gap-2 text-base font-black tracking-tight text-white">
            Bem-vindo!
            <Sparkles className="h-4 w-4 shrink-0 text-white" />
          </h2>
          <p className="mt-0.5 text-[11px] text-zinc-400">Acesse sua conta para gerenciar seus veículos</p>
        </div>
      </div>

      {error && (
        <div className="relative mb-3 flex items-center gap-2 rounded-xl border border-red-800 bg-red-900/30 p-2.5 text-[10px] uppercase tracking-wider text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="relative mb-3 flex items-center gap-2 rounded-xl border border-emerald-800 bg-emerald-900/30 p-2.5 text-[10px] uppercase tracking-wider text-emerald-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {success}
        </div>
      )}

      <form onSubmit={modoRecuperacao ? handleForgotPassword : handleLogin} noValidate className="relative space-y-3">
        <Input
          label="E-mail"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="w-4 h-4" />}
          required
          className="h-10 rounded-xl bg-zinc-950/60 text-xs"
        />

        {!modoRecuperacao && (
          <div className="space-y-1.5">
            <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Senha</label>
            <Input
              type="password"
              showPasswordToggle
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              required
              className="h-10 rounded-xl bg-zinc-950/60 text-xs"
            />
            <div className="pt-0.5 text-right">
              <a href="#" data-testid="esqueceu-a-senha" onClick={abrirRecuperacaoSenha} className="inline-block cursor-pointer text-[10px] tracking-wide text-zinc-500 transition-colors hover:text-zinc-300">Esqueceu a senha?</a>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-white py-3 text-xs font-bold uppercase tracking-widest text-zinc-950 shadow-lg shadow-white/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-600 hover:text-white hover:shadow-blue-500/40 active:translate-y-0 disabled:opacity-50"
        >
          {modoRecuperacao ? (isLoading ? "Enviando..." : "Enviar") : (isLoading ? "Entrando..." : "Entrar")}
          {!isLoading && <ArrowRight className="w-4 h-4" />}
        </button>

        {modoRecuperacao && (
          <button
            type="button"
            onClick={voltarParaLogin}
            className="relative w-full text-center text-[11px] tracking-wide text-zinc-500 transition-colors hover:text-zinc-300"
          >
            Voltar para o login
          </button>
        )}
      </form>

      {!modoRecuperacao && (
        <>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-[9px] uppercase tracking-widest">
              <span className="bg-zinc-900 px-3 text-zinc-600">Ou continue com</span>
            </div>
          </div>

          <div className="relative flex flex-col gap-3">
            <Button
              variant="outline"
              className="w-full rounded-full py-2.5 h-auto text-xs bg-white border-white text-zinc-950 hover:bg-zinc-200 hover:text-zinc-950 hover:border-zinc-300 normal-case tracking-widest"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              {googleIcon}
              Conectar com Google
            </Button>
          </div>

          <div className="relative mt-4 flex items-center justify-between">
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
        </>
      )}
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
                <div className="absolute right-0 top-full z-30 mt-3">
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
                <div className="pt-1">
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
