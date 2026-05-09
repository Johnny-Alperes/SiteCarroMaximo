import Link from "next/link";
import { Car, Mail, Globe, Share2, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Col */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="bg-primary p-2 rounded-xl">
                <Car className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gradient">
                Carro Máximo
              </span>
            </Link>
            <p className="text-foreground/60 text-sm leading-relaxed mb-6">
              Transformando a forma como você cuida do seu veículo. 
              Gestão inteligente, economia real e controle total na palma da sua mão.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="p-2 rounded-full bg-white/5 hover:bg-primary/20 hover:text-primary transition-all">
                <Globe className="w-5 h-5" />
              </Link>
              <Link href="#" className="p-2 rounded-full bg-white/5 hover:bg-primary/20 hover:text-primary transition-all">
                <Share2 className="w-5 h-5" />
              </Link>
              <Link href="#" className="p-2 rounded-full bg-white/5 hover:bg-primary/20 hover:text-primary transition-all">
                <MessageCircle className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Links Col 1 */}
          <div>
            <h4 className="font-bold mb-6">Produto</h4>
            <ul className="space-y-4 text-sm text-foreground/60">
              <li><Link href="#features" className="hover:text-primary transition-colors">Funcionalidades</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Segurança</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Preços</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Roadmap</Link></li>
            </ul>
          </div>

          {/* Links Col 2 */}
          <div>
            <h4 className="font-bold mb-6">Empresa</h4>
            <ul className="space-y-4 text-sm text-foreground/60">
              <li><Link href="#" className="hover:text-primary transition-colors">Sobre Nós</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Carreiras</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Contato</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-bold mb-6">Novidades</h4>
            <p className="text-sm text-foreground/60 mb-4">
              Receba dicas de manutenção e economia diretamente no seu e-mail.
            </p>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
              <input 
                type="email" 
                placeholder="Seu melhor e-mail"
                className="w-full bg-white/5 border border-border rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-primary/50 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-foreground/40">
          <p>© 2026 Carro Máximo. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-primary">Termos de Uso</Link>
            <Link href="#" className="hover:text-primary">Privacidade</Link>
            <Link href="#" className="hover:text-primary">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
