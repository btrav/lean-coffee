import React, { useState } from 'react';
import { Heart, ArrowRight, Trophy, X } from 'lucide-react';
import { Topic, User } from '../types';
import { TopicCard } from './TopicCard';
import { StepTransition } from './StepTransition';
import { ProgressIndicator } from './ProgressIndicator';
import { PhaseTimer } from './PhaseTimer';

interface VotingPhaseProps {
  topics: Topic[];
  currentUser: User;
  participants: User[];
  votesPerPerson: number;
  onVote: (topicId: string) => void;
  onNextPhase: () => void;
  onUpdateVotesPerPerson: (votes: number) => void;
  phaseStartTime?: number;
  phaseTimeLimit?: number;
}

export const VotingPhase: React.FC<VotingPhaseProps> = ({
  topics,
  currentUser,
  participants,
  votesPerPerson,
  onVote,
  onNextPhase,
  onUpdateVotesPerPerson,
  phaseStartTime,
  phaseTimeLimit,
}) => {
  const [step, setStep] = useState(0);
  const [confirmingAdvance, setConfirmingAdvance] = useState(false);

  const userVotes = topics.filter(topic => topic.votes.includes(currentUser.id)).length;
  const canVote = userVotes < votesPerPerson;
  const sortedTopics = [...topics].sort((a, b) => b.votes.length - a.votes.length);
  const totalVotes = topics.reduce((sum, topic) => sum + topic.votes.length, 0);

  const handleVote = (topicId: string) => {
    const topic = topics.find(t => t.id === topicId);
    if (!topic) return;
    const hasVoted = topic.votes.includes(currentUser.id);
    if (hasVoted || canVote) {
      onVote(topicId);
    }
  };

  const stepLabels = ['Vote on Topics', 'Review Results'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-6">
      <PhaseTimer
        phaseStartTime={phaseStartTime}
        phaseTimeLimit={phaseTimeLimit}
        phaseName="Voting"
      />

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-400 to-red-500 rounded-3xl mb-4 shadow-lg">
            <Heart className="w-8 h-8 text-white fill-current" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Voting Phase</h1>
          <p className="text-xl text-gray-600">Vote for the topics you want to discuss</p>
          <p className="text-sm text-gray-500 mt-2">{participants.length} participant{participants.length !== 1 ? 's' : ''}</p>
        </div>

        <ProgressIndicator
          currentStep={step}
          totalSteps={2}
          stepLabels={stepLabels}
        />

        <div className="bg-white rounded-3xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-pink-600">{userVotes}</div>
              <div className="text-sm text-gray-600">Your Votes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{votesPerPerson}</div>
              <div className="text-sm text-gray-600">Votes Allowed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{totalVotes}</div>
              <div className="text-sm text-gray-600">Total Votes</div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <label htmlFor="votes-slider" className="block text-sm font-medium text-gray-700 mb-2">
              Votes per person: <span className="font-bold text-blue-600">{votesPerPerson}</span>
            </label>
            <input
              id="votes-slider"
              type="range"
              min="2"
              max="10"
              value={votesPerPerson}
              onChange={(e) => onUpdateVotesPerPerson(parseInt(e.target.value))}
              className="w-full h-2 bg-pink-200 rounded-lg appearance-none cursor-pointer"
              aria-label="Votes per person"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>2</span>
              <span>10</span>
            </div>
          </div>
        </div>

        <StepTransition isActive={step === 0}>
          <div className="space-y-6">
            {topics.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-gray-100">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" aria-hidden="true" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No topics to vote on</h3>
                <p className="text-gray-500">No topics were added in the brainstorming phase.</p>
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
                        onVote={handleVote}
                        canVote={canVote || topic.votes.includes(currentUser.id)}
                        hasVoted={topic.votes.includes(currentUser.id)}
                        showVotes={true}
                      />
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    ❤️ {votesPerPerson - userVotes} vote{votesPerPerson - userVotes !== 1 ? 's' : ''} remaining
                  </p>
                  <button
                    onClick={() => setStep(1)}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 px-6 rounded-2xl font-semibold hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    View Results →
                  </button>
                </div>
              </>
            )}
          </div>
        </StepTransition>

        <StepTransition isActive={step === 1}>
          <div className="space-y-6">
            <div className="text-center">
              <button
                onClick={() => setStep(0)}
                className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium transition-colors mb-6"
              >
                ← Back to voting
              </button>
            </div>

            {sortedTopics.filter(t => t.votes.length > 0).length > 0 ? (
              <>
                <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Trophy className="w-6 h-6 text-yellow-500" aria-hidden="true" />
                    <h3 className="text-xl font-bold text-gray-800">Voting Results</h3>
                  </div>
                  <div className="space-y-3" role="list">
                    {sortedTopics.filter(t => t.votes.length > 0).map((topic, index) => (
                      <div key={topic.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl" role="listitem">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0 ? 'bg-yellow-100 text-yellow-800' :
                            index === 1 ? 'bg-gray-100 text-gray-800' :
                            index === 2 ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }`} aria-label={`Rank ${index + 1}`}>
                            {index + 1}
                          </div>
                          <span className="font-medium text-gray-800">{topic.text}</span>
                        </div>
                        <div className="flex items-center gap-1 text-pink-600 font-bold">
                          <Heart className="w-4 h-4 fill-current" aria-hidden="true" />
                          {topic.votes.length}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                  {!confirmingAdvance ? (
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Ready to discuss?</h3>
                      <p className="text-gray-600 mb-6">
                        {sortedTopics.filter(t => t.votes.length > 0).length} topic{sortedTopics.filter(t => t.votes.length > 0).length !== 1 ? 's' : ''} received votes
                      </p>
                      <button
                        onClick={() => setConfirmingAdvance(true)}
                        className="bg-gradient-to-r from-green-500 to-blue-600 text-white py-4 px-8 rounded-2xl font-semibold text-lg hover:from-green-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center gap-2 mx-auto"
                      >
                        Start Discussion Phase
                        <ArrowRight className="w-5 h-5" aria-hidden="true" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Start discussion now?</h3>
                      <p className="text-gray-600 mb-6">Votes are locked in — you won't be able to change them.</p>
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
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-2xl hover:from-green-600 hover:to-blue-700 transition-all duration-200 shadow-lg font-semibold"
                        >
                          Yes, start discussion
                          <ArrowRight className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-gray-100">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" aria-hidden="true" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No votes yet</h3>
                <p className="text-gray-500 mb-6">Cast some votes before moving to discussion</p>
                <button
                  onClick={() => setStep(0)}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 px-6 rounded-2xl font-semibold hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Back to Voting
                </button>
              </div>
            )}
          </div>
        </StepTransition>
      </div>
    </div>
  );
};
