export const RiskFreeSection = () => {
  return (
    <section className="border-b border-border">
      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 border-2 border-primary flex items-center justify-center flex-shrink-0">
            <span className="text-primary font-bold text-xl">✓</span>
          </div>
          <div>
            <div className="font-sans font-bold uppercase text-foreground tracking-tight text-lg">Sem risco</div>
            <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest mt-0.5">Acesso gratuito</div>
          </div>
        </div>

        <div className="font-mono text-sm text-muted-foreground max-w-md text-center md:text-right leading-relaxed">
          Você não perde nada testando. Mas pode ganhar{' '}
          <span className="text-foreground font-medium">tempo, organização e tranquilidade.</span>
        </div>
      </div>
    </section>
  );
};
