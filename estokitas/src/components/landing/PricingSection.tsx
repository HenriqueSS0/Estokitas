import { Button } from '@/components/ui/button';
import { Check, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { AuthForm } from '@/components/auth/AuthForm';

const features = [
  'Produtos ilimitados',
  'Entradas & Saídas',
  'Alertas de Estoque',
  'Acesso Mobile',
  'API de Integração',
  'Suporte incluso',
];

export const PricingSection = ({ authOpen, setAuthOpen, authMode, setAuthMode }: {
  authOpen: boolean;
  setAuthOpen: (open: boolean) => void;
  authMode: 'login' | 'signup' | 'reset';
  setAuthMode: (mode: 'login' | 'signup' | 'reset') => void;
}) => {
  return (
    <section id="planos" className="bg-background relative w-full py-24 px-6 overflow-hidden">
      
      {/* Background patterned overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col items-center mb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white text-black font-black text-xs md:text-sm px-4 py-2 rounded-full mb-6 uppercase tracking-widest border-2 border-white shadow-sm">
            PLANO ÚNICO
          </div>
          <h2
            className="font-sans font-black uppercase text-white"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', lineHeight: 0.95 }}
          >
            SIMPLES. <br /><span className="text-primary inline-block transform rotate-1">UM PLANO SÓ.</span>
          </h2>
        </div>

        {/* Pricing panel - Neo-Brutalist Layout */}
        <div className="grid lg:grid-cols-2 gap-4 md:gap-8 max-w-5xl mx-auto items-center">
          
          {/* Price block */}
          <div className="bg-primary rounded-[2.5rem] p-10 flex flex-col justify-between relative border-4 border-black shadow-[10px_10px_0px_#000] z-20 md:transform md:scale-105">
            <div className="absolute top-4 right-4 bg-[#CCFF00] text-black font-black text-[10px] px-3 py-2 rounded-xl rotate-12 border-2 border-black">
              LIVRE
            </div>
            
            <div className="relative z-10 text-white">
              <div className="font-mono text-xs uppercase tracking-widest font-black mb-4 bg-black/20 inline-block px-3 py-1 rounded-full">TUDO INCLUÍDO</div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-sans font-black" style={{ fontSize: 'clamp(4rem, 10vw, 7rem)', lineHeight: 0.9 }}>
                  GRÁTIS
                </span>
              </div>
              <p className="font-bold text-sm text-white/90 mt-4 leading-relaxed max-w-xs">
                Acesso completo ao sistema sem nenhum custo. Não pedimos cartão de crédito.
              </p>
            </div>

            <Dialog open={authOpen} onOpenChange={setAuthOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="mt-12 w-full rounded-full bg-white text-black border-2 border-black font-black uppercase tracking-wider h-16 text-base hover:bg-[#CCFF00] hover:-translate-y-1 hover:shadow-[5px_5px_0px_#000] group transition-all"
                  onClick={() => setAuthMode('signup')}
                >
                  COMEÇAR AGORA
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <AuthForm mode={authMode} onModeChange={setAuthMode} />
              </DialogContent>
            </Dialog>
          </div>

          {/* Feature list */}
          <div className="bg-white rounded-[2rem] p-10 relative border-2 border-black/10">
            <div className="font-mono text-xs uppercase tracking-widest text-black/40 font-black mb-6">O que inclui?</div>
            <ul className="space-y-4">
              {features.map((f, i) => (
                <li key={i} className="flex items-center gap-4 group/item">
                  <div className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center flex-shrink-0 bg-[#F8F9FA] group-hover/item:bg-primary transition-colors">
                    <Check className="h-4 w-4 text-black group-hover/item:text-white transition-colors" strokeWidth={3} />
                  </div>
                  <span className="font-black text-sm md:text-base text-black group-hover/item:translate-x-2 transition-transform">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
