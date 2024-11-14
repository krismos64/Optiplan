import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';

const avantages = [
  "Essai gratuit de 14 jours",
  "Configuration simple et rapide",
  "Support réactif",
  "Pas de carte bancaire requise"
];

const CTASection = () => {
  return (
    <section className="py-16 px-4 bg-indigo-900 mt-16">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold text-white mb-6 animate-fade-in">
          Prêt à optimiser vos plannings ?
        </h2>
        <p className="text-indigo-200 mb-8 max-w-2xl mx-auto animate-fade-in">
          Rejoignez les milliers d'entreprises qui font confiance à OptiPlan pour leur gestion du temps.
        </p>
        
        <div className="flex justify-center mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
            {avantages.map((avantage, index) => (
              <div key={index} className="flex items-center text-white">
                <Check className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" />
                <span>{avantage}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center space-x-4 animate-fade-in">
          <Link
            to="/register"
            className="group bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors inline-flex items-center"
          >
            Commencer gratuitement
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/pricing"
            className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors"
          >
            Voir les tarifs
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;