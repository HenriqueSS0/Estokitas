import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { VibrantHeroSection } from '@/components/landing/VibrantHeroSection';
import { PageLoader } from '@/components/landing/PageLoader';
import { PainPointsSection } from '@/components/landing/PainPointsSection';
import { OriginStorySection } from '@/components/landing/OriginStorySection';
import { TransformationSection } from '@/components/landing/TransformationSection';
import { BenefitsSection } from '@/components/landing/BenefitsSection';
import { SocialProofSection } from '@/components/landing/SocialProofSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { RiskFreeSection } from '@/components/landing/RiskFreeSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { CTASection } from '@/components/landing/CTASection';
import { AuthForm } from '@/components/auth/AuthForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { LogIn, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { motion } from 'framer-motion';

const Index = () => {
  const { user, loading } = useAuth();
  const { actualTheme, toggleTheme } = useTheme();
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [authOpen, setAuthOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Carregando...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <PageLoader duration={2200}>
        <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white">

          {/* Header */}
        <motion.header 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 3.5 }}
          className="border-b border-white/20 bg-background sticky top-0 z-50 text-white"
        >
          <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-6">
            <a href="#" className="font-sans font-bold uppercase text-white text-xl tracking-tight">
              Esto<span className="text-primary">kitas</span>
            </a>

            <nav className="hidden md:flex items-center gap-1 font-mono text-xs uppercase tracking-widest">
              <a href="#beneficios" className="px-3 py-2 text-white/70 hover:text-white transition-colors">Funcionalidades</a>
              <a href="#planos"     className="px-3 py-2 text-white/70 hover:text-white transition-colors">Plano</a>
              <a href="#faq"        className="px-3 py-2 text-white/70 hover:text-white transition-colors">FAQ</a>
            </nav>

            <div className="flex items-center gap-2">

              <Dialog open={authOpen} onOpenChange={setAuthOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full border-white/30 text-white hover:bg-white hover:text-background font-mono text-xs uppercase tracking-wider gap-2 bg-transparent transition-colors"
                    onClick={() => setAuthMode('login')}
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    Entrar
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md p-0 bg-transparent border-none shadow-none [&>button]:hidden">
                  <AuthForm mode={authMode} onModeChange={setAuthMode} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </motion.header>

        <VibrantHeroSection
          authOpen={authOpen}
          setAuthOpen={setAuthOpen}
          authMode={authMode}
          setAuthMode={setAuthMode}
        />
        <BenefitsSection />
        <PainPointsSection />
        <OriginStorySection />
        <TransformationSection />
        <SocialProofSection />
        <PricingSection
          authOpen={authOpen}
          setAuthOpen={setAuthOpen}
          authMode={authMode}
          setAuthMode={setAuthMode}
        />
        <RiskFreeSection />
        <FAQSection />
        <CTASection
          authOpen={authOpen}
          setAuthOpen={setAuthOpen}
          authMode={authMode}
          setAuthMode={setAuthMode}
        />

        {/* Footer strip */}
        <footer className="border-t border-border py-8 px-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="font-sans font-bold uppercase text-foreground text-lg tracking-tight">
              Esto<span className="text-primary">kitas</span>
            </span>
            <div className="flex items-center gap-6 font-mono text-xs text-muted-foreground uppercase tracking-widest">
              <a href="#beneficios" className="hover:text-foreground transition-colors">Funcionalidades</a>
              <a href="#faq"        className="hover:text-foreground transition-colors">FAQ</a>
              <a
                href="https://mail.google.com/mail/u/0/?fs=1&to=estokitas@gmail.com&su=Suporte+Estokitas&tf=cm"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Contato
              </a>
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              © {new Date().getFullYear()} Estokitas
            </span>
          </div>
        </footer>
      </div>
    </PageLoader>
    );
  }

  return <Navigate to="/dashboard" replace />;
};

export default Index;
