export interface Topic {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  votes: Record<string, number>; // maps userId to vote count
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

export type Phase = 'setup' | 'brainstorm' | 'voting' | 'discussion' | 'completion';

export const totalVotesForTopic = (topic: Topic): number =>
  Object.values(topic.votes).reduce((a, b) => a + b, 0);
