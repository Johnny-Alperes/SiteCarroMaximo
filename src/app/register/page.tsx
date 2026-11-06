"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  createUserWithEmailAndPassword, 
  updateProfile 
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Car, Mail, Lock, User, ArrowRight, AlertCircle, ChevronLeft, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Cookies from "js-cookie";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      const token = await userCredential.user.getIdToken();
      Cookies.set("session", token, { expires: 7 });
      router.push("/dashboard");
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setError("Este e-mail já está em uso.");
      } else {
        setError("Erro ao criar conta. Tente novamente.");
      }
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
              <h1 className="flex items-center gap-2 text-3xl font-black uppercase tracking-tight text-white">
                Crie sua conta
                <Sparkles className="h-5 w-5 text-white" />
              </h1>
              <p className="mt-1 text-sm text-zinc-400">Comece a gerenciar seus veículos agora mesmo</p>
            </div>
          </div>

          {error && (
            <div className="relative mb-6 flex items-center gap-3 rounded-2xl border border-red-800 bg-red-900/30 p-3 text-xs uppercase tracking-wider text-red-300">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <form className="relative space-y-5" onSubmit={handleRegister}>
            <Input 
              label="Nome Completo"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<User className="w-5 h-5" />}
              required
              className="rounded-xl bg-zinc-950/60"
            />

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

            <Input 
              label="Senha"
              type="password"
              showPasswordToggle
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-5 h-5" />}
              required
              className="rounded-xl bg-zinc-950/60"
            />

            <Input 
              label="Confirmar Senha"
              type="password"
              showPasswordToggle
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Lock className="w-5 h-5" />}
              required
              className="rounded-xl bg-zinc-950/60"
            />

            <Button 
              type="submit" 
              className="w-full rounded-full bg-white py-4 text-sm text-zinc-950 shadow-lg shadow-white/10 hover:bg-zinc-200 hover:text-zinc-950" 
              isLoading={isLoading}
            >
              Criar Conta
              {!isLoading && <ArrowRight className="w-5 h-5" />}
            </Button>
          </form>

          <p className="relative mt-8 text-center text-sm text-zinc-500">
            Já tem uma conta? <Link href="/login" className="font-bold uppercase tracking-widest text-white hover:underline">Entrar</Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
