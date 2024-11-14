import React from 'react';
import { Calendar, Users, FileSpreadsheet, Clock, Bell, Shield, Zap, LineChart } from 'lucide-react';
import FeatureCard from '../components/features/FeatureCard';
import HeroSection from '../components/features/HeroSection';
import CTASection from '../components/features/CTASection';

const features = [
  {
    icon: Calendar,
    title: 'Planification Intuitive',
    description: 'Créez et gérez vos plannings en quelques clics avec notre interface drag-and-drop intuitive.'
  },
  {
    icon: Users,
    title: 'Gestion d\'Équipe',
    description: 'Gérez facilement les disponibilités et les rotations de vos équipes.'
  },
  {
    icon: Clock,
    title: 'Temps Réel',
    description: 'Modifications instantanées et synchronisation en temps réel pour toute l\'équipe.'
  },
  {
    icon: Bell,
    title: 'Notifications',
    description: 'Restez informé des changements avec des notifications personnalisables.'
  },
  {
    icon: Shield,
    title: 'Sécurité Avancée',
    description: 'Protection des données et gestion fine des permissions d\'accès.'
  },
  {
    icon: FileSpreadsheet,
    title: 'Exports Flexibles',
    description: 'Exportez vos plannings dans différents formats (PDF, Excel, etc.).'
  },
  {
    icon: Zap,
    title: 'Performance',
    description: 'Interface rapide et réactive, même avec des plannings complexes.'
  },
  {
    icon: LineChart,
    title: 'Analyses & Rapports',
    description: 'Visualisez les tendances et optimisez vos plannings avec des analyses détaillées.'
  }
];

const Features = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <HeroSection />
      
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <FeatureCard 
                key={index} 
                {...feature} 
                delay={index * 100}
              />
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
};

export default Features;