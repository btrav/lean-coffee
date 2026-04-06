import React, { useState } from 'react';
import { Plus, Lightbulb, ArrowRight, UserPlus, Users, X } from 'lucide-react';
import { Topic, User } from '../types';
import { useTheme } from '../context/ThemeContext';
import { TopicCard } from './TopicCard';
import { PhaseTimer } from './PhaseTimer';

interface BrainstormingPhaseProps {
  topics: Topic[];
  currentUser: User;
  participants: User[];
  onAddTopic: (text: string) => void;
  onEditTopic: (topicId: string, newText: string) => void;
  onDeleteTopic: (topicId: string) => void;
  onNextPhase: () => void;
  onAddParticipant: (name: string) => void;
  phaseStartTime?: number;
  phaseTimeLimit?: number;
}

export const BrainstormingPhase: React.FC<BrainstormingPhaseProps> = ({
  topics,
  currentUser,
  participants,
  onAddTopic,
  onEditTopic,
  onDeleteTopic,
  onNextPhase,
  onAddParticipant,
  phaseStartTime,
  phaseTimeLimit,
}) => {
  const { theme: t } = useTheme();
  const [newTopic, setNewTopic] = useState('');
  const [showAnimation, setShowAnimation] = useState(false);
  const [confirmingAdvance, setConfirmingAdvance] = useState(false);
  const [newParticipantName, setNewParticipantName] = useState('');

  const submitTopic = () => {
    const trimmed = newTopic.trim();
    if (!trimmed) return;
    onAddTopic(trimmed);
    setNewTopic('');
    setShowAnimation(true);
    setTimeout(() => setShowAnimation(false), 1000);
  };

  const handleTopicKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitTopic();
    }
  };

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newParticipantName.trim();
    if (!name) return;
    onAddParticipant(name);
    setNewParticipantName('');
  };

  return (
    <div className={t.page}>
      <PhaseTimer
        phaseStartTime={phaseStartTime}
        phaseTimeLimit={phaseTimeLimit}
        phaseName="Brainstorming"
      />

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className={t.iconBubble}>
            <Lightbulb className="w-8 h-8 text-white" aria-hidden="true" />
          </div>
          <h1 className={`text-3xl font-bold ${t.heading} mb-2`}>Brainstorming Phase</h1>
          <p className={`text-xl ${t.body}`}>What would you like to discuss?</p>
        </div>

        {/* Add topic form */}
        <div className={`${t.card} mb-6`}>
          <div className="space-y-4">
            <label htmlFor="new-topic" className="sr-only">New topic</label>
            <textarea
              id="new-topic"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              onKeyDown={handleTopicKeyDown}
              placeholder="Type a topic and press Enter to add it... (Shift+Enter for a new line)"
              className={`${t.textarea} h-24`}
              maxLength={200}
              autoFocus
            />
            <div className="flex items-center justify-between">
              <span className={`text-sm ${t.muted}`} aria-live="polite">
                {newTopic.length}/200 · Enter to add, Shift+Enter for new line
              </span>
              <button
                onClick={submitTopic}
                disabled={!newTopic.trim()}
                className={`py-3 px-6 flex items-center gap-2 ${
                  newTopic.trim() ? t.btnPrimary : t.btnPrimaryDisabled
                }`}
              >
                <Plus className="w-5 h-5" aria-hidden="true" />
                Add Topic
              </button>
            </div>
          </div>

          {showAnimation && (
            <div className="mt-3 text-center" role="status" aria-live="polite">
              <span className={`inline-flex items-center gap-2 ${t.successText} font-medium animate-bounce`}>
                ✨ Topic added!
              </span>
            </div>
          )}
        </div>

        {/* Topics grid */}
        {topics.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
            {topics.map((topic, index) => (
              <div
                key={topic.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <TopicCard
                  topic={topic}
                  onEdit={onEditTopic}
                  onDelete={onDeleteTopic}
                />
              </div>
            ))}
          </div>
        )}

        {/* Participants */}
        <div className={`${t.card} mb-6`}>
          <h3 className={`font-semibold ${t.heading} mb-4 flex items-center gap-2`}>
            <Users className={`w-5 h-5 ${t.accent}`} aria-hidden="true" />
            Participants ({participants.length})
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {participants.map((p) => (
              <span key={p.id} className={t.participantBadge}>
                <span className={t.participantBadgeAvatar} aria-hidden="true">
                  {p.name.charAt(0).toUpperCase()}
                </span>
                {p.name}
              </span>
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

        {/* Start voting */}
        {topics.length > 0 && (
          <div className={t.card}>
            {!confirmingAdvance ? (
              <div className="text-center">
                <h3 className={`text-xl font-bold ${t.heading} mb-2`}>Ready to vote?</h3>
                <p className={`${t.body} mb-6`}>
                  {topics.length} topic{topics.length !== 1 ? 's' : ''} ready for voting
                </p>
                <button
                  onClick={() => setConfirmingAdvance(true)}
                  className={`py-4 px-8 text-lg flex items-center gap-2 mx-auto ${t.btnPrimary}`}
                >
                  Start Voting Phase
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <div className="text-center">
                <h3 className={`text-xl font-bold ${t.heading} mb-2`}>Start voting now?</h3>
                <p className={`${t.body} mb-6`}>You won't be able to add or remove topics after this.</p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setConfirmingAdvance(false)}
                    className={`flex items-center gap-2 px-6 py-3 ${t.btnOutline}`}
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                    Cancel
                  </button>
                  <button
                    onClick={onNextPhase}
                    className={`flex items-center gap-2 px-6 py-3 ${t.btnConfirm}`}
                  >
                    Yes, start voting
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
