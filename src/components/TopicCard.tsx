import React from 'react';
import { Heart, Edit2, Trash2, MessageSquare } from 'lucide-react';
import { Topic, User } from '../types';

interface TopicCardProps {
  topic: Topic;
  currentUser: User;
  onVote?: (topicId: string) => void;
  onEdit?: (topicId: string, newText: string) => void;
  onDelete?: (topicId: string) => void;
  canVote?: boolean;
  hasVoted?: boolean;
  showVotes?: boolean;
  isDiscussion?: boolean;
  rank?: number;
}

export const TopicCard: React.FC<TopicCardProps> = ({
  topic,
  currentUser,
  onVote,
  onEdit,
  onDelete,
  canVote = false,
  hasVoted = false,
  showVotes = false,
  isDiscussion = false,
  rank
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editText, setEditText] = React.useState(topic.text);

  const handleEdit = () => {
    if (editText.trim() && editText !== topic.text) {
      onEdit?.(topic.id, editText.trim());
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEdit();
    } else if (e.key === 'Escape') {
      setEditText(topic.text);
      setIsEditing(false);
    }
  };

  const isOwner = topic.authorId === currentUser.id;
  const voteCount = topic.votes.length;

  return (
    <div className={`bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl transform hover:scale-[1.02] ${
      isDiscussion ? 'border-blue-300 shadow-xl scale-105' : 'border-gray-100 hover:border-blue-200'
    }`}>
      <div className="p-6">
        {rank && (
          <div className="flex items-center justify-between mb-4">
            <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
              rank === 1 ? 'bg-yellow-100 text-yellow-800' :
              rank === 2 ? 'bg-gray-100 text-gray-800' :
              rank === 3 ? 'bg-orange-100 text-orange-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {rank}
            </div>
            {topic.discussed && (
              <span className="text-xs text-green-600 bg-green-100 px-3 py-1 rounded-full font-medium">
                ✅ Discussed
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
                onKeyDown={handleKeyPress}
                className="w-full p-3 border-2 border-blue-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 resize-none"
                autoFocus
                rows={3}
              />
            ) : (
              <p className="text-gray-800 font-medium leading-relaxed mb-3 text-lg">
                {topic.text}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 font-medium">
                by {topic.authorName}
              </span>
              
              {showVotes && (
                <div className={`flex items-center gap-1 text-sm font-bold ${
                  voteCount > 0 ? 'text-pink-600' : 'text-gray-400'
                }`}>
                  <Heart className={`w-4 h-4 ${voteCount > 0 ? 'fill-current' : ''}`} />
                  {voteCount}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {canVote && onVote && (
              <button
                onClick={() => onVote(topic.id)}
                disabled={hasVoted}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  hasVoted
                    ? 'bg-pink-100 text-pink-600 cursor-not-allowed scale-110'
                    : 'bg-gray-100 text-gray-600 hover:bg-pink-100 hover:text-pink-600 hover:scale-110 active:scale-95'
                }`}
                title={hasVoted ? 'Already voted' : 'Vote for this topic'}
              >
                <Heart className={`w-5 h-5 ${hasVoted ? 'fill-current' : ''}`} />
              </button>
            )}
            
            {isOwner && onEdit && !isDiscussion && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-all duration-200 hover:scale-110 active:scale-95"
                title="Edit topic"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            )}
            
            {isOwner && onDelete && !isDiscussion && (
              <button
                onClick={() => onDelete(topic.id)}
                className="p-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 transition-all duration-200 hover:scale-110 active:scale-95"
                title="Delete topic"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {isDiscussion && topic.timeSpent > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MessageSquare className="w-4 h-4" />
              <span>
                Time spent: {Math.floor(topic.timeSpent / 60)}:
                {(topic.timeSpent % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};