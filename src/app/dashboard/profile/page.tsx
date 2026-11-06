"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { 
  updateProfile, 
  updatePassword, 
  deleteUser,
  onAuthStateChanged
} from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { User, Mail, Lock, Trash2, Shield, Settings, Sparkles, Save } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [stats, setStats] = useState({ vehicles: 0, totalSpent: 0 });
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        setName(u.displayName || "");
        
        // Fetch stats
        const vSnap = await getDocs(collection(db, `users/${u.uid}/vehicles`));
        setStats({ 
          vehicles: vSnap.size, 
          totalSpent: 12500 // Mockup for now
        });
      }
    });
    return () => unsub();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (user) {
        await updateProfile(user, { displayName: name });
        alert("Perfil atualizado!");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar perfil.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (user && password) {
        await updatePassword(user, password);
        alert("Senha atualizada!");
        setPassword("");
      }
    } catch (error: any) {
      if (error.code === "auth/requires-recent-login") {
         alert("Esta operação exige login recente. Por favor, saia e entre novamente.");
      } else {
         console.error(error);
         alert("Erro ao atualizar senha.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm("TEM CERTEZA? Esta ação não pode ser desfeita e todos os seus dados de veículos serão apagados.")) {
      try {
        if (user) {
          await deleteUser(user);
          Cookies.remove("session");
          router.push("/login");
        }
      } catch (error) {
        alert("Erro ao excluir conta. Faça login novamente para confirmar.");
      }
    }
  };

  return (
    <div className="relative mx-auto max-w-4xl py-4">
      <div aria-hidden="true" className="pointer-events-none absolute -top-16 -left-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -top-10 -right-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 right-1/3 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

      <Card className="relative overflow-hidden rounded-[1.75rem] border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-900/95 to-white/5 p-8 shadow-[0_25px_60px_-20px_rgba(255,255,255,0.15)] backdrop-blur md:p-10">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-white/60 via-white/30 to-white/10" />
        <div aria-hidden="true" className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

        <div className="relative mb-8 flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.25rem] border border-white/20 bg-white text-zinc-950 shadow-lg shadow-white/10">
            <Settings className="h-7 w-7 text-zinc-950" />
          </div>
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-black uppercase tracking-tight text-white">
              Configurações
              <Sparkles className="h-5 w-5 text-white" />
            </h1>
            <p className="mt-1 text-sm text-zinc-400">Gerencie suas informações pessoais e segurança.</p>
          </div>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar / Stats */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-6 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[1.25rem] border border-white/20 bg-white text-zinc-950 shadow-lg shadow-white/10">
                <User className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold text-white">{user?.displayName || "Usuário"}</h2>
              <p className="text-sm text-zinc-400 mb-6">{user?.email}</p>
              <div className="pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Veículos</p>
                  <p className="text-xl font-bold text-white">{stats.vehicles}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Gastos</p>
                  <p className="text-xl font-bold text-white">R$ 12k</p>
                </div>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full rounded-full border-red-500/20 py-3 text-red-500 hover:bg-red-500/5"
              onClick={handleDeleteAccount}
            >
              <Trash2 className="w-4 h-4" />
              Excluir Conta
            </Button>
          </div>

          {/* Main Forms */}
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-6">
              <div className="flex items-center gap-2 mb-6">
                <User className="w-5 h-5 text-white" />
                <h3 className="text-lg font-bold text-white">Informações Pessoais</h3>
              </div>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <Input 
                  label="Nome Completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  icon={<User className="w-5 h-5" />}
                  className="rounded-xl bg-zinc-950/60"
                />
                <Input 
                  label="E-mail"
                  value={user?.email || ""}
                  disabled
                  icon={<Mail className="w-5 h-5" />}
                  className="rounded-xl bg-zinc-950/60"
                />
                <Button type="submit" isLoading={loading} className="w-full rounded-full py-3">
                  <Save className="w-4 h-4" />
                  Salvar Alterações
                </Button>
              </form>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Shield className="w-5 h-5 text-white" />
                <h3 className="text-lg font-bold text-white">Segurança</h3>
              </div>
              <form onSubmit={handleUpdatePassword} className="space-y-6">
                <Input 
                  label="Nova Senha"
                  type="password"
                  showPasswordToggle
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock className="w-5 h-5" />}
                  className="rounded-xl bg-zinc-950/60"
                />
                <Button type="submit" variant="secondary" isLoading={loading} disabled={!password} className="w-full rounded-full py-3">
                  Alterar Senha
                </Button>
              </form>
            </div>

            <Link href="/dashboard" className="block">
              <Button variant="outline" type="button" className="w-full rounded-full py-3">
                Cancelar
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
