
import { useState, useEffect, createContext, useContext } from 'react';
import { User, LoginCredentials, RegisterCredentials, AuthContextType } from '@/types/auth';
import { dbManager } from './useIndexedDB';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthProvider = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const currentUserId = localStorage.getItem('currentUserId');
        if (currentUserId) {
          const userData = await dbManager.get<User>('users', currentUserId);
          if (userData) {
            setUser(userData);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCurrentUser();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Buscar todos os usuários para encontrar o email
      const users = await dbManager.getAll<User>('users');
      const user = users.find(u => u.email === credentials.email);
      
      if (!user) {
        return false;
      }

      // Verificar senha (em produção use hash/salt adequado)
      if (user.password !== credentials.password) {
        return false;
      }

      setUser(user);
      localStorage.setItem('currentUserId', user.id);
      return true;
      
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Verificar se email já existe
      const users = await dbManager.getAll<User>('users');
      const existingUser = users.find(u => u.email === credentials.email);
      
      if (existingUser) {
        return false;
      }

      const newUser: User = {
        id: Date.now().toString(),
        name: credentials.name,
        email: credentials.email,
        password: credentials.password, // Em produção use hash/salt adequado
        createdAt: new Date().toISOString(),
      };

      await dbManager.set('users', newUser);
      setUser(newUser);
      localStorage.setItem('currentUserId', newUser.id);
      return true;
      
    } catch (error) {
      console.error('Erro no registro:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUserId');
    // Limpar cache do navegador para evitar que dados de outros usuários sejam vistos
    window.location.reload();
  };

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Verificar senha atual
      if (user.password !== currentPassword) {
        return false;
      }

      const updatedUser = { ...user, password: newPassword };
      await dbManager.set('users', updatedUser);
      setUser(updatedUser);
      return true;
      
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      return false;
    }
  };

  return {
    user,
    login,
    register,
    logout,
    updatePassword,
    isLoading,
  };
};

export { AuthContext };
