import { Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sebastião B.',
    role: 'Dono de Bazar',
    quote: 'Antes tudo ficava num caderno e era fácil se perder. Agora sei exatamente o que tenho. Economizou meu tempo e muita dor de cabeça.',
    color: 'bg-[#CCFF00] text-black',
    rotate: 'md:rotate-[-2deg]'
  },
  {
    name: 'Maria Clara S.',
    role: 'Loja de Roupas',
    quote: 'Recebo alerta quando produto tá acabando. Nunca mais perdi venda por falta de estoque. Mudou com-pletamente minha rotina.',
    color: 'bg-white text-black',
    rotate: 'md:rotate-[2deg]'
  },
  {
    name: 'João Pedro M.',
    role: 'Distribuidora',
    quote: 'Vivia comprando produto demais ou de menos. Agora sei exatamente quanto tenho de cada coisa. Parei de ter dinheiro parado em estoque.',
    color: 'bg-primary text-white',
    rotate: 'rotate-0'
  },
];

export const SocialProofSection = () => {
  return (
    <section className="bg-white relative w-full py-24 px-6 border-b-4 border-black">
      
      {/* Background patterned overlay (light) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0"></div>

      <div className="max-w-[1440px] mx-auto relative z-10">
        
        <div className="flex flex-col items-center mb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-black text-white font-black text-xs md:text-sm px-4 py-2 rounded-full mb-6 uppercase tracking-widest shadow-sm">
            QUEM USA APROVA
          </div>
          <h2
            className="font-sans font-black uppercase text-black"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 0.95 }}
          >
            QUEM JÁ USA, <br /><span className="text-primary inline-block transform -rotate-1 shadow-[4px_4px_0_#000] bg-white border-2 border-black ml-2 px-2">NÃO VOLTA.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch justify-center">
          
          {testimonials.map((t, i) => (
            <div key={i} className={`${t.color} rounded-[2rem] p-8 border-4 border-black shadow-[8px_8px_0px_#000] ${t.rotate} hover:rotate-0 hover:-translate-y-2 transition-all duration-300 flex flex-col`}>
              <div className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center mb-6 bg-black">
                <Quote className="h-6 w-6 text-white" />
              </div>
              <p className="font-bold text-lg md:text-xl leading-relaxed mb-auto">
                "{t.quote}"
              </p>
              
              <div className="mt-8 pt-6 border-t-[3px] border-black/10 flex items-center justify-between">
                <div>
                  <div className="font-sans font-black uppercase text-xl leading-none">
                    {t.name}
                  </div>
                  <div className="font-mono text-xs uppercase tracking-widest font-bold opacity-70 mt-1">
                    {t.role}
                  </div>
                </div>
              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
};
