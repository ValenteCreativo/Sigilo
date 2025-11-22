"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  isRoleVerified: boolean;
  sessionId: string | null;
  authenticate: (pin: string) => boolean;
  createPin: (pin: string) => void;
  lock: () => void;
  verifyRole: () => void;
  hasPin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Generate session ID
function generateSessionId(): string {
  return `SIG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [storedPin, setStoredPin] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRoleVerified, setIsRoleVerified] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const createPin = useCallback((pin: string) => {
    setStoredPin(pin);
    setIsAuthenticated(true);
    setSessionId(generateSessionId());
  }, []);

  const authenticate = useCallback((pin: string): boolean => {
    if (pin === storedPin) {
      setIsAuthenticated(true);
      if (!sessionId) {
        setSessionId(generateSessionId());
      }
      return true;
    }
    return false;
  }, [storedPin, sessionId]);

  const lock = useCallback(() => {
    setIsAuthenticated(false);
    setIsRoleVerified(false);
    setSessionId(null);
  }, []);

  const verifyRole = useCallback(() => {
    setIsRoleVerified(true);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isRoleVerified,
        sessionId,
        authenticate,
        createPin,
        lock,
        verifyRole,
        hasPin: !!storedPin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
