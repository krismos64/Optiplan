import React from 'react';
import { Check, Star } from 'lucide-react';

const pricingPlans = [
  {
    name: 'Solo',
    price: 9.99,
    users: 1,
    popular: false,
    features: [
      '1 espace administrateur',
      'Plannings illimités',
      'Export PDF',
      'Support par email',
      'Statistiques de base'
    ]
  },
  {
    name: 'Startup',
    price: 39.99,
    users: 5,
    popular: false,
    features: [
      '5 espaces administrateurs',
      'Plannings illimités',
      'Export PDF & Excel',
      'Support prioritaire',
      'Statistiques avancées',
      'Historique des modifications'
    ]
  },
  {
    name: 'Business',
    price: 69.99,
    users: 10,
    popular: true,
    features: [
      '10 espaces administrateurs',
      'Plannings illimités',
      'Export tous formats',
      'Support téléphonique',
      'Statistiques avancées',
      'Historique des modifications',
      'API disponible'
    ]
  },
  {
    name: 'Pro',
    price: 129.99,
    users: 20,
    popular: false,
    features: [
      '20 espaces administrateurs',
      'Plannings illimités',
      'Export tous formats',
      'Support dédié',
      'Statistiques avancées',
      'Historique des modifications',
      'API disponible',
      'Formation incluse'
    ]
  },
  {
    name: 'Enterprise',
    price: 299.99,
    users: 50,
    popular: false,
    features: [
      '50 espaces administrateurs',
      'Plannings illimités',
      'Export tous formats',
      'Support dédié 24/7',
      'Statistiques avancées',
      'Historique des modifications',
      'API disponible',
      'Formation sur site',
      'Instance dédiée'
    ]
  },
  {
    name: 'Corporate',
    price: 549.99,
    users: 100,
    popular: false,
    features: [
      '100 espaces administrateurs',
      'Plannings illimités',
      'Export tous formats',
      'Support dédié 24/7',
      'Statistiques avancées',
      'Historique des modifications',
      'API disponible',
      'Formation sur site',
      'Instance dédiée',
      'Personnalisation complète'
    ]
  }
];

const Pricing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl font-bold text-indigo-900 mb-4">
            Tarifs adaptés à vos besoins
          </h1>
          <p className="text-xl text-indigo-600 max-w-2xl mx-auto">
            Choisissez la formule qui correspond à la taille de votre équipe. 
            Tous nos plans incluent une période d'essai de 14 jours.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl shadow-xl p-8 transition-transform hover:scale-105 ${
                plan.popular ? 'ring-2 ring-indigo-600' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-6 transform -translate-y-1/2">
                  <div className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    Plus populaire
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-indigo-900 mb-2">{plan.name}</h3>
                <p className="text-gray-500 mb-4">{plan.users} administrateurs</p>
                <div className="text-4xl font-bold text-indigo-900">
                  {plan.price}€
                  <span className="text-base font-normal text-gray-500">/mois</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-600">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                plan.popular
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
              }`}>
                Commencer l'essai gratuit
              </button>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-indigo-900 mb-4">
            Besoin d'une solution sur mesure ?
          </h2>
          <p className="text-gray-600 mb-6">
            Contactez-nous pour une offre personnalisée adaptée à vos besoins spécifiques.
          </p>
          <button className="bg-white text-indigo-600 font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            Contacter l'équipe commerciale
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pricing;