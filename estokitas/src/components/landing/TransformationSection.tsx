const before = [
  'Trabalhar no escuro',
  'Confiar na memória',
  'Perder tempo com planilhas',
  'Perder dinheiro com erro de estoque',
];
const after = [
  'Ver tudo organizado em um só lugar',
  'Saber exatamente o que tem para vender',
  'Receber aviso quando algo está acabando',
  'Ter mais controle e menos estresse',
];

export const TransformationSection = () => {
  return (
    <section className="bg-background relative w-full py-24 px-6 overflow-hidden">
      
      {/* Background patterned overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0"></div>

      <div className="max-w-[1440px] mx-auto relative z-10">
        
        <div className="flex flex-col items-center mb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white text-black font-black text-xs md:text-sm px-4 py-2 rounded-full mb-6 uppercase tracking-widest shadow-sm">
            MUDANÇA REAL
          </div>
          <h2
            className="font-sans font-black uppercase text-white"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 0.95 }}
          >
            A DIFERENÇA <br /><span className="text-primary inline-block transform rotate-2">É IMEDIATA.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
          
          {/* Before - Red Card */}
          <div className="bg-[#FF3333] text-white rounded-[2rem] p-8 md:p-12 border-4 border-black shadow-[10px_10px_0px_#000] rotate-[-1deg] hover:rotate-0 transition-transform">
            <div className="bg-black text-white font-black text-xs md:text-sm px-4 py-2 rounded-full inline-block mb-6 uppercase tracking-widest outline outline-2 outline-white outline-offset-2">
              COMO É HOJE:
            </div>
            <ul className="space-y-6">
              {before.map((item, i) => (
                <li key={i} className="flex items-center gap-4 bg-black/20 p-4 rounded-2xl border-2 border-black/40">
                  <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center flex-shrink-0 text-white font-black text-lg">
                    ×
                  </div>
                  <span className="font-bold text-lg leading-tight">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* After - Lime Card */}
          <div className="bg-[#CCFF00] text-black rounded-[2rem] p-8 md:p-12 border-4 border-black shadow-[10px_10px_0px_#000] rotate-[1deg] hover:rotate-0 transition-transform">
            <div className="bg-black text-white font-black text-xs md:text-sm px-4 py-2 rounded-full inline-block mb-6 uppercase tracking-widest outline outline-2 outline-black outline-offset-2">
              COM O ESTOKITAS:
            </div>
            <ul className="space-y-6">
              {after.map((item, i) => (
                <li key={i} className="flex items-center gap-4 bg-white/60 p-4 rounded-2xl border-2 border-black/20">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-white font-black text-lg">
                    ✓
                  </div>
                  <span className="font-bold text-lg leading-tight">{item}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
};
