import { Package, ArrowRightLeft, Smartphone, Bell, FolderOpen, Code2 } from 'lucide-react';

const benefits = [
  { icon: Package, idx: '01', title: 'Cadastro Rápido', description: 'Sem formulários complexos. Cadastre em poucos cliques.' },
  { icon: ArrowRightLeft, idx: '02', title: 'Entradas & Saídas', description: 'Fluxo contínuo instantâneo com histórico completo.' },
  { icon: Smartphone, idx: '03', title: 'Multi-device', description: 'Acesse do celular, tablet ou computador na hora.' },
  { icon: Bell, idx: '04', title: 'Alertas Inteligentes', description: 'Notificação automática antes de o estoque zerar.' },
  { icon: FolderOpen, idx: '05', title: 'Centralizado', description: 'Fim das planilhas quebradas e papéis avulsos.' },
  { icon: Code2, idx: '06', title: 'Integração API', description: 'Conecte à sua loja virtual ou PDV facilmente.' },
];

export const BenefitsSection = () => {
  return (
    <section id="beneficios" className="bg-background relative w-full pt-8 pb-32 px-6 overflow-hidden">
      
      {/* Decorative large backdrop piece (simulating the round white container from the example) */}
      <div className="max-w-[1440px] mx-auto bg-white text-black rounded-[2.5rem] md:rounded-[3.5rem] px-6 py-16 md:px-10 md:py-24 relative z-20 shadow-[0_-20px_50px_rgba(0,0,0,0.2)]">
        
        <div className="flex flex-col items-center mb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-primary text-white font-black text-xs md:text-sm px-4 py-2 rounded-full mb-6 shadow-sm border-2 border-primary">
            FUNCIONALIDADES
          </div>
          <h2 className="font-sans font-black uppercase text-black"
            style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', lineHeight: 0.95 }}>
            O SEU ESTOQUE <br /><span className="text-primary">SEMPRE NA MÃO</span>
          </h2>
        </div>

        {/* The neo-brutalist grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {benefits.map((b) => (
            <div
              key={b.idx}
              className="bg-[#F8F9FA] rounded-[2rem] p-8 flex flex-col items-center text-center relative min-h-64 border-2 border-gray-100 hover:border-black/10 hover:shadow-xl transition-all duration-300"
            >
              <h3 className="text-xl md:text-2xl uppercase leading-tight mb-2 font-black text-black mt-2">
                {b.title}
              </h3>
              <p className="text-[11px] md:text-sm text-black/60 font-bold mb-auto">
                {b.description}
              </p>
              
              {/* Colorful Icon Pill Graphic */}
              <div className="relative w-full flex justify-center mt-8">
                <div className="flex items-center bg-background rounded-2xl p-2 pr-16 text-white shadow-lg relative z-10 w-full max-w-[220px]">
                  <div className="w-10 h-10 bg-primary rounded-full mr-3 border-2 border-white flex items-center justify-center flex-shrink-0">
                    <b.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-[12px] font-black leading-none uppercase tracking-wider">Módulo {b.idx}</p>
                    <p className="text-[9px] text-white/70 leading-none mt-1 font-bold">Ativo em tempo real</p>
                  </div>
                </div>
                {/* Accent mini pill */}
                <div className="absolute right-[-10px] top-1/2 transform -translate-y-1/2 bg-primary text-white font-black text-[10px] px-3 py-2 rounded-xl z-20 shadow-md rotate-3">
                  ✓
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};