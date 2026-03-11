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
  | { type: 'UPDATE_VOTES_PER_PERSON'; votes: number }
  | { type: 'NEXT_PHASE' }
  | { type: 'NEXT_TOPIC' }
  | { type: 'SKIP_TOPIC' }
  | { type: 'UPDATE_TAKEAWAYS'; topicId: string; takeaways: string }
  | { type: 'UPDATE_TOPIC_TIME'; topicId: string; timeSpent: number }
  | { type: 'ADD_PARTICIPANT'; name: string }
  | { type: 'RESET' };

const PHASES: Phase[] = ['brainstorm', 'voting', 'discussion', 'completion'];

function phaseTimeLimit(phase: Phase): number | undefined {
  if (phase === 'brainstorm') return 600;
  if (phase === 'voting') return 300;
  return undefined;
}

function reducer(state: AppState, action: Action): AppState {
  const { room, currentUser } = state;

  switch (action.type) {
    case 'LOAD':
      return { room: action.room, currentUser: action.user };

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
        phaseTimeLimit: phaseTimeLimit('brainstorm'),
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
      return { ...state, room: { ...room, votesPerPerson: action.votes } };
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
          phaseTimeLimit: phaseTimeLimit(next),
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
    currentUser,
    participants: room.users,
    phaseStartTime: room.phaseStartTime,
    phaseTimeLimit: room.phaseTimeLimit,
  };

  const handleReset = () => {
    storage.clearRoom();
    storage.clearUser();
    dispatch({ type: 'RESET' });
  };

  switch (room.phase) {
    case 'brainstorm':
      return (
        <>
          <BrainstormingPhase
            {...commonProps}
            onAddTopic={(text) => dispatch({ type: 'ADD_TOPIC', text })}
            onEditTopic={(topicId, newText) => dispatch({ type: 'EDIT_TOPIC', topicId, newText })}
            onDeleteTopic={(topicId) => dispatch({ type: 'DELETE_TOPIC', topicId })}
            onNextPhase={() => dispatch({ type: 'NEXT_PHASE' })}
            onAddParticipant={(name) => dispatch({ type: 'ADD_PARTICIPANT', name })}
          />
          {footer}
        </>
      );

    case 'voting':
      return (
        <>
          <VotingPhase
            {...commonProps}
            votesPerPerson={room.votesPerPerson}
            onVote={(topicId) => dispatch({ type: 'TOGGLE_VOTE', topicId })}
            onNextPhase={() => dispatch({ type: 'NEXT_PHASE' })}
            onUpdateVotesPerPerson={(votes) => dispatch({ type: 'UPDATE_VOTES_PER_PERSON', votes })}
          />
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
          {footer}
        </>
      );

    default:
      return null;
  }
}

export default App;
