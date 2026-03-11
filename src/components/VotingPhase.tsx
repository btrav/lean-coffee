import React, { useState } from 'react';
import { Heart, ArrowRight, Users, Trophy } from 'lucide-react';
import { Topic, User } from '../types';
import { TopicCard } from './TopicCard';
import { StepTransition } from './StepTransition';
import { ProgressIndicator } from './ProgressIndicator';
import { PhaseTimer } from './PhaseTimer';

interface VotingPhaseProps {
  topics: Topic[];
  currentUser: User;
  isHost: boolean;
  votesPerPerson: number;
  onVote: (topicId: string) => void;
  onNextPhase: () => void;
  onUpdateVotesPerPerson: (votes: number) => void;
  roomCode: string;
  participants: User[];
  phaseStartTime?: number;
  phaseTimeLimit?: number;
}

export const VotingPhase: React.FC<VotingPhaseProps> = ({
  topics,
  currentUser,
  isHost,
  votesPerPerson,
  onVote,
  onNextPhase,
  onUpdateVotesPerPerson,
  roomCode,
  participants,
  phaseStartTime,
  phaseTimeLimit
}) => {
  const [step, setStep] = useState(0);
  const [selectedTopicIndex, setSelectedTopicIndex] = useState(0);

  const userVotes = topics.filter(topic => topic.votes.includes(currentUser.id)).length;
  const canVote = userVotes < votesPerPerson;
  const sortedTopics = [...topics].sort((a, b) => b.votes.length - a.votes.length);
  const totalVotes = topics.reduce((sum, topic) => sum + topic.votes.length, 0);

  const handleVote = (topicId: string) => {
    const topic = topics.find(t => t.id === topicId);
    if (!topic) return;

    const hasVoted = topic.votes.includes(currentUser.id);
    if (!hasVoted && canVote) {
      onVote(topicId);
    } else if (hasVoted) {
      onVote(topicId);
    }
  };

  const getTopicVoteStatus = (topic: Topic) => {
    return topic.votes.includes(currentUser.id);
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
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-400 to-red-500 rounded-3xl mb-4 shadow-lg">
            <Heart className="w-8 h-8 text-white fill-current" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Voting Phase</h1>
          <p className="text-xl text-gray-600">Vote for the topics you want to discuss</p>
          
          <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Room: <span className="font-mono font-bold text-blue-600">{roomCode}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              {participants.length} participants
            </div>
          </div>
        </div>

        <ProgressIndicator
          currentStep={step}
          totalSteps={2}
          stepLabels={stepLabels}
        />

        {/* Voting Stats */}
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
          
          {isHost && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Votes per person: {votesPerPerson}
              </label>
              <input
                type="range"
                min="2"
                max="10"
                value={votesPerPerson}
                onChange={(e) => onUpdateVotesPerPerson(parseInt(e.target.value))}
                className="w-full h-2 bg-pink-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>2</span>
                <span>10</span>
              </div>
            </div>
          )}
        </div>

        {/* Step 0: Voting Interface */}
        <StepTransition isActive={step === 0}>
          <div className="space-y-6">
            {topics.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-gray-100">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No topics to vote on</h3>
                <p className="text-gray-500">
                  Looks like no topics were added in the brainstorming phase.
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {topics.map((topic, index) => (
                    <div
                      key={topic.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <TopicCard
                        topic={topic}
                        currentUser={currentUser}
                        onVote={handleVote}
                        canVote={canVote || getTopicVoteStatus(topic)}
                        hasVoted={getTopicVoteStatus(topic)}
                        showVotes={true}
                      />
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    ❤️ You have {votesPerPerson - userVotes} votes remaining
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

        {/* Step 1: Results */}
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
                    <Trophy className="w-6 h-6 text-yellow-500" />
                    <h3 className="text-xl font-bold text-gray-800">Voting Results</h3>
                  </div>
                  <div className="space-y-3">
                    {sortedTopics.filter(t => t.votes.length > 0).map((topic, index) => (
                      <div key={topic.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0 ? 'bg-yellow-100 text-yellow-800' :
                            index === 1 ? 'bg-gray-100 text-gray-800' :
                            index === 2 ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {index + 1}
                          </div>
                          <span className="font-medium text-gray-800">{topic.text}</span>
                        </div>
                        <div className="flex items-center gap-1 text-pink-600 font-bold">
                          <Heart className="w-4 h-4 fill-current" />
                          {topic.votes.length}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {isHost && (
                  <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Ready to discuss?</h3>
                      <p className="text-gray-600 mb-6">
                        {sortedTopics.filter(t => t.votes.length > 0).length} topic{sortedTopics.filter(t => t.votes.length > 0).length !== 1 ? 's' : ''} received votes
                      </p>
                      <button
                        onClick={onNextPhase}
                        className="bg-gradient-to-r from-green-500 to-blue-600 text-white py-4 px-8 rounded-2xl font-semibold text-lg hover:from-green-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center gap-2 mx-auto"
                      >
                        Start Discussion Phase
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-gray-100">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No votes yet</h3>
                <p className="text-gray-500 mb-6">
                  Encourage everyone to vote for their favorite topics!
                </p>
                <button
                  onClick={() => setStep(0)}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 px-6 rounded-2xl font-semibold hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Back to Voting
                </button>
              </div>
            )}

            {!isHost && totalVotes > 0 && (
              <div className="bg-purple-50 rounded-3xl p-6 border border-purple-200 text-center">
                <p className="text-purple-700">
                  ⏳ Waiting for the host to start the discussion phase...
                </p>
              </div>
            )}
          </div>
        </StepTransition>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};