import React, { useState } from 'react';
import { Users, UserPlus, ArrowRight, Trash2 } from 'lucide-react';
import { User } from '../types';
import { useTheme } from '../context/ThemeContext';

interface SetupPhaseProps {
  currentUser: User;
  participants: User[];
  onAddParticipant: (name: string) => void;
  onRemoveParticipant: (userId: string) => void;
  onNextPhase: () => void;
}

export const SetupPhase: React.FC<SetupPhaseProps> = ({
  currentUser,
  participants,
  onAddParticipant,
  onRemoveParticipant,
  onNextPhase,
}) => {
  const { theme: t } = useTheme();
  const [newParticipantName, setNewParticipantName] = useState('');

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newParticipantName.trim();
    if (!name) return;
    onAddParticipant(name);
    setNewParticipantName('');
  };

  return (
    <div className={t.page}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className={t.iconBubble}>
            <Users className="w-8 h-8 text-white" aria-hidden="true" />
          </div>
          <h1 className={`text-3xl font-bold ${t.heading} mb-2`}>Session Setup</h1>
          <p className={`text-xl ${t.body}`}>Add everyone who's participating</p>
        </div>

        <div className={`${t.card} mb-6`}>
          <h3 className={`font-semibold ${t.heading} mb-4 flex items-center gap-2`}>
            <Users className={`w-5 h-5 ${t.accent}`} aria-hidden="true" />
            Participants ({participants.length})
          </h3>

          <div className="space-y-2 mb-4">
            {participants.map((p) => (
              <div key={p.id} className={`flex items-center justify-between ${t.listItem}`}>
                <div className="flex items-center gap-3">
                  <div className={t.participantBadgeAvatar} aria-hidden="true">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <span className={`font-medium ${t.heading}`}>
                    {p.name}
                    {p.id === currentUser.id && (
                      <span className={`ml-2 text-xs ${t.muted}`}>(you)</span>
                    )}
                  </span>
                </div>
                {p.id !== currentUser.id && (
                  <button
                    onClick={() => onRemoveParticipant(p.id)}
                    className={t.btnIconDelete}
                    aria-label={`Remove ${p.name}`}
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleAddParticipant} className="flex gap-2">
            <label htmlFor="participant-name" className="sr-only">Add participant name</label>
            <input
              id="participant-name"
              type="text"
              value={newParticipantName}
              onChange={(e) => setNewParticipantName(e.target.value)}
              placeholder="Add a participant..."
              className={`flex-1 ${t.input}`}
              maxLength={50}
              autoFocus
            />
            <button
              type="submit"
              disabled={!newParticipantName.trim()}
              className={`px-4 py-2 flex items-center gap-1 ${
                newParticipantName.trim() ? t.btnSmall : t.btnPrimaryDisabled
              }`}
              aria-label="Add participant"
            >
              <UserPlus className="w-4 h-4" aria-hidden="true" />
              Add
            </button>
          </form>
        </div>

        <div className="text-center">
          <button
            onClick={onNextPhase}
            className={`py-4 px-8 text-lg flex items-center gap-2 mx-auto ${t.btnPrimary}`}
          >
            Start Brainstorming
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};
