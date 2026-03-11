export interface Topic {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  votes: string[]; // array of user IDs who voted
  discussed: boolean;
  takeaways?: string;
  timeSpent: number; // in seconds
}

export interface User {
  id: string;
  name: string;
  isHost: boolean;
}

export interface Room {
  id: string;
  topics: Topic[];
  users: User[];
  phase: 'join' | 'brainstorm' | 'voting' | 'discussion' | 'completion';
  currentTopicIndex: number;
  votesPerPerson: number;
  discussionTimeLimit: number; // in seconds
  hostId: string;
  phaseStartTime?: number; // timestamp when current phase started
  phaseTimeLimit?: number; // time limit for current phase in seconds
}

export type Phase = 'join' | 'brainstorm' | 'voting' | 'discussion' | 'completion';

export interface StepProps {
  onNext: () => void;
  onBack?: () => void;
  isActive: boolean;
}