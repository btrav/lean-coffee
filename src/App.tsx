import React, { useState, useEffect } from 'react';
import { Room, User, Topic, Phase } from './types';
import { storage } from './utils/storage';
import { generateRoomCode, generateUserId } from './utils/roomManager';
import { JoinRoom } from './components/JoinRoom';
import { BrainstormingPhase } from './components/BrainstormingPhase';
import { VotingPhase } from './components/VotingPhase';
import { DiscussionPhase } from './components/DiscussionPhase';
import { CompletionPhase } from './components/CompletionPhase';

function App() {
  const [room, setRoom] = useState<Room | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Load saved state on mount
  useEffect(() => {
    const savedUser = storage.getUser();
    const savedRoom = storage.getRoom();
    
    if (savedUser) {
      setCurrentUser(savedUser);
    }
    
    if (savedRoom) {
      setRoom(savedRoom);
    }
  }, []);

  // Save state changes
  useEffect(() => {
    if (room) {
      storage.setRoom(room);
    }
  }, [room]);

  useEffect(() => {
    if (currentUser) {
      storage.setUser(currentUser);
    }
  }, [currentUser]);

  const createRoom = (userName: string) => {
    const userId = generateUserId();
    const roomCode = generateRoomCode();
    
    const newUser: User = {
      id: userId,
      name: userName,
      isHost: true,
    };
    
    const newRoom: Room = {
      id: roomCode,
      topics: [],
      users: [newUser],
      phase: 'brainstorm',
      currentTopicIndex: 0,
      votesPerPerson: 3,
      discussionTimeLimit: 300, // 5 minutes
      hostId: userId,
      phaseStartTime: Date.now(),
      phaseTimeLimit: 600, // 10 minutes for brainstorming
    };
    
    setCurrentUser(newUser);
    setRoom(newRoom);
  };

  const joinRoom = (userName: string, roomCode: string) => {
    const userId = generateUserId();
    
    const newUser: User = {
      id: userId,
      name: userName,
      isHost: false,
    };
    
    // Check if there's a saved room with this code
    const savedRoom = storage.getRoom();
    if (savedRoom && savedRoom.id === roomCode) {
      const updatedRoom = {
        ...savedRoom,
        users: [...savedRoom.users.filter(u => u.id !== userId), newUser],
      };
      setRoom(updatedRoom);
      setCurrentUser(newUser);
    } else {
      // Create a new room for demo purposes
      const newRoom: Room = {
        id: roomCode,
        topics: [],
        users: [newUser],
        phase: 'brainstorm',
        currentTopicIndex: 0,
        votesPerPerson: 3,
        discussionTimeLimit: 300,
        hostId: userId,
        phaseStartTime: Date.now(),
        phaseTimeLimit: 600,
      };
      
      setCurrentUser({ ...newUser, isHost: true });
      setRoom(newRoom);
    }
  };

  const addTopic = (text: string) => {
    if (!room || !currentUser) return;
    
    const newTopic: Topic = {
      id: Date.now().toString(),
      text,
      authorId: currentUser.id,
      authorName: currentUser.name,
      votes: [],
      discussed: false,
      timeSpent: 0,
    };
    
    setRoom({
      ...room,
      topics: [...room.topics, newTopic],
    });
  };

  const editTopic = (topicId: string, newText: string) => {
    if (!room) return;
    
    setRoom({
      ...room,
      topics: room.topics.map(topic =>
        topic.id === topicId ? { ...topic, text: newText } : topic
      ),
    });
  };

  const deleteTopic = (topicId: string) => {
    if (!room) return;
    
    setRoom({
      ...room,
      topics: room.topics.filter(topic => topic.id !== topicId),
    });
  };

  const toggleVote = (topicId: string) => {
    if (!room || !currentUser) return;
    
    const topic = room.topics.find(t => t.id === topicId);
    if (!topic) return;
    
    const hasVoted = topic.votes.includes(currentUser.id);
    const userVotes = room.topics.filter(t => t.votes.includes(currentUser.id)).length;
    
    if (hasVoted) {
      // Remove vote
      setRoom({
        ...room,
        topics: room.topics.map(t =>
          t.id === topicId
            ? { ...t, votes: t.votes.filter(id => id !== currentUser.id) }
            : t
        ),
      });
    } else if (userVotes < room.votesPerPerson) {
      // Add vote
      setRoom({
        ...room,
        topics: room.topics.map(t =>
          t.id === topicId
            ? { ...t, votes: [...t.votes, currentUser.id] }
            : t
        ),
      });
    }
  };

  const updateVotesPerPerson = (votes: number) => {
    if (!room) return;
    
    setRoom({
      ...room,
      votesPerPerson: votes,
    });
  };

  const nextPhase = () => {
    if (!room) return;
    
    const phases: Phase[] = ['brainstorm', 'voting', 'discussion', 'completion'];
    const currentIndex = phases.indexOf(room.phase);
    const nextPhase = phases[currentIndex + 1];
    
    if (nextPhase) {
      let phaseTimeLimit: number | undefined;
      
      // Set time limits for each phase
      switch (nextPhase) {
        case 'voting':
          phaseTimeLimit = 300; // 5 minutes
          break;
        case 'discussion':
          phaseTimeLimit = undefined; // No overall time limit for discussion
          break;
        case 'completion':
          phaseTimeLimit = undefined;
          break;
      }
      
      setRoom({
        ...room,
        phase: nextPhase,
        currentTopicIndex: nextPhase === 'discussion' ? 0 : room.currentTopicIndex,
        phaseStartTime: Date.now(),
        phaseTimeLimit,
      });
    }
  };

  const nextTopic = () => {
    if (!room) return;
    
    const sortedTopics = [...room.topics]
      .sort((a, b) => b.votes.length - a.votes.length)
      .filter(topic => topic.votes.length > 0);
    
    const currentTopic = sortedTopics[room.currentTopicIndex];
    if (currentTopic) {
      // Mark current topic as discussed
      setRoom({
        ...room,
        topics: room.topics.map(t =>
          t.id === currentTopic.id ? { ...t, discussed: true } : t
        ),
        currentTopicIndex: room.currentTopicIndex + 1,
      });
    }
  };

  const skipTopic = () => {
    if (!room) return;
    
    setRoom({
      ...room,
      currentTopicIndex: room.currentTopicIndex + 1,
    });
  };

  const updateTakeaways = (topicId: string, takeaways: string) => {
    if (!room) return;
    
    setRoom({
      ...room,
      topics: room.topics.map(t =>
        t.id === topicId ? { ...t, takeaways } : t
      ),
    });
  };

  const updateTopicTime = (topicId: string, timeSpent: number) => {
    if (!room) return;
    
    setRoom({
      ...room,
      topics: room.topics.map(t =>
        t.id === topicId ? { ...t, timeSpent } : t
      ),
    });
  };

  const resetSession = () => {
    storage.clearRoom();
    setRoom(null);
    setCurrentUser(null);
  };

  if (!room || !currentUser) {
    return <JoinRoom onCreateRoom={createRoom} onJoinRoom={joinRoom} />;
  }

  const commonProps = {
    topics: room.topics,
    currentUser,
    isHost: currentUser.isHost,
    roomCode: room.id,
    participants: room.users,
    phaseStartTime: room.phaseStartTime,
    phaseTimeLimit: room.phaseTimeLimit,
  };

  switch (room.phase) {
    case 'brainstorm':
      return (
        <BrainstormingPhase
          {...commonProps}
          onAddTopic={addTopic}
          onEditTopic={editTopic}
          onDeleteTopic={deleteTopic}
          onNextPhase={nextPhase}
        />
      );
    
    case 'voting':
      return (
        <VotingPhase
          {...commonProps}
          votesPerPerson={room.votesPerPerson}
          onVote={toggleVote}
          onNextPhase={nextPhase}
          onUpdateVotesPerPerson={updateVotesPerPerson}
        />
      );
    
    case 'discussion':
      return (
        <DiscussionPhase
          {...commonProps}
          currentTopicIndex={room.currentTopicIndex}
          discussionTimeLimit={room.discussionTimeLimit}
          onNextTopic={nextTopic}
          onSkipTopic={skipTopic}
          onUpdateTakeaways={updateTakeaways}
          onNextPhase={nextPhase}
          onUpdateTopicTime={updateTopicTime}
        />
      );
    
    case 'completion':
      return (
        <CompletionPhase
          {...commonProps}
          onReset={resetSession}
        />
      );
    
    default:
      return <div>Unknown phase</div>;
  }
}

export default App;