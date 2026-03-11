import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, ArrowRight, SkipForward, Clock, CheckCircle, Users, Edit3 } from 'lucide-react';
import { Topic, User } from '../types';
import { TopicCard } from './TopicCard';
import { Timer } from './Timer';
import { StepTransition } from './StepTransition';
import { ProgressIndicator } from './ProgressIndicator';
import { PhaseTimer } from './PhaseTimer';

interface DiscussionPhaseProps {
  topics: Topic[];
  currentUser: User;
  isHost: boolean;
  currentTopicIndex: number;
  discussionTimeLimit: number;
  onNextTopic: () => void;
  onSkipTopic: () => void;
  onUpdateTakeaways: (topicId: string, takeaways: string) => void;
  onNextPhase: () => void;
  onUpdateTopicTime: (topicId: string, timeSpent: number) => void;
  roomCode: string;
  participants: User[];
  phaseStartTime?: number;
  phaseTimeLimit?: number;
}

export const DiscussionPhase: React.FC<DiscussionPhaseProps> = ({
  topics,
  currentUser,
  isHost,
  currentTopicIndex,
  discussionTimeLimit,
  onNextTopic,
  onSkipTopic,
  onUpdateTakeaways,
  onNextPhase,
  onUpdateTopicTime,
  roomCode,
  participants,
  phaseStartTime,
  phaseTimeLimit
}) => {
  const [step, setStep] = useState(0);
  const [takeaways, setTakeaways] = useState('');
  const [showTimeUpOptions, setShowTimeUpOptions] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const takeawaysRef = useRef<string>('');

  const sortedTopics = [...topics].sort((a, b) => b.votes.length - a.votes.length)
    .filter(topic => topic.votes.length > 0);
  
  const currentTopic = sortedTopics[currentTopicIndex];
  const isLastTopic = currentTopicIndex >= sortedTopics.length - 1;
  const discussedCount = topics.filter(t => t.discussed).length;

  // Initialize takeaways from current topic
  useEffect(() => {
    if (currentTopic) {
      const initialTakeaways = currentTopic.takeaways || '';
      setTakeaways(initialTakeaways);
      takeawaysRef.current = initialTakeaways;
    }
  }, [currentTopic?.id]);

  // Update takeaways ref whenever takeaways state changes
  useEffect(() => {
    takeawaysRef.current = takeaways;
  }, [takeaways]);

  // Auto-save takeaways periodically
  useEffect(() => {
    if (!currentTopic) return;

    const interval = setInterval(() => {
      if (takeawaysRef.current !== (currentTopic.takeaways || '')) {
        onUpdateTakeaways(currentTopic.id, takeawaysRef.current);
      }
    }, 2000); // Auto-save every 2 seconds

    return () => clearInterval(interval);
  }, [currentTopic?.id, onUpdateTakeaways]);

  const handleTimeUp = () => {
    setShowTimeUpOptions(true);
    setIsTimerRunning(false);
  };

  const handleContinueDiscussion = () => {
    setShowTimeUpOptions(false);
    setIsTimerRunning(true);
  };

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

  const handleTimeUpdate = (timeSpent: number) => {
    if (currentTopic) {
      onUpdateTopicTime(currentTopic.id, timeSpent);
    }
  };

  const handleTakeawaysChange = (value: string) => {
    setTakeaways(value);
    takeawaysRef.current = value;
  };

  const stepLabels = ['Discussion', 'Key Takeaways'];

  if (!currentTopic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-gray-100">
          <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-800 mb-4">All topics discussed!</h2>
          <p className="text-xl text-gray-600">Ready to wrap up the session.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
      <PhaseTimer
        phaseStartTime={phaseStartTime}
        phaseTimeLimit={phaseTimeLimit}
        phaseName="Discussion"
      />
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-3xl mb-4 shadow-lg">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Discussion Phase</h1>
          <p className="text-xl text-gray-600">
            Topic {currentTopicIndex + 1} of {sortedTopics.length}
          </p>
          
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

        {/* Progress Bar */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">
              Progress: {discussedCount} discussed, {sortedTopics.length - currentTopicIndex - 1} remaining
            </div>
            <div className="text-sm text-gray-600">
              {Math.round(((currentTopicIndex + 1) / sortedTopics.length) * 100)}% complete
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${((currentTopicIndex + 1) / sortedTopics.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 0: Discussion */}
        <StepTransition isActive={step === 0}>
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Current Topic */}
            <div className="space-y-6">
              <TopicCard
                topic={currentTopic}
                currentUser={currentUser}
                showVotes={true}
                isDiscussion={true}
                rank={currentTopicIndex + 1}
              />

              {/* Host Controls */}
              {isHost && !showTimeUpOptions && (
                <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
                  <h3 className="font-semibold text-gray-800 mb-4">Discussion Controls</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setStep(1)}
                      className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 font-semibold"
                    >
                      <Edit3 className="w-5 h-5" />
                      Add Key Takeaways
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={handleMoveOn}
                        className="px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Complete
                      </button>
                      <button
                        onClick={handleSkip}
                        className="px-4 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 font-medium"
                      >
                        <SkipForward className="w-4 h-4" />
                        Skip
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Time Up Options */}
              {showTimeUpOptions && isHost && (
                <div className="bg-white rounded-3xl shadow-xl p-6 border-2 border-orange-300">
                  <h3 className="font-semibold text-orange-800 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Time's Up! What would you like to do?
                  </h3>
                  <div className="space-y-3">
                    <button
                      onClick={handleContinueDiscussion}
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                    >
                      Continue Discussion
                    </button>
                    <button
                      onClick={handleMoveOn}
                      className="w-full px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
                    >
                      Move to Next Topic
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Timer */}
            <div>
              <Timer
                initialTime={discussionTimeLimit}
                onTimeUp={handleTimeUp}
                isRunning={isTimerRunning}
                onExtend={() => {}}
                onTimeUpdate={handleTimeUpdate}
              />
            </div>
          </div>
        </StepTransition>

        {/* Step 1: Takeaways */}
        <StepTransition isActive={step === 1}>
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Key Takeaways & Next Steps</h2>
                <p className="text-gray-600">What are the important outcomes from this discussion?</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Topic: {currentTopic.text}
                  </label>
                  <textarea
                    value={takeaways}
                    onChange={(e) => handleTakeawaysChange(e.target.value)}
                    placeholder="• Key insights discovered&#10;• Decisions made&#10;• Action items and next steps&#10;• Questions to explore further"
                    className="w-full h-48 p-6 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 resize-none"
                  />
                  <div className="text-sm text-gray-500 mt-2">
                    💡 Capture insights while they're fresh in your mind
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(0)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 transition-colors font-medium"
                  >
                    ← Back to Discussion
                  </button>
                  <button
                    onClick={handleMoveOn}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium flex items-center justify-center gap-2"
                  >
                    {isLastTopic ? 'Complete Session' : 'Next Topic'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </StepTransition>

        {/* Instructions for non-hosts */}
        {!isHost && (
          <div className="bg-green-50 rounded-3xl p-6 border border-green-200 text-center mt-8">
            <p className="text-green-700">
              💬 Discussion in progress... The host will manage the timer and transitions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};