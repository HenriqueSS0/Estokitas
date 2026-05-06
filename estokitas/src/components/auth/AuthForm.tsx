import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { authSchema, resetPasswordSchema, validateInput } from '@/lib/validation';

interface AuthFormProps {
  mode: 'login' | 'signup' | 'reset';
  onModeChange: (mode: 'login' | 'signup' | 'reset') => void;
}

export const AuthForm = ({ mode, onModeChange }: AuthFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // SECURITY: Validate input before processing
    if (mode === 'reset') {
      const validation = validateInput(resetPasswordSchema, { email });
      if (!validation.success) {
        toast({
          title: "Erro de validação",
          description: validation.error,
          variant: "destructive",
        });
        return;
      }
    } else {
      const validation = validateInput(authSchema, { email, password });
      if (!validation.success) {
        toast({
          title: "Erro de validação",
          description: validation.error,
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);

    try {
      let result;
      if (mode === 'signup') {
        result = await signUp(email, password);
        if (!result.error) {
          toast({
            title: "Cadastro realizado!",
            description: "Verifique seu email para confirmar a conta.",
          });
        }
      } else if (mode === 'reset') {
        result = await resetPassword(email);
        if (!result.error) {
          toast({
            title: "Email enviado!",
            description: "Verifique seu email para redefinir a senha.",
          });
          onModeChange('login');
          return;
        }
      } else {
        result = await signIn(email, password);
        if (!result.error) {
          toast({
            title: "Login realizado!",
            description: "Bem-vindo de volta!",
          });
        }
      }

      if (result.error) {
        let errorMessage = "Erro desconhecido.";
        
        if (result.error.message?.includes('Invalid login credentials')) {
          errorMessage = "Email ou senha incorretos.";
        } else if (result.error.message?.includes('User already registered')) {
          errorMessage = "Este email já está cadastrado. Tente fazer login.";
        } else if (result.error.message?.includes('Email not confirmed')) {
          errorMessage = "Por favor, confirme seu email antes de fazer login.";
        } else if (result.error.message) {
          errorMessage = result.error.message;
        }

        toast({
          title: "Erro na autenticação",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Algo deu errado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg animate-fade-in border-4 border-black shadow-[8px_8px_0_#000] bg-white rounded-[2rem] overflow-hidden">
      <CardHeader className="pb-4 bg-[#FF0033] border-b-4 border-black">
        <div className="text-center mb-2">
          <div className="w-12 h-12 bg-white border-4 border-black rounded-full flex items-center justify-center mx-auto mb-2 shadow-[4px_4px_0_#000] animate-bounce">
            <div className="w-5 h-5 bg-black rounded-sm"></div>
          </div>
        </div>
        <CardTitle className="text-2xl font-black uppercase tracking-tighter text-white text-center">
          {mode === 'login' ? 'Fazer Login' : mode === 'signup' ? 'Criar Conta' : 'Redefinir Senha'}
        </CardTitle>
        <CardDescription className="text-center font-bold text-white/90 uppercase tracking-widest text-xs mt-2">
          {mode === 'login' 
            ? 'ENTRE PARA DOMINAR SEU ESTOQUE' 
            : mode === 'signup'
            ? 'CRIE SUA CONTA E ASSUMA O CONTROLE'
            : 'DIGITE SEU EMAIL PARA SALVAR A SENHA'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 px-6 md:px-10 pb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-black uppercase text-black tracking-widest">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="SEU@EMAIL.COM"
              className="h-12 border-4 border-black rounded-xl text-black font-bold uppercase placeholder:text-black/30 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:shadow-[4px_4px_0_#000] transition-shadow disabled:opacity-100"
            />
          </div>
          
          {mode !== 'reset' && (
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-black uppercase text-black tracking-widest">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="SUA SENHA"
                minLength={6}
                className="h-12 border-4 border-black rounded-xl text-black font-bold focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:shadow-[4px_4px_0_#000] transition-shadow"
              />
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full h-12 text-lg bg-[#4A4A4A] hover:bg-[#333333] text-white border-4 border-black shadow-[4px_4px_0_#000] font-black uppercase tracking-tighter hover:-translate-y-1 hover:shadow-[6px_6px_0_#000] active:translate-y-1 active:shadow-[2px_2px_0_#000] transition-all rounded-xl mt-2" 
            disabled={loading}
          >
            {loading ? (
              mode === 'login' ? 'ENTRANDO...' : mode === 'signup' ? 'CRIANDO CONTA...' : 'ENVIANDO EMAIL...'
            ) : (
              mode === 'login' ? 'ACESSAR AGORA' : mode === 'signup' ? 'COMEÇAR DE GRAÇA' : 'ENVIAR EMAIL'
            )}
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t-4 border-black border-dashed space-y-2 text-center">
          {mode === 'login' ? (
            <>
              <p className="text-sm font-bold text-black uppercase tracking-widest">
                NÃO TEM UMA CONTA?{' '}
                <button
                  type="button"
                  onClick={() => onModeChange('signup')}
                  className="text-black/70 hover:text-black hover:underline hover:-rotate-1 transition-all font-black"
                >
                  CRIAR CONTA
                </button>
              </p>
              <p>
                <button
                  type="button"
                  onClick={() => onModeChange('reset')}
                  className="text-black/60 hover:text-black font-bold uppercase tracking-widest hover:underline transition-colors text-xs"
                >
                  ESQUECI MINHA SENHA
                </button>
              </p>
            </>
          ) : mode === 'signup' ? (
            <p className="text-sm font-bold text-black uppercase tracking-widest">
              JÁ TEM UMA CONTA?{' '}
              <button
                type="button"
                onClick={() => onModeChange('login')}
                className="text-black/70 hover:text-black hover:underline hover:-rotate-1 transition-all font-black"
              >
                FAZER LOGIN
              </button>
            </p>
          ) : (
            <p className="text-sm font-bold text-black uppercase tracking-widest">
              LEMBROU DA SENHA?{' '}
              <button
                type="button"
                onClick={() => onModeChange('login')}
                className="text-black/70 hover:text-black hover:underline hover:-rotate-1 transition-all font-black"
              >
                VOLTAR AO LOGIN
              </button>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};