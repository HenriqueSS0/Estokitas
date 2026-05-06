export const OriginStorySection = () => {
  return (
    <section className="bg-background relative w-full py-24 px-6 overflow-hidden">
      
      {/* Background patterned overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0"></div>

      <div className="max-w-[1440px] mx-auto relative z-10 bg-primary border-4 border-black rounded-[3.5rem] p-8 md:p-16 lg:p-24 shadow-[20px_20px_0px_#ccff00]">
        
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          
          {/* Header Area */}
          <div>
            <div className="inline-flex items-center gap-2 bg-black text-white font-black text-xs md:text-sm px-4 py-2 rounded-full mb-8 shadow-sm">
              ORIGEM
            </div>
            <h2
              className="font-sans font-black uppercase text-white tracking-tighter"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 5.5rem)', lineHeight: 0.9 }}
            >
              NASCEU DA <br /><span className="text-black bg-[#CCFF00] px-2 py-1 transform -rotate-1 inline-block mt-2 shadow-[4px_4px_0_#000]">ROTINA REAL</span><br /> DO COMÉRCIO.
            </h2>
          </div>

          {/* Text Content */}
          <div className="bg-white rounded-[2rem] p-8 border-4 border-black space-y-6 font-bold text-black text-sm md:text-base leading-relaxed transform lg:rotate-2 hover:rotate-0 transition-transform duration-300">
            
            <p className="text-black/80">
              O Estokitas nasceu depois que um comerciante passou exatamente por esse problema.
            </p>
            <p className="text-black/80">
              No começo, controlar o estoque no caderno funcionava. Depois vieram os erros, a confusão, a falta de produto na hora errada e o excesso do que não vendia.
            </p>
            <div className="bg-[#f8f9fa] border-l-8 border-primary pl-4 py-4 pr-4 rounded-r-xl">
              <p className="text-black font-black uppercase">
                A ideia foi clara: criar um sistema simples, rápido e direto, que qualquer lojista consiga usar sem treinamento e sem dor de cabeça.
              </p>
            </div>
            
            <div className="flex items-center gap-3 pt-4">
               <div className="w-10 h-10 border-2 border-black rounded-full bg-[#CCFF00] flex items-center justify-center font-black">
                 !
               </div>
               <p className="text-black font-black uppercase tracking-widest text-sm">
                Assim surgiu o Estokitas.
               </p>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
