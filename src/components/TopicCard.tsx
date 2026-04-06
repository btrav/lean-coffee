import React from 'react';
import { Heart, Edit2, Trash2, MessageSquare, Plus, Minus } from 'lucide-react';
import { Topic } from '../types';
import { useTheme } from '../context/ThemeContext';

interface TopicCardProps {
  topic: Topic;
  onAddVote?: (topicId: string) => void;
  onRemoveVote?: (topicId: string) => void;
  onEdit?: (topicId: string, newText: string) => void;
  onDelete?: (topicId: string) => void;
  canAddVote?: boolean;
  userVoteCount?: number;
  showVotes?: boolean;
  isDiscussion?: boolean;
  rank?: number;
}

export const TopicCard: React.FC<TopicCardProps> = ({
  topic,
  onAddVote,
  onRemoveVote,
  onEdit,
  onDelete,
  canAddVote = false,
  userVoteCount = 0,
  showVotes = false,
  isDiscussion = false,
  rank,
}) => {
  const { theme: t } = useTheme();
  const [isEditing, setIsEditing] = React.useState(false);
  const [editText, setEditText] = React.useState(topic.text);

  const handleEdit = () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== topic.text) {
      onEdit?.(topic.id, trimmed);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleEdit();
    } else if (e.key === 'Escape') {
      setEditText(topic.text);
      setIsEditing(false);
    }
  };

  const voteCount = topic.votes.length;
  const hasVoted = userVoteCount > 0;

  return (
    <div className={isDiscussion ? t.cardActive : t.card}>
      {rank !== undefined && (
        <div className="flex items-center justify-between mb-4">
          <div className={t.rankBadge(rank)} aria-label={`Rank ${rank}`}>
            {rank}
          </div>
          {topic.discussed && (
            <span className={t.discussedBadge}>
              Discussed
            </span>
          )}
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {isEditing ? (
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleEdit}
              onKeyDown={handleKeyDown}
              className={`${t.textarea} !p-3`}
              autoFocus
              rows={3}
              aria-label="Edit topic text"
            />
          ) : (
            <p className={`${t.heading} font-medium leading-relaxed mb-3 text-lg`}>
              {topic.text}
            </p>
          )}

          <div className="flex items-center justify-between">
            <span className={`text-sm ${t.muted} font-medium`}>
              by {topic.authorName}
            </span>

            {showVotes && (
              <div className={`flex items-center gap-1 text-sm font-bold ${
                voteCount > 0 ? t.voteColor : t.voteColorMuted
              }`} aria-label={`${voteCount} vote${voteCount !== 1 ? 's' : ''}`}>
                <Heart className={`w-4 h-4 ${voteCount > 0 ? 'fill-current' : ''}`} aria-hidden="true" />
                {voteCount}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {onAddVote && onRemoveVote && (
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => onAddVote(topic.id)}
                disabled={!canAddVote}
                className={canAddVote ? t.btnIconVoteInactive : `${t.btnIconVoteInactive} opacity-30 cursor-not-allowed`}
                aria-label="Add vote"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
              </button>
              <span className={`text-sm font-bold ${hasVoted ? t.voteColor : t.voteColorMuted}`}>
                {userVoteCount}
              </span>
              <button
                onClick={() => onRemoveVote(topic.id)}
                disabled={!hasVoted}
                className={hasVoted ? t.btnIconVoteActive : `${t.btnIconVoteActive} opacity-30 cursor-not-allowed`}
                aria-label="Remove vote"
              >
                <Minus className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          )}

          {onEdit && !isDiscussion && (
            <button
              onClick={() => setIsEditing(true)}
              className={t.btnIconEdit}
              aria-label="Edit topic"
            >
              <Edit2 className="w-5 h-5" aria-hidden="true" />
            </button>
          )}

          {onDelete && !isDiscussion && (
            <button
              onClick={() => onDelete(topic.id)}
              className={t.btnIconDelete}
              aria-label="Delete topic"
            >
              <Trash2 className="w-5 h-5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {isDiscussion && topic.timeSpent > 0 && (
        <div className={`mt-4 pt-4 ${t.divider}`}>
          <div className={`flex items-center gap-2 text-sm ${t.body}`}>
            <MessageSquare className="w-4 h-4" aria-hidden="true" />
            <span>
              Time spent: {Math.floor(topic.timeSpent / 60)}:{(topic.timeSpent % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
