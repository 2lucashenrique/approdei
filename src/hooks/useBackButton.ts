import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface UseBackButtonOptions {
  onBackPress?: () => void;
  preventDefault?: boolean;
}

export const useBackButton = (options: UseBackButtonOptions = {}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { onBackPress, preventDefault = false } = options;

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (preventDefault) {
        event.preventDefault();
      }

      if (onBackPress) {
        onBackPress();
        return;
      }

      // Se estamos em uma página específica, navegar de volta
      const currentPath = location.pathname;
      
      // Para páginas que não são a principal, voltar para a principal
      if (currentPath !== '/') {
        navigate('/', { replace: true });
      } else {
        // Se estamos na página principal, fechar o app (em dispositivos móveis)
        if (window.history.length > 1) {
          navigate(-1);
        } else {
          // Se não há histórico, não fazer nada ou mostrar confirmação para sair
          console.log('Tentativa de sair do app');
        }
      }
    };

    // Adicionar listener para o evento popstate (botão voltar do navegador/dispositivo)
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate, location, onBackPress, preventDefault]);
};