"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Car, Mail, Lock, ArrowRight, AlertCircle, ChevronLeft, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Cookies from "js-cookie";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowForgotPassword(true);
    setIsLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      Cookies.set("session", token, { expires: 7 });
      router.push("/dashboard");
    } catch (err: any) {
      setError("E-mail ou senha incorretos. Tente novamente.");
      console.error(err);
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
    } catch (err: any) {
      setError("Erro ao autenticar com o Google.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-950 p-6 font-mono text-zinc-100">
      <div aria-hidden="true" className="pointer-events-none absolute -top-16 -left-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -top-10 -right-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 right-1/3 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

      {/* Home Button */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-8 left-8 z-20"
      >
        <Link href="/" aria-label="Voltar" title="Voltar" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-300 backdrop-blur transition-colors hover:bg-white/10 hover:text-white">
          <ChevronLeft className="w-5 h-5" />
        </Link>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md z-10"
      >
        <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-900/95 to-white/5 p-8 shadow-[0_25px_60px_-20px_rgba(255,255,255,0.15)] backdrop-blur md:p-10">
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-white/60 via-white/30 to-white/10" />
          <div aria-hidden="true" className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

          <div className="relative mb-8 flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.25rem] border border-white/20 bg-white text-zinc-950 shadow-lg shadow-white/10">
              <Car className="h-7 w-7 text-zinc-950" />
            </div>
            <div>
              <h1 className="flex items-center gap-2 text-3xl font-black tracking-tight text-white">
                Bem-vindo de volta
                <Sparkles className="h-5 w-5 text-white" />
              </h1>
              <p className="mt-1 text-sm text-zinc-400">Acesse sua conta para gerenciar seus veículos</p>
            </div>
          </div>

          {error && (
            <div className="relative mb-6 flex items-center gap-3 rounded-2xl border border-red-800 bg-red-900/30 p-3 text-xs uppercase tracking-wider text-red-300">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <form className="relative space-y-5" onSubmit={handleLogin}>
            <Input 
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-5 h-5" />}
              required
              className="rounded-xl bg-zinc-950/60"
            />

            <div className="space-y-1.5">
              <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Senha</label>
              <Input 
                type="password"
                showPasswordToggle
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-5 h-5" />}
                required
                className="rounded-xl bg-zinc-950/60"
              />
              {showForgotPassword && (
                <div className="pt-1 text-right">
                  <Link href="#" className="inline-block text-[10px] uppercase tracking-widest text-zinc-400 underline-offset-4 transition-colors hover:text-white hover:underline">Esqueceu a senha?</Link>
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full rounded-full bg-white py-4 text-sm text-zinc-950 shadow-lg shadow-white/10 hover:bg-zinc-200 hover:text-zinc-950" 
              isLoading={isLoading}
            >
              Entrar
              {!isLoading && <ArrowRight className="w-5 h-5" />}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-800"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zinc-900 px-4 text-[9px] font-bold uppercase tracking-widest text-zinc-600">Ou continue com</span>
            </div>
          </div>

          <div className="relative flex flex-col gap-4">
            <Button variant="outline" className="w-full rounded-full py-3 h-auto bg-white border-white text-zinc-950 hover:bg-zinc-200 hover:text-zinc-950 hover:border-zinc-300 normal-case tracking-widest" onClick={handleGoogleLogin}>
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Conectar com Google
            </Button>
          </div>

          <p className="relative mt-8 text-center text-sm text-zinc-500">
            Não tem uma conta? <Link href="/register" className="font-bold uppercase tracking-widest text-white hover:underline">Cadastre-se</Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
