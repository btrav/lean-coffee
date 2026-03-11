import React, { useState } from 'react';
import { Plus, Lightbulb, ArrowRight, UserPlus, Users, X } from 'lucide-react';
import { Topic, User } from '../types';
import { TopicCard } from './TopicCard';
import { StepTransition } from './StepTransition';
import { ProgressIndicator } from './ProgressIndicator';
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
  const [step, setStep] = useState(0);
  const [newTopic, setNewTopic] = useState('');
  const [showAnimation, setShowAnimation] = useState(false);
  const [confirmingAdvance, setConfirmingAdvance] = useState(false);
  const [newParticipantName, setNewParticipantName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTopic.trim();
    if (!trimmed) return;
    onAddTopic(trimmed);
    setNewTopic('');
    setShowAnimation(true);
    setTimeout(() => setShowAnimation(false), 1000);
  };

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newParticipantName.trim();
    if (!name) return;
    onAddParticipant(name);
    setNewParticipantName('');
  };

  const stepLabels = ['Add Topics', 'Review & Continue'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <PhaseTimer
        phaseStartTime={phaseStartTime}
        phaseTimeLimit={phaseTimeLimit}
        phaseName="Brainstorming"
      />

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl mb-4 shadow-lg">
            <Lightbulb className="w-8 h-8 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Brainstorming Phase</h1>
          <p className="text-xl text-gray-600">Share your discussion topics</p>
          <p className="text-sm text-gray-500 mt-2">{participants.length} participant{participants.length !== 1 ? 's' : ''}</p>
        </div>

        <ProgressIndicator currentStep={step} totalSteps={2} stepLabels={stepLabels} />

        {/* Step 0: Add Topic */}
        <StepTransition isActive={step === 0}>
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">What would you like to discuss?</h2>
                <p className="text-gray-600">Add topics that matter to the team</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="new-topic" className="sr-only">New topic</label>
                  <textarea
                    id="new-topic"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    placeholder="e.g., How can we improve our sprint planning process?"
                    className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 resize-none h-32"
                    maxLength={200}
                    autoFocus
                  />
                  <div className="text-right text-sm text-gray-500 mt-2" aria-live="polite">
                    {newTopic.length}/200
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!newTopic.trim()}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-4 px-6 rounded-2xl font-semibold text-lg hover:from-green-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" aria-hidden="true" />
                  Add Topic
                </button>
              </form>

              {showAnimation && (
                <div className="mt-4 text-center" role="status" aria-live="polite">
                  <div className="inline-flex items-center gap-2 text-green-600 font-medium animate-bounce">
                    ✨ Topic added!
                  </div>
                </div>
              )}

              <div className="mt-8 text-center">
                <button
                  onClick={() => setStep(1)}
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  View all topics ({topics.length}) →
                </button>
              </div>
            </div>
          </div>
        </StepTransition>

        {/* Step 1: Review Topics */}
        <StepTransition isActive={step === 1}>
          <div className="space-y-6">
            <div className="text-center">
              <button
                onClick={() => { setConfirmingAdvance(false); setStep(0); }}
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors mb-6"
              >
                ← Add another topic
              </button>
            </div>

            {topics.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-gray-100">
                <Lightbulb className="w-16 h-16 text-gray-300 mx-auto mb-4" aria-hidden="true" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No topics yet</h3>
                <p className="text-gray-500 mb-6">Add your first discussion topic</p>
                <button
                  onClick={() => setStep(0)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-2xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Add First Topic
                </button>
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {topics.map((topic, index) => (
                    <div
                      key={topic.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      <TopicCard
                        topic={topic}
                        onEdit={onEditTopic}
                        onDelete={onDeleteTopic}
                      />
                    </div>
                  ))}
                </div>

                {/* Participants */}
                <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" aria-hidden="true" />
                    Participants ({participants.length})
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {participants.map((p) => (
                      <span key={p.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                        <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold" aria-hidden="true">
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
                      className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                      maxLength={50}
                    />
                    <button
                      type="submit"
                      disabled={!newParticipantName.trim()}
                      className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1 font-medium"
                      aria-label="Add participant"
                    >
                      <UserPlus className="w-4 h-4" aria-hidden="true" />
                      Add
                    </button>
                  </form>
                </div>

                {/* Advance phase */}
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                  {!confirmingAdvance ? (
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Ready to vote?</h3>
                      <p className="text-gray-600 mb-6">
                        {topics.length} topic{topics.length !== 1 ? 's' : ''} ready for voting
                      </p>
                      <button
                        onClick={() => setConfirmingAdvance(true)}
                        className="bg-gradient-to-r from-purple-500 to-pink-600 text-white py-4 px-8 rounded-2xl font-semibold text-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center gap-2 mx-auto"
                      >
                        Start Voting Phase
                        <ArrowRight className="w-5 h-5" aria-hidden="true" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Start voting now?</h3>
                      <p className="text-gray-600 mb-6">You won't be able to add or remove topics after this.</p>
                      <div className="flex gap-4 justify-center">
                        <button
                          onClick={() => setConfirmingAdvance(false)}
                          className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-2xl hover:border-gray-400 transition-colors font-medium"
                        >
                          <X className="w-4 h-4" aria-hidden="true" />
                          Cancel
                        </button>
                        <button
                          onClick={onNextPhase}
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-lg font-semibold"
                        >
                          Yes, start voting
                          <ArrowRight className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </StepTransition>
      </div>
    </div>
  );
};
