// ============================================
// IMPORTS
// ============================================
// React pour créer des composants
import React from 'react';
// React Router pour gérer la navigation entre pages
import { BrowserRouter, Routes, Route } from 'react-router-dom';
// Composant Landing (la page d'accueil)
import Landing from './Landing';
// Composant Dashboard
import Dashboard from './components/app/dashboard';
// Composant Login
import Login from './components/auth/Login';
// Popup OAuth Handler
import PopupOAuthHandler from './components/auth/PopupOAuthHandler';
// OAuth Initiator (for non-popup flow)
import OAuthInit from './components/auth/OAuthInit';

// ============================================
// PAGES PLACEHOLDER (À REMPLACER PLUS TARD)
// ============================================

// Page Editor - affiche juste un titre pour maintenant
const Editor = () => (
  <div className="min-h-screen bg-[#040507] text-white flex items-center justify-center">
    <h1 className="text-4xl font-bold">Editor (Coming Soon)</h1>
  </div>
);

// Page Gallery - affiche juste un titre pour maintenant
const Gallery = () => (
  <div className="min-h-screen bg-[#040507] text-white flex items-center justify-center">
    <h1 className="text-4xl font-bold">Gallery (Coming Soon)</h1>
  </div>
);

// ============================================
// COMPOSANT PRINCIPAL APP
// ============================================
const App: React.FC = () => {
  return (
    // BrowserRouter : permet la navigation entre pages sans recharger
    <BrowserRouter>
      {/* Routes : définit les différentes URLs et les pages associées */}
      <Routes>
        {/* LANDING PAGE - "/" */}
        {/* Quand l'utilisateur va sur https://sellest.com/ → affiche Landing */}
        <Route path="/" element={<Landing />} />

        {/* LOGIN PAGE - "/login" */}
        {/* Quand l'utilisateur va sur https://sellest.com/login → affiche Login */}
        <Route path="/login" element={<Login />} />

        {/* OAUTH INITIATOR - /auth/google?provider=google */}
        {/* Redirects to Google OAuth (no popup) */}
        <Route path="/auth/:provider" element={<OAuthInit />} />

        {/* OAUTH POPUP INITIATOR - /auth/popup?provider=google */}
        {/* Opens OAuth flow in popup window */}
        <Route path="/auth/popup" element={<PopupOAuthHandler />} />

        {/* APP PAGES - "/app/*" */}
        {/* Quand l'utilisateur va sur https://sellest.com/app/dashboard → affiche Dashboard */}
        <Route path="/app/dashboard" element={<Dashboard />} />

        {/* Quand l'utilisateur va sur https://sellest.com/app/editor → affiche Editor */}
        <Route path="/app/editor" element={<Editor />} />

        {/* Quand l'utilisateur va sur https://sellest.com/app/gallery → affiche Gallery */}
        <Route path="/app/gallery" element={<Gallery />} />

        {/* CATCH-ALL - "/*" */}
        {/* Si l'URL ne correspond à aucune route → affiche 404 */}
        <Route path="*" element={<h1 className="text-white text-center mt-20">404 - Page Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
};
// Export du composant App pour l'utiliser dans index.tsx
export default App;