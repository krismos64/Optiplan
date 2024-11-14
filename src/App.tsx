import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { initializeDatabase } from './services/initializeDatabase';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PlanningList from './pages/plannings/PlanningList';
import TeamList from './pages/team/TeamList';
import ReportList from './pages/reports/ReportList';
import Settings from './pages/settings/Settings';
import DashboardLayout from './components/DashboardLayout';
import Pricing from './pages/Pricing';
import Features from './pages/Features';
import Contact from './pages/Contact';
import { useAuth } from './context/AuthContext';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  React.useEffect(() => {
    const init = async () => {
      try {
        await initializeDatabase();
        console.log('Base de données initialisée avec succès');
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de la base de données:', error);
      }
    };
    init();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Routes publiques */}
          <Route
            path="/"
            element={
              <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col">
                <Header />
                <Home />
                <Footer />
              </div>
            }
          />
          <Route
            path="/features"
            element={
              <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col">
                <Header />
                <Features />
                <Footer />
              </div>
            }
          />
          <Route
            path="/pricing"
            element={
              <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col">
                <Header />
                <Pricing />
                <Footer />
              </div>
            }
          />
          <Route
            path="/contact"
            element={
              <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col">
                <Header />
                <Contact />
                <Footer />
              </div>
            }
          />
          <Route
            path="/login"
            element={
              <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col">
                <Header />
                <Login />
                <Footer />
              </div>
            }
          />
          <Route
            path="/register"
            element={
              <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col">
                <Header />
                <Register />
                <Footer />
              </div>
            }
          />

          {/* Routes du tableau de bord */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="plannings" element={<PlanningList />} />
            <Route path="team" element={<TeamList />} />
            <Route path="reports" element={<ReportList />} />
            <Route path="parametres" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;