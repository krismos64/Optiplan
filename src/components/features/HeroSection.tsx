import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="pt-20 pb-16 px-4">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-indigo-900 mb-6 animate-fade-in">
          Fonctionnalités Puissantes
        </h1>
        <p className="text-xl text-indigo-600 max-w-2xl mx-auto mb-8 animate-fade-in">
          Découvrez comment OptiPlan peut transformer votre gestion du temps et améliorer la productivité de votre équipe.
        </p>
        <div className="flex justify-center gap-4 mb-12 animate-fade-in">
          <Link
            to="/register"
            className="inline-flex items-center bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Essayer gratuitement
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
          <Link
            to="/pricing"
            className="inline-flex items-center border-2 border-indigo-600 text-indigo-600 px-6 py-3 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            Voir les tarifs
          </Link>
        </div>
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80"
            alt="Aperçu du tableau de bord"
            className="rounded-lg shadow-2xl mx-auto max-w-4xl animate-fade-in"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/20 to-transparent rounded-lg"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;