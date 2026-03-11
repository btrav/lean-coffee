import React from 'react';
import { CheckCircle, Download, RotateCcw, Copy, Users, Clock, Trophy } from 'lucide-react';
import { Topic, User } from '../types';
import { exportSummary } from '../utils/roomManager';

interface CompletionPhaseProps {
  topics: Topic[];
  currentUser: User;
  participants: User[];
  roomCode: string;
  onReset: () => void;
}

export const CompletionPhase: React.FC<CompletionPhaseProps> = ({
  topics,
  currentUser,
  participants,
  roomCode,
  onReset,
}) => {
  const discussedTopics = topics.filter(t => t.discussed);
  const skippedTopics = topics.filter(t => !t.discussed && t.votes.length > 0);
  const totalTimeSpent = discussedTopics.reduce((sum, topic) => sum + topic.timeSpent, 0);

  const handleExport = () => {
    const summary = exportSummary(topics, roomCode, participants);
    const blob = new Blob([summary], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lean-coffee-${roomCode}-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    const summary = exportSummary(topics, roomCode, participants);
    try {
      await navigator.clipboard.writeText(summary);
    } catch {
      // clipboard API unavailable
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes confetti-fall {
        0%   { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
        100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#f97316', '#ec4899'];
    const elements: HTMLDivElement[] = [];
    const timers: ReturnType<typeof setTimeout>[] = [];

    for (let i = 0; i < 60; i++) {
      const el = document.createElement('div');
      const delay = Math.random() * 2;
      const duration = 2.5 + Math.random() * 1.5;
      el.style.cssText = `
        position: fixed;
        width: ${6 + Math.random() * 8}px;
        height: ${6 + Math.random() * 8}px;
        background: ${COLORS[Math.floor(Math.random() * COLORS.length)]};
        left: ${Math.random() * 100}vw;
        top: 0;
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        animation: confetti-fall ${duration}s ${delay}s ease-in forwards;
        z-index: 1000;
        pointer-events: none;
      `;
      document.body.appendChild(el);
      elements.push(el);
      const timer = setTimeout(() => {
        if (document.body.contains(el)) document.body.removeChild(el);
      }, (delay + duration + 0.1) * 1000);
      timers.push(timer);
    }

    return () => {
      timers.forEach(clearTimeout);
      elements.forEach(el => { if (document.body.contains(el)) document.body.removeChild(el); });
      if (document.head.contains(style)) document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-3xl mb-6 shadow-lg">
            <CheckCircle className="w-10 h-10 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-3">Session Complete!</h1>
          <p className="text-xl text-gray-600">Great discussion, everyone!</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Session Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-8 h-8 text-green-600" aria-hidden="true" />
              </div>
              <div className="text-3xl font-bold text-green-600">{discussedTopics.length}</div>
              <div className="text-sm text-gray-600">Topics Discussed</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-8 h-8 text-orange-600" aria-hidden="true" />
              </div>
              <div className="text-3xl font-bold text-orange-600">{skippedTopics.length}</div>
              <div className="text-sm text-gray-600">Topics Skipped</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Clock className="w-8 h-8 text-blue-600" aria-hidden="true" />
              </div>
              <div className="text-3xl font-bold text-blue-600">{formatTime(totalTimeSpent)}</div>
              <div className="text-sm text-gray-600">Total Time</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Users className="w-8 h-8 text-purple-600" aria-hidden="true" />
              </div>
              <div className="text-3xl font-bold text-purple-600">{participants.length}</div>
              <div className="text-sm text-gray-600">Participants</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Export Summary</h3>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={handleExport}
              className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
            >
              <Download className="w-5 h-5" aria-hidden="true" />
              Download Summary
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-3 px-6 py-4 bg-gray-600 text-white rounded-2xl hover:bg-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
            >
              <Copy className="w-5 h-5" aria-hidden="true" />
              Copy to Clipboard
            </button>
            <button
              onClick={onReset}
              className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
            >
              <RotateCcw className="w-5 h-5" aria-hidden="true" />
              Start New Session
            </button>
          </div>
        </div>

        {participants.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" aria-hidden="true" />
              Participants
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {participants.map((participant) => (
                <div key={participant.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div
                    className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold"
                    aria-hidden="true"
                  >
                    {participant.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="font-medium text-gray-800">{participant.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {discussedTopics.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" aria-hidden="true" />
              Discussed Topics
            </h3>
            <div className="space-y-6">
              {discussedTopics.map((topic, index) => (
                <div key={topic.id} className="border-2 border-gray-100 rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-800">
                      {index + 1}. {topic.text}
                    </h4>
                    <div className="text-sm text-gray-500 text-right shrink-0 ml-4">
                      <div>{topic.votes.length} vote{topic.votes.length !== 1 ? 's' : ''}</div>
                      <div>{formatTime(topic.timeSpent)}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-4">by {topic.authorName}</div>
                  {topic.takeaways && (
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                      <div className="text-sm font-medium text-blue-800 mb-2">Key Takeaways:</div>
                      <div className="text-sm text-blue-700 whitespace-pre-wrap">{topic.takeaways}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {skippedTopics.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <RotateCcw className="w-6 h-6 text-orange-600" aria-hidden="true" />
              Topics Not Discussed
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {skippedTopics.map((topic) => (
                <div key={topic.id} className="border-2 border-gray-100 rounded-xl p-4">
                  <div className="font-medium text-gray-800 mb-2">{topic.text}</div>
                  <div className="text-sm text-gray-600">
                    by {topic.authorName} · {topic.votes.length} vote{topic.votes.length !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm text-gray-500 text-center">
              Consider these topics for your next Lean Coffee session
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
