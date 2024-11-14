import React from 'react';
import { Github, Linkedin, Globe } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">OptiPlan</h3>
            <p className="text-gray-300">
              Optimisez votre temps, facilitez vos plannings !
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Liens Utiles</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white">CGU</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Mentions Légales</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Politique de Confidentialité</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <p className="text-gray-300">Email: contact@optiplan.fr</p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Développeur</h4>
            <p className="text-gray-300 mb-2">Christophe Mostefaoui</p>
            <div className="flex space-x-4">
              <a href="https://github.com/krismos64" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="text-gray-300 hover:text-white">
                <Github className="w-6 h-6" />
              </a>
              <a href="https://www.linkedin.com/in/christophemostefaoui/" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="text-gray-300 hover:text-white">
                <Linkedin className="w-6 h-6" />
              </a>
              <a href="https://krismos.fr" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="text-gray-300 hover:text-white">
                <Globe className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-indigo-800 text-center">
          <p className="text-gray-300">
            © {new Date().getFullYear()} OptiPlan. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;