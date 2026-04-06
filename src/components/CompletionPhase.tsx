import React from 'react';
import { CheckCircle, Download, RotateCcw, Copy, Users, Clock, Trophy } from 'lucide-react';
import { Topic, User } from '../types';
import { useTheme } from '../context/ThemeContext';
import { exportSummary } from '../utils/roomManager';

interface CompletionPhaseProps {
  topics: Topic[];
  participants: User[];
  roomCode: string;
  onReset: () => void;
}

export const CompletionPhase: React.FC<CompletionPhaseProps> = ({
  topics,
  participants,
  roomCode,
  onReset,
}) => {
  const { theme: t } = useTheme();
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

  // Confetti is created imperatively because each piece needs a unique random
  // delay and duration — values that can't be expressed with static Tailwind classes.
  // The cleanup removes all DOM nodes and timers if the component unmounts early.
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
      // Remove each piece individually once its animation finishes
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

  const statItems = [
    { icon: CheckCircle, color: t.successText, bgColor: t.successBg, value: discussedTopics.length, label: 'Topics Discussed' },
    { icon: Trophy, color: t.warningText, bgColor: t.warningBg, value: skippedTopics.length, label: 'Topics Skipped' },
    { icon: Clock, color: t.accent, bgColor: t.accentBg, value: formatTime(totalTimeSpent), label: 'Total Time' },
    { icon: Users, color: t.accent, bgColor: t.accentBg, value: participants.length, label: 'Participants' },
  ];

  return (
    <div className={t.page}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className={t.iconBubble}>
            <CheckCircle className="w-10 h-10 text-white" aria-hidden="true" />
          </div>
          <h1 className={`text-4xl font-bold ${t.heading} mb-3`}>Session Complete!</h1>
          <p className={`text-xl ${t.body}`}>Great discussion, everyone!</p>
        </div>

        <div className={`${t.card} mb-8`}>
          <h2 className={`text-2xl font-bold ${t.heading} mb-6 text-center`}>Session Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {statItems.map((item) => (
              <div key={item.label} className="text-center">
                <div className={`w-14 h-14 ${item.bgColor} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  <item.icon className={`w-7 h-7 ${item.color}`} aria-hidden="true" />
                </div>
                <div className={`text-3xl font-bold ${item.color}`}>{item.value}</div>
                <div className={`text-sm ${t.body}`}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={`${t.card} mb-8`}>
          <h3 className={`text-xl font-bold ${t.heading} mb-6 text-center`}>Export Summary</h3>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={handleExport}
              className={`flex items-center gap-3 px-6 py-4 ${t.btnPrimary}`}
            >
              <Download className="w-5 h-5" aria-hidden="true" />
              Download Summary
            </button>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-3 px-6 py-4 ${t.btnSecondary}`}
            >
              <Copy className="w-5 h-5" aria-hidden="true" />
              Copy to Clipboard
            </button>
            <button
              onClick={onReset}
              className={`flex items-center gap-3 px-6 py-4 ${t.btnConfirm}`}
            >
              <RotateCcw className="w-5 h-5" aria-hidden="true" />
              Start New Session
            </button>
          </div>
        </div>

        {participants.length > 0 && (
          <div className={`${t.card} mb-8`}>
            <h3 className={`text-xl font-bold ${t.heading} mb-6 flex items-center gap-2`}>
              <Users className={`w-6 h-6 ${t.accent}`} aria-hidden="true" />
              Participants
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {participants.map((participant) => (
                <div key={participant.id} className={`flex items-center gap-3 ${t.listItem}`}>
                  <div className={t.avatar} aria-hidden="true">
                    {participant.name.charAt(0).toUpperCase()}
                  </div>
                  <div className={`font-medium ${t.heading}`}>{participant.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {discussedTopics.length > 0 && (
          <div className={`${t.card} mb-8`}>
            <h3 className={`text-xl font-bold ${t.heading} mb-6 flex items-center gap-2`}>
              <CheckCircle className={`w-6 h-6 ${t.successText}`} aria-hidden="true" />
              Discussed Topics
            </h3>
            <div className="space-y-6">
              {discussedTopics.map((topic, index) => (
                <div key={topic.id} className={`${t.listItem} !p-6 border border-gray-100`}>
                  <div className="flex items-start justify-between mb-4">
                    <h4 className={`text-lg font-semibold ${t.heading}`}>
                      {index + 1}. {topic.text}
                    </h4>
                    <div className={`text-sm ${t.muted} text-right shrink-0 ml-4`}>
                      <div>{topic.votes.length} vote{topic.votes.length !== 1 ? 's' : ''}</div>
                      <div>{formatTime(topic.timeSpent)}</div>
                    </div>
                  </div>
                  <div className={`text-sm ${t.body} mb-4`}>by {topic.authorName}</div>
                  {topic.takeaways && (
                    <div className={t.infoBox}>
                      <div className={`text-sm font-medium ${t.accent} mb-2`}>Key Takeaways:</div>
                      <div className={`text-sm ${t.body} whitespace-pre-wrap`}>{topic.takeaways}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {skippedTopics.length > 0 && (
          <div className={t.card}>
            <h3 className={`text-xl font-bold ${t.heading} mb-6 flex items-center gap-2`}>
              <RotateCcw className={`w-6 h-6 ${t.warningText}`} aria-hidden="true" />
              Topics Not Discussed
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {skippedTopics.map((topic) => (
                <div key={topic.id} className={t.listItem}>
                  <div className={`font-medium ${t.heading} mb-2`}>{topic.text}</div>
                  <div className={`text-sm ${t.body}`}>
                    by {topic.authorName} · {topic.votes.length} vote{topic.votes.length !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
            <div className={`mt-4 text-sm ${t.muted} text-center`}>
              Consider these topics for your next Lean Coffee session
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
