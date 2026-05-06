import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, User } from 'lucide-react';
import { NotificationBell } from './NotificationBell';

export const Navbar = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  if (!user) return null;

  return (
    <nav className="border-b-4 border-black bg-[#CCFF00] sticky top-0 z-50 shadow-[0_4px_0_#000]">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="bg-white border-4 border-black p-1 rounded-xl shadow-[4px_4px_0_#000]">
            <Logo />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-black ml-2">ESTOKITAS</h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-black bg-white border-4 border-black px-4 py-2 rounded-xl shadow-[4px_4px_0_#000]">
            <User className="h-5 w-5 stroke-[3px]" />
            <span>{user.email}</span>
          </div>
          
          <NotificationBell />
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="gap-2 bg-white text-black border-4 border-black shadow-[4px_4px_0_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0_#000] active:translate-y-1 active:shadow-[2px_2px_0_#000] rounded-xl font-black uppercase tracking-widest text-xs h-12 px-6 transition-all"
          >
            <LogOut className="h-5 w-5 stroke-[3px] text-[#FF0033]" />
            Sair
          </Button>
        </div>
      </div>
    </nav>
  );
};