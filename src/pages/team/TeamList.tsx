import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, UserPlus, Trash2, Edit2 } from 'lucide-react';
import { collection, query, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import TeamMemberForm from './TeamMemberForm';
import DeleteConfirmationModal from '../../components/modals/DeleteConfirmationModal';

interface TeamMember {
  id: string;
  nom: string;
  role: string;
  heuresHebdo: number;
  statut: 'actif' | 'inactif';
}

const TeamList = () => {
  const [showForm, setShowForm] = useState(false);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'team'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const membersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TeamMember[];
      setMembers(membersData);
      
      // Extraire les rôles uniques
      const roles = [...new Set(membersData.map(member => member.role))];
      setAvailableRoles(roles);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (memberId: string) => {
    try {
      await deleteDoc(doc(db, 'team', memberId));
      setShowDeleteModal(false);
      setSelectedMember(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.nom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole ? member.role === filterRole : true;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-indigo-900">Gestion d'Équipe</h1>
          <p className="text-gray-600">Gérez les membres de votre équipe</p>
        </div>
        <button 
          onClick={() => {
            setSelectedMember(null);
            setShowForm(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-indigo-700"
        >
          <UserPlus className="w-5 h-5" />
          <span>Ajouter un membre</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un membre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Tous les rôles</option>
              {availableRoles.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Heures/Semaine</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold">
                            {member.nom.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{member.nom}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{member.role}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{member.heuresHebdo}h</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      member.statut === 'actif' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {member.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setSelectedMember(member);
                          setShowForm(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedMember(member);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <TeamMemberForm
          member={selectedMember}
          availableRoles={availableRoles}
          onClose={() => {
            setShowForm(false);
            setSelectedMember(null);
          }}
        />
      )}

      {showDeleteModal && selectedMember && (
        <DeleteConfirmationModal
          title="Supprimer le membre"
          message={`Êtes-vous sûr de vouloir supprimer ${selectedMember.nom} de l'équipe ?`}
          onConfirm={() => handleDelete(selectedMember.id)}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedMember(null);
          }}
        />
      )}
    </div>
  );
};

export default TeamList;