"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { Car, LogOut, User, Home } from "lucide-react";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export default function Header() {
  const router = useRouter();
  const user = auth.currentUser;
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      Cookies.remove("session");
      setIsLogoutModalOpen(false);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Erro ao deslogar:", error);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 h-14 shrink-0 border-b border-zinc-800 bg-zinc-950 px-6">
        <div className="mx-auto flex h-full max-w-[1500px] items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-3">
              <Car className="h-4 w-4 text-zinc-500" />
              <span className="hidden text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400 sm:block">
                Carro Máximo
              </span>
            </Link>

            <nav className="hidden items-center gap-6 md:flex">
              <Link
                href="/dashboard"
                className="text-xs uppercase tracking-widest text-zinc-400 transition-colors hover:text-white"
              >
                Veículos
              </Link>
              <Link
                href="/dashboard/history"
                className="text-xs uppercase tracking-widest text-zinc-400 transition-colors hover:text-white"
              >
                Histórico
              </Link>
              <Link
                href="/dashboard/profile"
                className="text-xs uppercase tracking-widest text-zinc-400 transition-colors hover:text-white"
              >
                Perfil
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-zinc-400 transition-colors hover:text-white"
              >
                <Home className="h-3.5 w-3.5" />
                Tela Inicial
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-300">
                {user?.displayName || "Usuário"}
              </p>
              <p className="text-[9px] text-zinc-600">{user?.email}</p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center overflow-hidden border border-zinc-700 bg-zinc-900">
              {user?.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt={user.displayName || "Perfil"}
                  width={36}
                  height={36}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-4 w-4 text-zinc-400" />
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsLogoutModalOpen(true)}
              className="text-zinc-500 transition-colors hover:text-white"
              title="Sair"
              aria-label="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Sair da conta?"
      >
        <div className="space-y-6">
          <p className="text-sm text-zinc-400">
            Tem certeza de que deseja realmente sair da sua conta?
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsLogoutModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleLogout}>
              Sair
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
