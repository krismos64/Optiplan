import React from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

const ContactInfo = () => {
  const contactDetails = [
    {
      icon: Phone,
      title: 'Téléphone',
      info: '+33 (0)1 23 45 67 89',
      description: 'Du lundi au vendredi, 9h-18h'
    },
    {
      icon: Mail,
      title: 'Email',
      info: 'contact@optiplan.fr',
      description: 'Réponse sous 24h ouvrées'
    },
    {
      icon: MapPin,
      title: 'Adresse',
      info: '123 Avenue des Champs-Élysées',
      description: '75008 Paris, France'
    },
    {
      icon: Clock,
      title: 'Horaires',
      info: 'Lun-Ven: 9h-18h',
      description: 'Week-end: Fermé'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 animate-fade-in">
      <h2 className="text-2xl font-bold text-indigo-900 mb-6">Nos coordonnées</h2>
      
      <div className="space-y-8">
        {contactDetails.map((detail, index) => {
          const Icon = detail.icon;
          return (
            <div key={index} className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{detail.title}</h3>
                <p className="text-indigo-600 font-medium">{detail.info}</p>
                <p className="text-gray-500 text-sm">{detail.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 pt-8 border-t border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Suivez-nous</h3>
        <div className="flex space-x-4">
          {['LinkedIn', 'Twitter', 'Facebook'].map((social, index) => (
            <a
              key={index}
              href="#"
              className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              {social}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;