import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('dorm_user');
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        if (user) {
            localStorage.setItem('dorm_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('dorm_user');
        }
    }, [user]);

    const login = (userData) => setUser(userData);
    const logout = () => setUser(null);
    const updateUser = (updatedData) => setUser((prev) => ({ ...prev, ...updatedData }));

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
