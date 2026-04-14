import React, { useReducer, useEffect } from 'react';
import { Room, User, Topic, Phase, totalVotesForTopic } from './types';
import { storage } from './utils/storage';
import { generateRoomCode, generateUserId } from './utils/roomManager';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { JoinRoom } from './components/JoinRoom';
import { SetupPhase } from './components/SetupPhase';
import { BrainstormingPhase } from './components/BrainstormingPhase';
import { VotingPhase } from './components/VotingPhase';
import { DiscussionPhase } from './components/DiscussionPhase';
import { CompletionPhase } from './components/CompletionPhase';
import { ThemePicker } from './components/ThemePicker';

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
  | { type: 'ADD_VOTE'; topicId: string }
  | { type: 'REMOVE_VOTE'; topicId: string }
  | { type: 'UPDATE_VOTES_PER_PERSON'; votes: number; userId: string }
  | { type: 'NEXT_PHASE' }
  | { type: 'NEXT_TOPIC' }
  | { type: 'SKIP_TOPIC' }
  | { type: 'UPDATE_TAKEAWAYS'; topicId: string; takeaways: string }
  | { type: 'UPDATE_TOPIC_TIME'; topicId: string; timeSpent: number }
  | { type: 'ADD_PARTICIPANT'; name: string }
  | { type: 'REMOVE_PARTICIPANT'; userId: string }
  | { type: 'RESET' };

const PHASES: Phase[] = ['setup', 'brainstorm', 'voting', 'discussion', 'completion'];

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
        phase: 'setup',
        currentTopicIndex: 0,
        votesPerPerson: 3,
        discussionTimeLimit: 300,
        phaseStartTime: Date.now(),
        phaseTimeLimit: undefined,
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
        votes: {},
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

    case 'ADD_VOTE': {
      if (!room || !currentUser) return state;
      const totalUserVotes = room.topics.reduce(
        (sum, t) => sum + (t.votes[currentUser.id] || 0), 0
      );
      if (totalUserVotes >= room.votesPerPerson) return state;
      return {
        ...state,
        room: {
          ...room,
          topics: room.topics.map(t =>
            t.id === action.topicId
              ? { ...t, votes: { ...t.votes, [currentUser.id]: (t.votes[currentUser.id] || 0) + 1 } }
              : t
          ),
        },
      };
    }

    case 'REMOVE_VOTE': {
      if (!room || !currentUser) return state;
      const topic = room.topics.find(t => t.id === action.topicId);
      if (!topic || !topic.votes[currentUser.id]) return state;
      const count = topic.votes[currentUser.id] - 1;
      const updatedVotes = { ...topic.votes };
      if (count <= 0) {
        delete updatedVotes[currentUser.id];
      } else {
        updatedVotes[currentUser.id] = count;
      }
      return {
        ...state,
        room: {
          ...room,
          topics: room.topics.map(t =>
            t.id === action.topicId ? { ...t, votes: updatedVotes } : t
          ),
        },
      };
    }

    case 'UPDATE_VOTES_PER_PERSON': {
      if (!room) return state;
      const { votes: newLimit, userId } = action;
      const totalVotes = room.topics.reduce(
        (sum, t) => sum + (t.votes[userId] || 0), 0
      );
      let toRemove = Math.max(0, totalVotes - newLimit);
      const updatedTopics = room.topics.map(t => {
        if (toRemove <= 0) return t;
        const userVotesInTopic = t.votes[userId] || 0;
        const removals = Math.min(userVotesInTopic, toRemove);
        if (removals === 0) return t;
        toRemove -= removals;
        const newCount = userVotesInTopic - removals;
        const newVotes = { ...t.votes };
        if (newCount <= 0) {
          delete newVotes[userId];
        } else {
          newVotes[userId] = newCount;
        }
        return { ...t, votes: newVotes };
      });
      return {
        ...state,
        room: { ...room, votesPerPerson: newLimit, topics: updatedTopics },
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
      // Re-derive the sorted order to identify which topic is current — must match
      // the sort used in DiscussionPhase so currentTopicIndex refers to the same topic
      const sortedTopics = [...room.topics]
        .sort((a, b) => totalVotesForTopic(b) - totalVotesForTopic(a))
        .filter(t => totalVotesForTopic(t) > 0);
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

    case 'REMOVE_PARTICIPANT': {
      if (!room) return state;
      return { ...state, room: { ...room, users: room.users.filter(u => u.id !== action.userId) } };
    }

    case 'RESET':
      return { room: null, currentUser: null };

    default:
      return state;
  }
}

function AppInner() {
  const { theme: t } = useTheme();
  const [state, dispatch] = useReducer(reducer, { room: null, currentUser: null });
  const [confirmingReset, setConfirmingReset] = React.useState(false);
  const { room, currentUser } = state;

  // Restore session from localStorage on first render
  useEffect(() => {
    const savedUser = storage.getUser();
    const savedRoom = storage.getRoom();
    if (savedUser && savedRoom) {
      dispatch({ type: 'LOAD', room: savedRoom, user: savedUser });
    }
  }, []);

  // Keep localStorage in sync whenever room or user state changes
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
    <footer className={t.footer}>
      made by{' '}
      <a
        href="https://github.com/btrav"
        target="_blank"
        rel="noopener noreferrer"
        className={t.footerLink}
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
        className={t.endSessionBtn}
        aria-label="End session"
      >
        ✕ End Session
      </button>

      {confirmingReset && (
        <div
          className={t.overlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-dialog-title"
        >
          <div className={t.dialog}>
            <h2 id="reset-dialog-title" className={`text-xl font-bold ${t.heading} mb-2`}>End this session?</h2>
            <p className={`${t.body} mb-6 text-sm`}>
              All topics, votes, and takeaways will be permanently deleted. Export your summary first if you want to keep anything.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmingReset(false)}
                className={`flex-1 py-3 ${t.btnOutline}`}
                autoFocus
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className={`flex-1 py-3 ${t.btnDanger}`}
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
        <ThemePicker />
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
    case 'setup':
      return (
        <>
          <SetupPhase
            currentUser={currentUser}
            participants={room.users}
            onAddParticipant={(name) => dispatch({ type: 'ADD_PARTICIPANT', name })}
            onRemoveParticipant={(userId) => dispatch({ type: 'REMOVE_PARTICIPANT', userId })}
            onNextPhase={() => dispatch({ type: 'NEXT_PHASE' })}
          />
          {endSessionControl}
          {footer}
          <ThemePicker />
        </>
      );

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
          />
          {endSessionControl}
          {footer}
          <ThemePicker />
        </>
      );

    case 'voting':
      return (
        <>
          <VotingPhase
            {...commonProps}
            currentUser={currentUser}
            votesPerPerson={room.votesPerPerson}
            onAddVote={(topicId) => dispatch({ type: 'ADD_VOTE', topicId })}
            onRemoveVote={(topicId) => dispatch({ type: 'REMOVE_VOTE', topicId })}
            onNextPhase={() => dispatch({ type: 'NEXT_PHASE' })}
            onUpdateVotesPerPerson={(votes) =>
              dispatch({ type: 'UPDATE_VOTES_PER_PERSON', votes, userId: currentUser.id })
            }
          />
          {endSessionControl}
          {footer}
          <ThemePicker />
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
          <ThemePicker />
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
          <ThemePicker />
        </>
      );

    default:
      return null;
  }
}

function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}

export default App;
