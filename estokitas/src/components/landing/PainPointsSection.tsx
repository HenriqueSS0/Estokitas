const painPoints = [
  { idx: '01', text: 'Perdeu venda porque achou que tinha produto no estoque?' },
  { idx: '02', text: 'Comprou mercadoria demais e ficou com dinheiro parado?' },
  { idx: '03', text: 'Usa caderno ou planilha e mesmo assim vive confuso?' },
  { idx: '04', text: 'Não sabe exatamente quanto tem de cada produto estocado?' },
];

export const PainPointsSection = () => {
  return (
    <section className="bg-white py-24 px-6 relative w-full border-b-[3px] border-black/5">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Typo Side */}
        <div>
          <div className="inline-flex items-center gap-2 bg-black text-white font-black text-xs md:text-sm px-4 py-2 rounded-full mb-6 uppercase tracking-widest">
            PROBLEMAS REAIS
          </div>
          <h2 className="font-sans font-black uppercase text-black mb-8"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', lineHeight: 0.95 }}>
            VOCÊ SE <span className="text-primary inline-block transform -rotate-2">IDENTIFICA</span><br />COM ISSO?
          </h2>
          <div className="mt-8">
            <p className="font-bold text-black/60 text-lg md:text-xl leading-relaxed max-w-md">
              Isso não é falta de capacidade.{' '}
              <span className="text-black bg-[#CCFF00] px-2 font-black">É falta da ferramenta certa.</span>
            </p>
          </div>
        </div>

        {/* List Side */}
        <div className="flex flex-col gap-4">
          {painPoints.map((point) => (
            <div
              key={point.idx}
              className="bg-[#F8F9FA] rounded-[1.5rem] p-6 flex flex-row items-center gap-6 border-2 border-gray-100 hover:border-black/20 hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="flex-shrink-0 w-16 h-16 bg-primary text-white rounded-[1rem] flex items-center justify-center font-black text-2xl rotate-3">
                {point.idx}
              </div>
              <p className="font-bold text-black text-base md:text-lg leading-snug">
                {point.text}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
