import React, { useState } from 'react';
import { Heart, ArrowRight, Trophy, X } from 'lucide-react';
import { Topic, User } from '../types';
import { useTheme } from '../context/ThemeContext';
import { TopicCard } from './TopicCard';
import { StepTransition } from './StepTransition';
import { ProgressIndicator } from './ProgressIndicator';
import { PhaseTimer } from './PhaseTimer';

interface VotingPhaseProps {
  topics: Topic[];
  currentUser: User;
  participants: User[];
  votesPerPerson: number;
  onAddVote: (topicId: string) => void;
  onRemoveVote: (topicId: string) => void;
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
  onAddVote,
  onRemoveVote,
  onNextPhase,
  onUpdateVotesPerPerson,
  phaseStartTime,
  phaseTimeLimit,
}) => {
  const { theme: t } = useTheme();
  const [step, setStep] = useState(0);
  const [confirmingAdvance, setConfirmingAdvance] = useState(false);

  const userVotes = topics.reduce(
    (sum, topic) => sum + topic.votes.filter(id => id === currentUser.id).length, 0
  );
  const canVote = userVotes < votesPerPerson;
  const sortedTopics = [...topics].sort((a, b) => b.votes.length - a.votes.length);
  const totalVotes = topics.reduce((sum, topic) => sum + topic.votes.length, 0);

  const userVotesForTopic = (topicId: string) => {
    const topic = topics.find(t => t.id === topicId);
    return topic ? topic.votes.filter(id => id === currentUser.id).length : 0;
  };

  const stepLabels = ['Vote on Topics', 'Review Results'];

  return (
    <div className={t.page}>
      <PhaseTimer
        phaseStartTime={phaseStartTime}
        phaseTimeLimit={phaseTimeLimit}
        phaseName="Voting"
      />

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className={t.iconBubble}>
            <Heart className="w-8 h-8 text-white fill-current" aria-hidden="true" />
          </div>
          <h1 className={`text-3xl font-bold ${t.heading} mb-2`}>Voting Phase</h1>
          <p className={`text-xl ${t.body}`}>Vote for the topics you want to discuss</p>
          <p className={`text-sm ${t.muted} mt-2`}>{participants.length} participant{participants.length !== 1 ? 's' : ''}</p>
        </div>

        <ProgressIndicator
          currentStep={step}
          totalSteps={2}
          stepLabels={stepLabels}
        />

        <div className={`${t.card} mb-8`}>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className={`text-2xl font-bold ${t.voteColor}`}>{userVotes}</div>
              <div className={`text-sm ${t.body}`}>Your Votes</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${t.accent}`}>{votesPerPerson}</div>
              <div className={`text-sm ${t.body}`}>Votes Allowed</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${t.heading}`}>{totalVotes}</div>
              <div className={`text-sm ${t.body}`}>Total Votes</div>
            </div>
          </div>

          <div className={`mt-4 pt-4 ${t.divider}`}>
            <label htmlFor="votes-slider" className={`block text-sm font-medium ${t.heading} mb-2`}>
              Votes per person: <span className={`font-bold ${t.accent}`}>{votesPerPerson}</span>
            </label>
            <input
              id="votes-slider"
              type="range"
              min="2"
              max="10"
              value={votesPerPerson}
              onChange={(e) => onUpdateVotesPerPerson(parseInt(e.target.value))}
              className={t.slider}
              aria-label="Votes per person"
            />
            <div className={`flex justify-between text-xs ${t.muted} mt-1`}>
              <span>2</span>
              <span>10</span>
            </div>
          </div>
        </div>

        <StepTransition isActive={step === 0}>
          <div className="space-y-6">
            {topics.length === 0 ? (
              <div className={`${t.card} text-center`}>
                <Heart className={`w-16 h-16 ${t.muted} mx-auto mb-4`} aria-hidden="true" />
                <h3 className={`text-xl font-semibold ${t.body} mb-2`}>No topics to vote on</h3>
                <p className={t.muted}>No topics were added in the brainstorming phase.</p>
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
                        onAddVote={onAddVote}
                        onRemoveVote={onRemoveVote}
                        canAddVote={canVote}
                        userVoteCount={userVotesForTopic(topic.id)}
                        showVotes={true}
                      />
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <p className={`${t.body} mb-4`}>
                    ❤️ {votesPerPerson - userVotes} vote{votesPerPerson - userVotes !== 1 ? 's' : ''} remaining
                  </p>
                  <button
                    onClick={() => setStep(1)}
                    className={`py-3 px-6 ${t.btnPrimary}`}
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
                className={`inline-flex items-center gap-2 ${t.btnGhost} mb-6`}
              >
                ← Back to voting
              </button>
            </div>

            {sortedTopics.filter(t => t.votes.length > 0).length > 0 ? (
              <>
                <div className={`${t.card} mb-6`}>
                  <div className="flex items-center gap-3 mb-4">
                    <Trophy className="w-6 h-6 text-yellow-500" aria-hidden="true" />
                    <h3 className={`text-xl font-bold ${t.heading}`}>Voting Results</h3>
                  </div>
                  <div className="space-y-3" role="list">
                    {sortedTopics.filter(topic => topic.votes.length > 0).map((topic, index) => (
                      <div key={topic.id} className={`flex items-center justify-between ${t.listItem}`} role="listitem">
                        <div className="flex items-center gap-3">
                          <div className={t.rankBadge(index + 1)} aria-label={`Rank ${index + 1}`}>
                            {index + 1}
                          </div>
                          <span className={`font-medium ${t.heading}`}>{topic.text}</span>
                        </div>
                        <div className={`flex items-center gap-1 ${t.voteColor} font-bold`}>
                          <Heart className="w-4 h-4 fill-current" aria-hidden="true" />
                          {topic.votes.length}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={t.card}>
                  {!confirmingAdvance ? (
                    <div className="text-center">
                      <h3 className={`text-xl font-bold ${t.heading} mb-2`}>Ready to discuss?</h3>
                      <p className={`${t.body} mb-6`}>
                        {sortedTopics.filter(topic => topic.votes.length > 0).length} topic{sortedTopics.filter(topic => topic.votes.length > 0).length !== 1 ? 's' : ''} received votes
                      </p>
                      <button
                        onClick={() => setConfirmingAdvance(true)}
                        className={`py-4 px-8 text-lg flex items-center gap-2 mx-auto ${t.btnConfirm}`}
                      >
                        Start Discussion Phase
                        <ArrowRight className="w-5 h-5" aria-hidden="true" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <h3 className={`text-xl font-bold ${t.heading} mb-2`}>Start discussion now?</h3>
                      <p className={`${t.body} mb-6`}>Votes are locked in — you won't be able to change them.</p>
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
                          Yes, start discussion
                          <ArrowRight className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className={`${t.card} text-center`}>
                <Heart className={`w-16 h-16 ${t.muted} mx-auto mb-4`} aria-hidden="true" />
                <h3 className={`text-xl font-semibold ${t.body} mb-2`}>No votes yet</h3>
                <p className={`${t.muted} mb-6`}>Cast some votes before moving to discussion</p>
                <button
                  onClick={() => setStep(0)}
                  className={`py-3 px-6 ${t.btnPrimary}`}
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
