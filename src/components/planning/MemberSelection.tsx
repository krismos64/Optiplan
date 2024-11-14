import React from 'react';

interface TeamMember {
  id: string;
  nom: string;
}

interface MemberSelectionProps {
  members: TeamMember[];
  selectedMembers: string[];
  onMemberToggle: (memberId: string, selected: boolean) => void;
  onSelectAll: () => void;
}

const MemberSelection: React.FC<MemberSelectionProps> = ({
  members = [],
  selectedMembers = [],
  onMemberToggle,
  onSelectAll
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Membres de l'équipe
        </label>
        <button
          type="button"
          onClick={onSelectAll}
          className="text-sm text-indigo-600 hover:text-indigo-800"
        >
          {selectedMembers.length === members.length ? 
            'Désélectionner tout' : 'Sélectionner tout'}
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {members.map((member) => (
          <label
            key={member.id}
            className="flex items-center p-2 border rounded-lg hover:bg-gray-50"
          >
            <input
              type="checkbox"
              checked={selectedMembers.includes(member.id)}
              onChange={(e) => onMemberToggle(member.id, e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">{member.nom}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default MemberSelection;