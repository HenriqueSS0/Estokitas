import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  { q: 'Preciso saber mexer com sistema?', a: 'Não. O Estokitas foi feito para ser simples desde o primeiro acesso. Se você sabe usar WhatsApp, consegue usar o Estokitas.' },
  { q: 'Funciona em tempo real?', a: 'Sim. Todas as entradas e saídas são atualizadas instantaneamente no painel.' },
  { q: 'Posso usar no celular?', a: 'Sim. Funciona no celular, tablet ou computador, qualquer navegador.' },
  { q: 'Tem limite de produtos?', a: 'Não. Cadastre quantos produtos quiser sem custo adicional.' },
  { q: 'E se eu não gostar?', a: 'Sem problema. Basta não continuar. Você controla tudo.' },
];

export const FAQSection = () => {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="bg-[#F8F9FA] relative w-full py-24 px-6 border-t-4 border-black border-dashed">
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex flex-col items-center mb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-black text-white font-black text-xs md:text-sm px-4 py-2 rounded-full mb-6 uppercase tracking-widest">
            DÚVIDAS FREQUENTES
          </div>
          <h2
            className="font-sans font-black uppercase text-black"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 0.95 }}
          >
            AINDA TEM <br /><span className="text-primary">PERGUNTAS?</span>
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-[1.5rem] border-2 border-black/10 hover:border-black/50 transition-colors shadow-sm overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-6 text-left group"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span className={`font-sans font-black text-lg md:text-xl uppercase transition-colors pr-6 ${open === i ? 'text-primary' : 'text-black group-hover:text-primary'}`}>
                  {faq.q}
                </span>
                <span className={`flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${open === i ? 'border-primary bg-primary text-white rotate-180' : 'border-black text-black group-hover:bg-[#CCFF00]'}`}>
                  {open === i ? <Minus className="h-5 w-5" strokeWidth={3} /> : <Plus className="h-5 w-5" strokeWidth={3} />}
                </span>
              </button>
              {open === i && (
                <div className="px-6 pb-6 pt-2 font-bold text-black/70 leading-relaxed text-sm md:text-base border-t-2 border-black/5 mx-6 mt-2">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};