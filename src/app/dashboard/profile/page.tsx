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
import { User, Mail, Lock, Trash2, Shield, BarChart2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useRouter } from "next/navigation";
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
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
        <p className="text-foreground/60">Gerencie suas informações pessoais e segurança.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar / Stats */}
        <div className="space-y-6">
          <Card className="p-8 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
              <User className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-bold">{user?.displayName || "Usuário"}</h2>
            <p className="text-sm text-foreground/40 mb-6">{user?.email}</p>
            <div className="pt-6 border-t border-border grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-foreground/40 font-bold uppercase">Veículos</p>
                <p className="text-xl font-bold text-primary">{stats.vehicles}</p>
              </div>
              <div>
                <p className="text-xs text-foreground/40 font-bold uppercase">Gastos</p>
                <p className="text-xl font-bold text-primary">R$ 12k</p>
              </div>
            </div>
          </Card>

          <Button 
            variant="outline" 
            className="w-full text-red-500 border-red-500/20 hover:bg-red-500/5"
            onClick={handleDeleteAccount}
          >
            <Trash2 className="w-4 h-4" />
            Excluir Conta
          </Button>
        </div>

        {/* Main Forms */}
        <div className="md:col-span-2 space-y-8">
          <Card className="p-8">
            <div className="flex items-center gap-2 mb-6">
              <User className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold">Informações Pessoais</h3>
            </div>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <Input 
                label="Nome Completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={<User className="w-5 h-5" />}
              />
              <Input 
                label="E-mail"
                value={user?.email || ""}
                disabled
                icon={<Mail className="w-5 h-5" />}
              />
              <Button type="submit" isLoading={loading}>Salvar Alterações</Button>
            </form>
          </Card>

          <Card className="p-8">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold">Segurança</h3>
            </div>
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <Input 
                label="Nova Senha"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-5 h-5" />}
              />
              <Button type="submit" variant="secondary" isLoading={loading} disabled={!password}>
                Alterar Senha
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
