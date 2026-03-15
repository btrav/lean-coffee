import React, { useReducer, useEffect } from 'react';
import { Room, User, Topic, Phase } from './types';
import { storage } from './utils/storage';
import { generateRoomCode, generateUserId } from './utils/roomManager';
import { JoinRoom } from './components/JoinRoom';
import { BrainstormingPhase } from './components/BrainstormingPhase';
import { VotingPhase } from './components/VotingPhase';
import { DiscussionPhase } from './components/DiscussionPhase';
import { CompletionPhase } from './components/CompletionPhase';

interface AppState {
  room: Room | null;
  currentUser: User | null;
}

type Action =
  | { type: 'LOAD'; room: Room; user: User }
  | { type: 'START_SESSION'; userName: string }
  | { type: 'ADD_TOPIC'; text: string }
  | { type: 'EDIT_TOPIC'; topicId: string; newText: string }
  | { type: 'DELETE_TOPIC'; topicId: string }
  | { type: 'TOGGLE_VOTE'; topicId: string }
  | { type: 'UPDATE_VOTES_PER_PERSON'; votes: number; userId: string }
  | { type: 'NEXT_PHASE' }
  | { type: 'NEXT_TOPIC' }
  | { type: 'SKIP_TOPIC' }
  | { type: 'UPDATE_TAKEAWAYS'; topicId: string; takeaways: string }
  | { type: 'UPDATE_TOPIC_TIME'; topicId: string; timeSpent: number }
  | { type: 'ADD_PARTICIPANT'; name: string }
  | { type: 'RESET' };

const PHASES: Phase[] = ['brainstorm', 'voting', 'discussion', 'completion'];

function defaultPhaseTimeLimit(phase: Phase): number | undefined {
  if (phase === 'brainstorm') return 600;
  if (phase === 'voting') return 300;
  return undefined;
}

function reducer(state: AppState, action: Action): AppState {
  const { room, currentUser } = state;

  switch (action.type) {
    case 'LOAD':
      // Reset the phase timer on reload so a stale timestamp doesn't show 0:00
      return { room: { ...action.room, phaseStartTime: Date.now() }, currentUser: action.user };

    case 'START_SESSION': {
      const userId = generateUserId();
      const user: User = { id: userId, name: action.userName };
      const newRoom: Room = {
        id: generateRoomCode(),
        topics: [],
        users: [user],
        phase: 'brainstorm',
        currentTopicIndex: 0,
        votesPerPerson: 3,
        discussionTimeLimit: 300,
        phaseStartTime: Date.now(),
        phaseTimeLimit: defaultPhaseTimeLimit('brainstorm'),
      };
      return { room: newRoom, currentUser: user };
    }

    case 'ADD_TOPIC': {
      if (!room || !currentUser) return state;
      const newTopic: Topic = {
        id: Date.now().toString(),
        text: action.text,
        authorId: currentUser.id,
        authorName: currentUser.name,
        votes: [],
        discussed: false,
        timeSpent: 0,
      };
      return { ...state, room: { ...room, topics: [...room.topics, newTopic] } };
    }

    case 'EDIT_TOPIC': {
      if (!room) return state;
      return {
        ...state,
        room: {
          ...room,
          topics: room.topics.map(t =>
            t.id === action.topicId ? { ...t, text: action.newText } : t
          ),
        },
      };
    }

    case 'DELETE_TOPIC': {
      if (!room) return state;
      return {
        ...state,
        room: { ...room, topics: room.topics.filter(t => t.id !== action.topicId) },
      };
    }

    case 'TOGGLE_VOTE': {
      if (!room || !currentUser) return state;
      const topic = room.topics.find(t => t.id === action.topicId);
      if (!topic) return state;
      const hasVoted = topic.votes.includes(currentUser.id);
      const userVoteCount = room.topics.filter(t => t.votes.includes(currentUser.id)).length;
      if (!hasVoted && userVoteCount >= room.votesPerPerson) return state;
      return {
        ...state,
        room: {
          ...room,
          topics: room.topics.map(t =>
            t.id === action.topicId
              ? {
                  ...t,
                  votes: hasVoted
                    ? t.votes.filter(id => id !== currentUser.id)
                    : [...t.votes, currentUser.id],
                }
              : t
          ),
        },
      };
    }

    case 'UPDATE_VOTES_PER_PERSON': {
      if (!room) return state;
      const { votes: newLimit, userId } = action;
      // Trim the user's votes down to the new limit if they're over it
      const votedTopicIds = room.topics
        .filter(t => t.votes.includes(userId))
        .map(t => t.id);
      const excess = votedTopicIds.length - newLimit;
      const toUnvote = new Set(excess > 0 ? votedTopicIds.slice(-excess) : []);
      return {
        ...state,
        room: {
          ...room,
          votesPerPerson: newLimit,
          topics: room.topics.map(t =>
            toUnvote.has(t.id)
              ? { ...t, votes: t.votes.filter(id => id !== userId) }
              : t
          ),
        },
      };
    }

    case 'NEXT_PHASE': {
      if (!room) return state;
      const currentIndex = PHASES.indexOf(room.phase);
      const next = PHASES[currentIndex + 1];
      if (!next) return state;
      return {
        ...state,
        room: {
          ...room,
          phase: next,
          currentTopicIndex: next === 'discussion' ? 0 : room.currentTopicIndex,
          phaseStartTime: Date.now(),
          phaseTimeLimit: defaultPhaseTimeLimit(next),
        },
      };
    }

    case 'NEXT_TOPIC': {
      if (!room) return state;
      const sortedTopics = [...room.topics]
        .sort((a, b) => b.votes.length - a.votes.length)
        .filter(t => t.votes.length > 0);
      const currentTopic = sortedTopics[room.currentTopicIndex];
      if (!currentTopic) return state;
      return {
        ...state,
        room: {
          ...room,
          topics: room.topics.map(t =>
            t.id === currentTopic.id ? { ...t, discussed: true } : t
          ),
          currentTopicIndex: room.currentTopicIndex + 1,
        },
      };
    }

    case 'SKIP_TOPIC': {
      if (!room) return state;
      return { ...state, room: { ...room, currentTopicIndex: room.currentTopicIndex + 1 } };
    }

    case 'UPDATE_TAKEAWAYS': {
      if (!room) return state;
      return {
        ...state,
        room: {
          ...room,
          topics: room.topics.map(t =>
            t.id === action.topicId ? { ...t, takeaways: action.takeaways } : t
          ),
        },
      };
    }

    case 'UPDATE_TOPIC_TIME': {
      if (!room) return state;
      return {
        ...state,
        room: {
          ...room,
          topics: room.topics.map(t =>
            t.id === action.topicId ? { ...t, timeSpent: action.timeSpent } : t
          ),
        },
      };
    }

    case 'ADD_PARTICIPANT': {
      if (!room) return state;
      const participant: User = { id: generateUserId(), name: action.name };
      return { ...state, room: { ...room, users: [...room.users, participant] } };
    }

    case 'RESET':
      return { room: null, currentUser: null };

    default:
      return state;
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, { room: null, currentUser: null });
  const [confirmingReset, setConfirmingReset] = React.useState(false);
  const { room, currentUser } = state;

  useEffect(() => {
    const savedUser = storage.getUser();
    const savedRoom = storage.getRoom();
    if (savedUser && savedRoom) {
      dispatch({ type: 'LOAD', room: savedRoom, user: savedUser });
    }
  }, []);

  useEffect(() => {
    if (room) storage.setRoom(room);
  }, [room]);

  useEffect(() => {
    if (currentUser) storage.setUser(currentUser);
  }, [currentUser]);

  const handleReset = () => {
    storage.clearRoom();
    storage.clearUser();
    setConfirmingReset(false);
    dispatch({ type: 'RESET' });
  };

  const footer = (
    <footer className="fixed bottom-0 inset-x-0 text-center py-2 text-xs text-gray-400 pointer-events-none">
      made by{' '}
      <a
        href="https://github.com/btrav"
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:text-gray-600 transition-colors pointer-events-auto"
      >
        btrav
      </a>
    </footer>
  );

  // End Session button + confirmation overlay, shown whenever a session is active
  const endSessionControl = room && (
    <>
      <button
        onClick={() => setConfirmingReset(true)}
        className="fixed top-4 left-4 z-50 flex items-center gap-1.5 px-3 py-2 bg-white text-gray-500 text-xs font-medium rounded-xl shadow border border-gray-200 hover:border-red-300 hover:text-red-500 transition-colors"
        aria-label="End session"
      >
        ✕ End Session
      </button>

      {confirmingReset && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-dialog-title"
        >
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full border border-gray-100">
            <h2 id="reset-dialog-title" className="text-xl font-bold text-gray-800 mb-2">End this session?</h2>
            <p className="text-gray-600 mb-6 text-sm">
              All topics, votes, and takeaways will be permanently deleted. Export your summary first if you want to keep anything.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmingReset(false)}
                className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-2xl font-medium hover:border-gray-300 transition-colors"
                autoFocus
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-3 bg-red-500 text-white rounded-2xl font-medium hover:bg-red-600 transition-colors"
              >
                End Session
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  if (!room || !currentUser) {
    return (
      <>
        <JoinRoom onStart={(userName) => dispatch({ type: 'START_SESSION', userName })} />
        {footer}
      </>
    );
  }

  const commonProps = {
    topics: room.topics,
    participants: room.users,
    phaseStartTime: room.phaseStartTime,
    phaseTimeLimit: room.phaseTimeLimit,
  };

  switch (room.phase) {
    case 'brainstorm':
      return (
        <>
          <BrainstormingPhase
            {...commonProps}
            currentUser={currentUser}
            onAddTopic={(text) => dispatch({ type: 'ADD_TOPIC', text })}
            onEditTopic={(topicId, newText) => dispatch({ type: 'EDIT_TOPIC', topicId, newText })}
            onDeleteTopic={(topicId) => dispatch({ type: 'DELETE_TOPIC', topicId })}
            onNextPhase={() => dispatch({ type: 'NEXT_PHASE' })}
            onAddParticipant={(name) => dispatch({ type: 'ADD_PARTICIPANT', name })}
          />
          {endSessionControl}
          {footer}
        </>
      );

    case 'voting':
      return (
        <>
          <VotingPhase
            {...commonProps}
            currentUser={currentUser}
            votesPerPerson={room.votesPerPerson}
            onVote={(topicId) => dispatch({ type: 'TOGGLE_VOTE', topicId })}
            onNextPhase={() => dispatch({ type: 'NEXT_PHASE' })}
            onUpdateVotesPerPerson={(votes) =>
              dispatch({ type: 'UPDATE_VOTES_PER_PERSON', votes, userId: currentUser.id })
            }
          />
          {endSessionControl}
          {footer}
        </>
      );

    case 'discussion':
      return (
        <>
          <DiscussionPhase
            {...commonProps}
            currentTopicIndex={room.currentTopicIndex}
            discussionTimeLimit={room.discussionTimeLimit}
            onNextTopic={() => dispatch({ type: 'NEXT_TOPIC' })}
            onSkipTopic={() => dispatch({ type: 'SKIP_TOPIC' })}
            onUpdateTakeaways={(topicId, takeaways) =>
              dispatch({ type: 'UPDATE_TAKEAWAYS', topicId, takeaways })
            }
            onNextPhase={() => dispatch({ type: 'NEXT_PHASE' })}
            onUpdateTopicTime={(topicId, timeSpent) =>
              dispatch({ type: 'UPDATE_TOPIC_TIME', topicId, timeSpent })
            }
          />
          {endSessionControl}
          {footer}
        </>
      );

    case 'completion':
      return (
        <>
          <CompletionPhase
            {...commonProps}
            roomCode={room.id}
            onReset={handleReset}
          />
          {endSessionControl}
          {footer}
        </>
      );

    default:
      return null;
  }
}

export default App;
