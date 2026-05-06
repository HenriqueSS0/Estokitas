import { useEffect, useState, createContext, useContext, ReactNode } from 'react';

const UTM_STORAGE_KEY = 'estokitas_utm_params';

export interface UTMParams {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
}

const defaultUTMs: UTMParams = {
  utm_source: null,
  utm_medium: null,
  utm_campaign: null,
  utm_content: null,
  utm_term: null,
};

interface UTMContextType {
  utmParams: UTMParams;
  getUTMMetadata: () => Record<string, string>;
}

const UTMContext = createContext<UTMContextType | undefined>(undefined);

// Captura UTMs da URL
const getUTMsFromURL = (): Partial<UTMParams> => {
  if (typeof window === 'undefined') return {};
  
  const params = new URLSearchParams(window.location.search);
  const utms: Partial<UTMParams> = {};
  
  const keys: (keyof UTMParams)[] = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  
  keys.forEach(key => {
    const value = params.get(key);
    if (value) {
      utms[key] = value;
    }
  });
  
  return utms;
};

// Salva UTMs no localStorage
const saveUTMsToStorage = (utms: UTMParams): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utms));
  } catch (error) {
    console.warn('Erro ao salvar UTMs:', error);
  }
};

// Carrega UTMs do localStorage
const loadUTMsFromStorage = (): UTMParams | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(UTM_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as UTMParams;
    }
  } catch (error) {
    console.warn('Erro ao carregar UTMs:', error);
  }
  
  return null;
};

export const UTMProvider = ({ children }: { children: ReactNode }) => {
  const [utmParams, setUtmParams] = useState<UTMParams>(defaultUTMs);

  useEffect(() => {
    // 1. Primeiro, tenta carregar UTMs existentes do storage
    const storedUTMs = loadUTMsFromStorage();
    
    // 2. Captura UTMs da URL atual
    const urlUTMs = getUTMsFromURL();
    
    // 3. Merge: UTMs da URL têm prioridade sobre as armazenadas
    const hasNewUTMs = Object.values(urlUTMs).some(v => v !== null && v !== undefined);
    
    let finalUTMs: UTMParams;
    
    if (hasNewUTMs) {
      // Se há novos UTMs na URL, usa eles (nova sessão de campanha)
      finalUTMs = {
        ...defaultUTMs,
        ...urlUTMs,
      };
      saveUTMsToStorage(finalUTMs);
    } else if (storedUTMs) {
      // Se não há UTMs na URL, usa os armazenados
      finalUTMs = storedUTMs;
    } else {
      // Nenhum UTM disponível
      finalUTMs = defaultUTMs;
    }
    
    setUtmParams(finalUTMs);
  }, []);

  // Retorna UTMs como objeto de metadata para integrações externas
  const getUTMMetadata = (): Record<string, string> => {
    const metadata: Record<string, string> = {};
    
    if (utmParams.utm_source) metadata.utm_source = utmParams.utm_source;
    if (utmParams.utm_medium) metadata.utm_medium = utmParams.utm_medium;
    if (utmParams.utm_campaign) metadata.utm_campaign = utmParams.utm_campaign;
    if (utmParams.utm_content) metadata.utm_content = utmParams.utm_content;
    if (utmParams.utm_term) metadata.utm_term = utmParams.utm_term;
    
    return metadata;
  };

  return (
    <UTMContext.Provider value={{ utmParams, getUTMMetadata }}>
      {children}
    </UTMContext.Provider>
  );
};

export const useUTM = (): UTMContextType => {
  const context = useContext(UTMContext);
  if (context === undefined) {
    throw new Error('useUTM must be used within a UTMProvider');
  }
  return context;
};

// Função utilitária para obter UTMs fora do contexto React (para edge functions)
export const getStoredUTMs = (): UTMParams => {
  return loadUTMsFromStorage() || defaultUTMs;
};
