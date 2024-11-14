import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold text-indigo-600">OptiPlan</div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-indigo-600">Accueil</Link>
            <Link to="/features" className="text-gray-600 hover:text-indigo-600">Fonctionnalités</Link>
            <Link to="/pricing" className="text-gray-600 hover:text-indigo-600">Tarifs</Link>
            <Link to="/contact" className="text-gray-600 hover:text-indigo-600">Contact</Link>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-indigo-600 hover:text-indigo-700">
                Connexion
              </Link>
              <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                S'inscrire
              </Link>
            </div>
          </div>

          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-gray-600 hover:text-indigo-600">Accueil</Link>
              <Link to="/features" className="text-gray-600 hover:text-indigo-600">Fonctionnalités</Link>
              <Link to="/pricing" className="text-gray-600 hover:text-indigo-600">Tarifs</Link>
              <Link to="/contact" className="text-gray-600 hover:text-indigo-600">Contact</Link>
              <div className="pt-4 border-t border-gray-200">
                <Link to="/login" className="block text-indigo-600 hover:text-indigo-700 mb-2">
                  Connexion
                </Link>
                <Link to="/register" className="block bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-center">
                  S'inscrire
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;