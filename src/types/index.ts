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
}

export interface Room {
  id: string;
  topics: Topic[];
  users: User[];
  phase: Phase;
  currentTopicIndex: number;
  votesPerPerson: number;
  discussionTimeLimit: number; // in seconds
  phaseStartTime?: number;
  phaseTimeLimit?: number;
}

export type Phase = 'brainstorm' | 'voting' | 'discussion' | 'completion';
