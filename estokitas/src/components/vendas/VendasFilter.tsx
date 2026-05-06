import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface VendasFilterProps {
  filter: 'hoje' | 'ultimos_7_dias' | 'ultimos_30_dias' | 'total' | 'personalizada';
  onFilterChange: (filter: 'hoje' | 'ultimos_7_dias' | 'ultimos_30_dias' | 'total' | 'personalizada') => void;
  selectedDate?: Date;
  onDateChange?: (date: Date | undefined) => void;
  selectedProduto?: string;
  onProdutoChange?: (produto: string) => void;
  produtos?: Array<{ id: string; nome: string }>;
}

export const VendasFilter = ({ filter, onFilterChange, selectedDate, onDateChange, selectedProduto, onProdutoChange, produtos }: VendasFilterProps) => {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Filter className="h-4 w-4 text-muted-foreground" />
      
      {/* Filtro por produto */}
      {produtos && produtos.length > 0 && onProdutoChange && (
        <Select value={selectedProduto || 'todos'} onValueChange={onProdutoChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por produto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os produtos</SelectItem>
            {produtos.map((produto) => (
              <SelectItem key={produto.id} value={produto.id}>
                {produto.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      
      {/* Filtro por período */}
      <Select value={filter} onValueChange={onFilterChange}>
        <SelectTrigger className="w-48">
          <Calendar className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Filtrar por período" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="hoje">Hoje</SelectItem>
          <SelectItem value="ultimos_7_dias">Últimos 7 dias</SelectItem>
          <SelectItem value="ultimos_30_dias">Últimos 30 dias</SelectItem>
          <SelectItem value="personalizada">Data específica</SelectItem>
          <SelectItem value="total">Total (todas)</SelectItem>
        </SelectContent>
      </Select>
      
      {filter === 'personalizada' && onDateChange && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-48 justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : "Selecionar data"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={onDateChange}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};