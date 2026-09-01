import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Login } from './pages/Login';
import { RunsList } from './pages/RunsList';
import { RunDetail } from './pages/RunDetail';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center font-sans">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center animate-pulse">
            <span className="material-symbols-outlined text-white text-[20px]">all_inclusive</span>
          </div>
          <p className="text-sm font-semibold text-[#6f7979]">Initializing OmniSight Engine...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-canvas antialiased font-sans">
      {/* Docked Sidebar */}
      <Sidebar />

      {/* Main Content Canvas */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-canvas">
        {children}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <RunsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/runs/:id"
              element={
                <ProtectedRoute>
                  <RunDetail />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
