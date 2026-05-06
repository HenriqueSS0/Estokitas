import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { AuthForm } from '@/components/auth/AuthForm';
import { ArrowRight } from 'lucide-react';

export const CTASection = ({ authOpen, setAuthOpen, authMode, setAuthMode }: {
  authOpen: boolean;
  setAuthOpen: (open: boolean) => void;
  authMode: 'login' | 'signup' | 'reset';
  setAuthMode: (mode: 'login' | 'signup' | 'reset') => void;
}) => {
  return (
    <section className="relative border-b border-border overflow-hidden">
      {/* Full-bleed red background block */}
      <div className="bg-primary px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-10">
            <div className="h-px w-12 bg-white/40" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/60">
              Comece Agora
            </span>
          </div>

          <h2
            className="font-sans font-bold uppercase text-white mb-10"
            style={{ fontSize: 'clamp(2.5rem, 8vw, 7rem)', lineHeight: 0.9 }}
          >
            Controle total<br />começa aqui.
          </h2>

          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <Dialog open={authOpen} onOpenChange={setAuthOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="bg-white text-primary rounded-full font-mono uppercase tracking-wider px-10 h-14 text-sm hover:bg-white/90 group"
                  onClick={() => setAuthMode('signup')}
                >
                  Criar conta grátis
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <AuthForm mode={authMode} onModeChange={setAuthMode} />
              </DialogContent>
            </Dialog>

            <div className="font-mono text-xs text-white/50 uppercase tracking-widest leading-relaxed pt-4">
              Sem cartão de crédito.<br />
              Acesso imediato.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};