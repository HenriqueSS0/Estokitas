import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ArrowUpDown, ShoppingCart, PackagePlus } from 'lucide-react';
import { RegistrarVendasComVariaveisDialog } from '@/components/vendas/RegistrarVendasComVariaveisDialog';
import { RegistrarEntradaComVariaveisDialog } from '@/components/vendas/RegistrarEntradaComVariaveisDialog';

export const MovimentacaoButton = () => {
  const [open, setOpen] = useState(false);
  const [vendasOpen, setVendasOpen] = useState(false);
  const [entradaOpen, setEntradaOpen] = useState(false);

  const handleVendasClick = () => {
    setOpen(false);
    setTimeout(() => setVendasOpen(true), 100);
  };

  const handleEntradaClick = () => {
    setOpen(false);
    setTimeout(() => setEntradaOpen(true), 100);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300">
            <ArrowUpDown className="h-4 w-4" />
            Nova Movimentação
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent text-center">
              Tipo de Movimentação
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              Escolha o tipo de movimentação que deseja realizar
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-4 grid grid-cols-1 gap-3">
            <Button
              onClick={handleVendasClick}
              variant="outline"
              className="flex items-center gap-3 p-6 h-auto border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 group"
            >
              <ShoppingCart className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <div className="font-semibold">Registrar Venda</div>
                <div className="text-sm text-muted-foreground">Produtos e variáveis</div>
              </div>
            </Button>
            
            <Button
              onClick={handleEntradaClick}
              variant="outline"
              className="flex items-center gap-3 p-6 h-auto border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 group"
            >
              <PackagePlus className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <div className="font-semibold">Registrar Entrada</div>
                <div className="text-sm text-muted-foreground">Produtos e variáveis</div>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <RegistrarVendasComVariaveisDialog open={vendasOpen} onOpenChange={setVendasOpen} />
      <RegistrarEntradaComVariaveisDialog open={entradaOpen} onOpenChange={setEntradaOpen} />
    </>
  );
};