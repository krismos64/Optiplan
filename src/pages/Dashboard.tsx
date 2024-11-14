import React, { useEffect, useState } from 'react';
import { Calendar, Users, Settings, PlusCircle, FileSpreadsheet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFirebaseCollection } from '../hooks/useFirebase';
import { Link } from 'react-router-dom';
import { format, subDays, isWithinInterval, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const Dashboard = () => {
  const { user } = useAuth();
  const { data: plannings = [] } = useFirebaseCollection('plannings');
  const { data: members = [] } = useFirebaseCollection('team');
  const { data: reports = [] } = useFirebaseCollection('reports');

  const [stats, setStats] = useState({
    planningsActifs: 0,
    membresActifs: 0,
    rapportsGeneres: 0,
    tachesEnAttente: 0
  });

  const [activites, setActivites] = useState<{
    type: string;
    description: string;
    date: Date;
    impact?: 'positive' | 'negative';
  }[]>([]);

  useEffect(() => {
    // Calculer les statistiques
    const now = new Date();
    const planningsActifs = plannings.filter(planning => {
      const debut = parseISO(planning.debut);
      const fin = parseISO(planning.fin);
      return isWithinInterval(now, { start: debut, end: fin });
    });

    const membresActifs = members.filter(member => member.statut === 'actif');
    const rapportsRecents = reports.filter(report => {
      const reportDate = parseISO(report.dateCreation);
      return reportDate >= subDays(now, 30);
    });

    setStats({
      planningsActifs: planningsActifs.length,
      membresActifs: membresActifs.length,
      rapportsGeneres: rapportsRecents.length,
      tachesEnAttente: planningsActifs.filter(p => p.statut === 'en_attente').length
    });

    // Générer les activités récentes
    const toutesActivites = [
      ...plannings.map(planning => ({
        type: 'planning',
        description: `Planning "${planning.nom}" ${planning.statut === 'actif' ? 'activé' : 'mis à jour'}`,
        date: parseISO(planning.derniereMiseAJour),
        impact: planning.statut === 'actif' ? 'positive' as const : undefined
      })),
      ...members.filter(m => m.derniereMiseAJour).map(member => ({
        type: 'membre',
        description: `${member.nom} - ${member.statut === 'actif' ? 'Statut actif' : 'Statut modifié'}`,
        date: parseISO(member.derniereMiseAJour),
        impact: member.statut === 'actif' ? 'positive' as const : 'negative' as const
      })),
      ...reports.map(report => ({
        type: 'rapport',
        description: `Rapport généré : ${report.type}`,
        date: parseISO(report.dateCreation)
      }))
    ];

    // Trier par date décroissante et prendre les 5 plus récentes
    setActivites(
      toutesActivites
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 5)
    );
  }, [plannings, members, reports]);

  return (
    <div className="flex-1 p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-indigo-900">Tableau de Bord</h1>
        <p className="text-gray-600">Bienvenue, {user?.displayName || 'Utilisateur'}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Plannings Actifs</h3>
            <Calendar className="w-6 h-6 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-indigo-600">{stats.planningsActifs}</p>
          <Link 
            to="/dashboard/plannings"
            className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
          >
            Voir les plannings
            <span className="ml-1">→</span>
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Membres d'équipe</h3>
            <Users className="w-6 h-6 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-indigo-600">{stats.membresActifs}</p>
          <Link 
            to="/dashboard/team"
            className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
          >
            Gérer l'équipe
            <span className="ml-1">→</span>
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Rapports générés</h3>
            <FileSpreadsheet className="w-6 h-6 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-indigo-600">{stats.rapportsGeneres}</p>
          <Link 
            to="/dashboard/reports"
            className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
          >
            Voir les rapports
            <span className="ml-1">→</span>
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Tâches en attente</h3>
            <Settings className="w-6 h-6 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-indigo-600">{stats.tachesEnAttente}</p>
          <span className="mt-2 text-sm text-gray-500">
            Plannings à valider
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-indigo-900">Actions Rapides</h2>
            <PlusCircle className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="space-y-4">
            <Link
              to="/dashboard/plannings"
              className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold py-3 px-4 rounded-lg flex items-center justify-between"
            >
              <span>Créer un nouveau planning</span>
              <Calendar className="w-5 h-5" />
            </Link>
            <Link
              to="/dashboard/team"
              className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold py-3 px-4 rounded-lg flex items-center justify-between"
            >
              <span>Ajouter un membre</span>
              <Users className="w-5 h-5" />
            </Link>
            <Link
              to="/dashboard/reports"
              className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold py-3 px-4 rounded-lg flex items-center justify-between"
            >
              <span>Générer un rapport</span>
              <FileSpreadsheet className="w-5 h-5" />
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-indigo-900 mb-6">Activité Récente</h2>
          <div className="space-y-4">
            {activites.map((activite, index) => (
              <div 
                key={index} 
                className="flex items-center space-x-3 py-2 border-b border-gray-100"
              >
                <div className={`w-2 h-2 rounded-full ${
                  activite.impact === 'positive' 
                    ? 'bg-green-500' 
                    : activite.impact === 'negative'
                    ? 'bg-red-500'
                    : 'bg-indigo-500'
                }`} />
                <div className="flex-1">
                  <p className="text-gray-600">{activite.description}</p>
                  <p className="text-sm text-gray-400">
                    {format(activite.date, 'dd MMMM yyyy à HH:mm', { locale: fr })}
                  </p>
                </div>
                {activite.impact && (
                  <div className={`flex items-center ${
                    activite.impact === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {activite.impact === 'positive' ? '↑' : '↓'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;