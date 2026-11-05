"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  createUserWithEmailAndPassword, 
  updateProfile 
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Car, Mail, Lock, User, ArrowRight, AlertCircle, Home } from "lucide-react";
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
      {/* Home Button */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-8 left-8 z-20"
      >
        <Link href="/">
          <Button variant="ghost" className="gap-2 border border-zinc-800 bg-zinc-900/40 px-4 text-[10px] uppercase tracking-widest text-zinc-300 hover:bg-zinc-900">
            <Home className="w-4 h-4 text-primary" />
            <span>Voltar para Home</span>
          </Button>
        </Link>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="border border-zinc-700 bg-zinc-900 p-2">
              <Car className="h-5 w-5 text-zinc-400" />
            </div>
            <span className="text-lg font-black uppercase tracking-[0.2em] text-white">
              Carro Máximo
            </span>
          </Link>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">Crie sua conta</h1>
          <p className="text-sm text-zinc-400">Comece a gerenciar seus veículos agora mesmo</p>
        </div>

        <div className="border border-zinc-800 bg-zinc-900/40 p-8">
          {error && (
            <div className="mb-6 flex items-center gap-3 border border-red-800 bg-red-900/30 p-3 text-xs uppercase tracking-wider text-red-300">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleRegister}>
            <Input 
              label="Nome Completo"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<User className="w-5 h-5" />}
              required
            />

            <Input 
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-5 h-5" />}
              required
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
            />

            <Button 
              type="submit" 
              className="w-full py-4 text-sm" 
              isLoading={isLoading}
            >
              Criar Conta
              {!isLoading && <ArrowRight className="w-5 h-5" />}
            </Button>
          </form>
        </div>

        <p className="mt-8 text-center text-sm text-zinc-500">
          Já tem uma conta? <Link href="/login" className="font-bold uppercase tracking-widest text-white hover:underline">Entrar</Link>
        </p>
      </motion.div>
    </main>
  );
}
