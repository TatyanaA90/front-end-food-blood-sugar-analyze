import { createContext } from 'react';

interface User {
    id: number;
    username: string;
    email: string;
    name: string;
    is_admin: boolean;
    weight?: number;
    weight_unit?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<void>;
    adminLogin: (username: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string, weight?: string, weight_unit?: string) => Promise<void>;
    logout: () => void;
    updateUser: (userData: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export type { User, AuthContextType };
