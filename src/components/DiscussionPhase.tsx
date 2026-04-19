import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, ArrowRight, SkipForward, Clock, CheckCircle, Edit3 } from 'lucide-react';
import { Topic, User, totalVotesForTopic } from '../types';
import { useTheme } from '../context/ThemeContext';
import { TopicCard } from './TopicCard';
import { Timer } from './Timer';
import { StepTransition } from './StepTransition';
import { ProgressIndicator } from './ProgressIndicator';
import { PhaseTimer } from './PhaseTimer';

interface DiscussionPhaseProps {
  topics: Topic[];
  participants: User[];
  currentTopicIndex: number;
  discussionTimeLimit: number;
  onNextTopic: () => void;
  onSkipTopic: () => void;
  onUpdateTakeaways: (topicId: string, takeaways: string) => void;
  onNextPhase: () => void;
  onUpdateTopicTime: (topicId: string, timeSpent: number) => void;
  phaseStartTime?: number;
  phaseTimeLimit?: number;
}

export const DiscussionPhase: React.FC<DiscussionPhaseProps> = ({
  topics,
  participants,
  currentTopicIndex,
  discussionTimeLimit,
  onNextTopic,
  onSkipTopic,
  onUpdateTakeaways,
  onNextPhase,
  onUpdateTopicTime,
  phaseStartTime,
  phaseTimeLimit,
}) => {
  const { theme: t } = useTheme();
  const [step, setStep] = useState(0);
  const [takeaways, setTakeaways] = useState('');
  const [showTimeUpOptions, setShowTimeUpOptions] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  // Ref mirrors the takeaways state so the auto-save interval can read the
  // latest value without needing to re-register on every keystroke
  const takeawaysRef = useRef<string>('');

  const sortedTopics = [...topics]
    .sort((a, b) => totalVotesForTopic(b) - totalVotesForTopic(a))
    .filter(topic => totalVotesForTopic(topic) > 0);

  const currentTopic = sortedTopics[currentTopicIndex];
  const isLastTopic = currentTopicIndex >= sortedTopics.length - 1;
  const discussedCount = topics.filter(t => t.discussed).length;

  useEffect(() => {
    if (currentTopic) {
      const initial = currentTopic.takeaways || '';
      setTakeaways(initial);
      takeawaysRef.current = initial;
    }
    setShowTimeWarning(false);
  }, [currentTopic?.id]);

  useEffect(() => {
    takeawaysRef.current = takeaways;
  }, [takeaways]);

  // Auto-save takeaways every 2 seconds, but only when the value has actually changed
  useEffect(() => {
    if (!currentTopic) return;
    const interval = setInterval(() => {
      if (takeawaysRef.current !== (currentTopic.takeaways || '')) {
        onUpdateTakeaways(currentTopic.id, takeawaysRef.current);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [currentTopic?.id, onUpdateTakeaways]);

  const [showTimeWarning, setShowTimeWarning] = useState(false);

  const handleTimeUp = useCallback(() => {
    setShowTimeUpOptions(true);
    setIsTimerRunning(false);
  }, []);

  const handleContinueDiscussion = useCallback(() => {
    setShowTimeUpOptions(false);
    setIsTimerRunning(true);
  }, []);

  const handleMoveOn = () => {
    if (currentTopic) {
      onUpdateTakeaways(currentTopic.id, takeawaysRef.current);
    }
    setShowTimeUpOptions(false);
    setIsTimerRunning(true);
    if (isLastTopic) {
      onNextPhase();
    } else {
      onNextTopic();
    }
  };

  const handleSkip = () => {
    setShowTimeUpOptions(false);
    setIsTimerRunning(true);
    if (isLastTopic) {
      onNextPhase();
    } else {
      onSkipTopic();
    }
  };

  const handleTimeUpdate = useCallback((timeSpent: number) => {
    if (currentTopic) {
      onUpdateTopicTime(currentTopic.id, timeSpent);
    }
  }, [currentTopic?.id, onUpdateTopicTime]);

  const handleTimeWarning = useCallback(() => {
    setShowTimeWarning(true);
  }, []);

  const stepLabels = ['Discussion', 'Key Takeaways'];

  if (!currentTopic) {
    return (
      <div className={`${t.page} flex items-center justify-center`}>
        <div className={`${t.card} text-center`}>
          <CheckCircle className={`w-20 h-20 ${t.successText} mx-auto mb-6`} aria-hidden="true" />
          <h2 className={`text-3xl font-bold ${t.heading} mb-4`}>All topics discussed!</h2>
          <p className={`text-xl ${t.body}`}>Ready to wrap up the session.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={t.page}>
      <PhaseTimer
        phaseStartTime={phaseStartTime}
        phaseTimeLimit={phaseTimeLimit}
        phaseName="Discussion"
      />

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className={t.iconBubble}>
            <MessageSquare className="w-8 h-8 text-white" aria-hidden="true" />
          </div>
          <h1 className={`text-3xl font-bold ${t.heading} mb-2`}>Discussion Phase</h1>
          <p className={`text-xl ${t.body}`}>
            Topic {currentTopicIndex + 1} of {sortedTopics.length}
          </p>
          <p className={`text-sm ${t.muted} mt-2`}>{participants.length} participant{participants.length !== 1 ? 's' : ''}</p>
        </div>

        <ProgressIndicator
          currentStep={step}
          totalSteps={2}
          stepLabels={stepLabels}
        />

        <div className={`${t.card} mb-8`} role="progressbar" aria-valuenow={currentTopicIndex + 1} aria-valuemin={1} aria-valuemax={sortedTopics.length}>
          <div className="flex items-center justify-between mb-4">
            <div className={`text-sm ${t.body}`}>
              {discussedCount} discussed · {sortedTopics.length - currentTopicIndex - 1} remaining
            </div>
            <div className={`text-sm ${t.body}`}>
              {Math.round(((currentTopicIndex + 1) / sortedTopics.length) * 100)}% complete
            </div>
          </div>
          <div className={`${t.progressTrack} h-3`}>
            <div
              className={`${t.progressFill} h-3`}
              style={{ width: `${((currentTopicIndex + 1) / sortedTopics.length) * 100}%` }}
            />
          </div>
        </div>

        <StepTransition isActive={step === 0}>
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <TopicCard
                topic={currentTopic}
                showVotes={true}
                isDiscussion={true}
                rank={currentTopicIndex + 1}
              />

              {!showTimeUpOptions && (
                <div className={t.card}>
                  <h3 className={`font-semibold ${t.heading} mb-4`}>Discussion Controls</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setStep(1)}
                      className={`w-full px-6 py-4 flex items-center justify-center gap-2 ${t.btnPrimary}`}
                    >
                      <Edit3 className="w-5 h-5" aria-hidden="true" />
                      Add Key Takeaways
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={handleMoveOn}
                        className={`px-4 py-3 flex items-center justify-center gap-2 ${t.btnConfirm}`}
                      >
                        <CheckCircle className="w-4 h-4" aria-hidden="true" />
                        Complete
                      </button>
                      <button
                        onClick={handleSkip}
                        className={`px-4 py-3 flex items-center justify-center gap-2 ${t.btnSecondary}`}
                      >
                        <SkipForward className="w-4 h-4" aria-hidden="true" />
                        Skip
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {showTimeUpOptions && (
                <div className={t.cardAlert} role="alert">
                  <h3 className={`font-semibold ${t.warningText} mb-4 flex items-center gap-2`}>
                    <Clock className="w-5 h-5" aria-hidden="true" />
                    Time's Up! What would you like to do?
                  </h3>
                  <div className="space-y-3">
                    <button
                      onClick={handleContinueDiscussion}
                      className={`w-full px-4 py-3 ${t.btnSecondary}`}
                    >
                      Continue Discussion
                    </button>
                    <button
                      onClick={handleMoveOn}
                      className={`w-full px-4 py-3 ${t.btnConfirm}`}
                    >
                      {isLastTopic ? 'Complete Session' : 'Move to Next Topic'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <Timer
                key={currentTopic.id}
                initialTime={discussionTimeLimit}
                onTimeUp={handleTimeUp}
                isRunning={isTimerRunning}
                onTimeUpdate={handleTimeUpdate}
                onTimeWarning={handleTimeWarning}
              />
            </div>
          </div>
        </StepTransition>

        <StepTransition isActive={step === 1}>
          <div className="max-w-2xl mx-auto">
            <div className={t.card}>
              <div className="text-center mb-8">
                <h2 className={`text-2xl font-bold ${t.heading} mb-2`}>Key Takeaways & Next Steps</h2>
                <p className={t.body}>What are the important outcomes from this discussion?</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label htmlFor="takeaways-input" className={`block text-sm font-medium ${t.heading} mb-3`}>
                    Topic: {currentTopic.text}
                  </label>
                  <textarea
                    id="takeaways-input"
                    value={takeaways}
                    onChange={(e) => {
                      setTakeaways(e.target.value);
                      takeawaysRef.current = e.target.value;
                    }}
                    placeholder="• Key insights discovered&#10;• Decisions made&#10;• Action items and next steps"
                    className={`${t.textarea} h-48`}
                  />
                  <div className={`text-sm ${t.muted} mt-2`}>
                    Auto-saved every 2 seconds
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(0)}
                    className={`flex-1 px-6 py-3 ${t.btnOutline}`}
                  >
                    ← Back to Discussion
                  </button>
                  <button
                    onClick={handleMoveOn}
                    className={`flex-1 px-6 py-3 flex items-center justify-center gap-2 ${t.btnConfirm}`}
                  >
                    {isLastTopic ? 'Complete Session' : 'Next Topic'}
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </StepTransition>
      </div>
    </div>
  );
};
