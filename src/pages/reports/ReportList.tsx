import React, { useState } from 'react';
import { FileSpreadsheet, FileText, BarChart3, Clock, Users, Calendar, AlertCircle } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useFirebaseCollection } from '../../hooks/useFirebase';
import ReportGenerator from './ReportGenerator';

const reportTypes = [
  {
    id: 'heures-travaillees',
    icon: Clock,
    title: 'Heures Travaillées',
    description: 'Analyse détaillée des heures travaillées par membre'
  },
  {
    id: 'rotation-equipe',
    icon: Users,
    title: 'Rotation d\'Équipe',
    description: 'Répartition et rotation des équipes'
  },
  {
    id: 'planning-mensuel',
    icon: Calendar,
    title: 'Planning Mensuel',
    description: 'Vue d\'ensemble du planning mensuel'
  },
  {
    id: 'analyse-performance',
    icon: BarChart3,
    title: 'Analyse Performance',
    description: 'Indicateurs de performance et statistiques'
  }
];

const ReportList = () => {
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dateRange, setDateRange] = useState({
    debut: format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'),
    fin: format(endOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd')
  });

  const { data: plannings, loading: loadingPlannings } = useFirebaseCollection('plannings');
  const { data: members, loading: loadingMembers } = useFirebaseCollection('team');

  const generateReport = async (reportType: string) => {
    setError(null);
    setIsGenerating(true);
    try {
      if (!plannings || !members) {
        throw new Error('Données non disponibles');
      }

      const planningsFiltered = plannings.filter(planning => 
        planning.debut >= dateRange.debut && planning.fin <= dateRange.fin
      );

      if (planningsFiltered.length === 0) {
        throw new Error('Aucune donnée disponible pour la période sélectionnée');
      }

      switch (reportType) {
        case 'heures-travaillees':
          await ReportGenerator.generateHeuresTravaillees(planningsFiltered, members, dateRange);
          break;
        case 'rotation-equipe':
          await ReportGenerator.generateRotationEquipe(planningsFiltered, members, dateRange);
          break;
        case 'planning-mensuel':
          await ReportGenerator.generatePlanningMensuel(planningsFiltered, members, dateRange);
          break;
        case 'analyse-performance':
          await ReportGenerator.generateAnalysePerformance(planningsFiltered, members, dateRange);
          break;
        default:
          throw new Error('Type de rapport non reconnu');
      }
    } catch (error: any) {
      console.error('Erreur lors de la génération du rapport:', error);
      setError(error.message || 'Une erreur est survenue lors de la génération du rapport');
    } finally {
      setIsGenerating(false);
      setSelectedReport(null);
    }
  };

  if (loadingPlannings || loadingMembers) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-indigo-900">Rapports</h1>
        <p className="text-gray-600">Générez et analysez vos rapports d'activité</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div className="mb-8">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de début
            </label>
            <input
              type="date"
              value={dateRange.debut}
              onChange={(e) => setDateRange(prev => ({ ...prev, debut: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de fin
            </label>
            <input
              type="date"
              value={dateRange.fin}
              onChange={(e) => setDateRange(prev => ({ ...prev, fin: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          const isSelected = selectedReport === report.id;
          const isLoading = isSelected && isGenerating;

          return (
            <div
              key={report.id}
              className={`bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all ${
                isSelected ? 'ring-2 ring-indigo-600' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{report.description}</p>
              <button
                onClick={() => {
                  setSelectedReport(report.id);
                  generateReport(report.id);
                }}
                disabled={isGenerating}
                className={`w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center ${
                  isGenerating ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Génération...
                  </>
                ) : (
                  'Générer le rapport'
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReportList;