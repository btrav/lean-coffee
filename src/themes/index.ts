export interface Theme {
  name: string;
  label: string;

  // Page
  page: string;

  // Surfaces
  card: string;
  cardActive: string;
  cardAlert: string;
  dialog: string;
  overlay: string;
  listItem: string;
  infoBox: string;

  // Buttons
  btnPrimary: string;
  btnPrimaryDisabled: string;
  btnConfirm: string;
  btnSecondary: string;
  btnOutline: string;
  btnDanger: string;
  btnSmall: string;
  btnGhost: string;
  btnIconVoteActive: string;
  btnIconVoteInactive: string;
  btnIconEdit: string;
  btnIconDelete: string;

  // Inputs
  input: string;
  textarea: string;
  slider: string;

  // Text
  heading: string;
  body: string;
  muted: string;

  // Phase icon bubble
  iconBubble: string;

  // Accent
  accent: string;
  accentBg: string;
  accentBorder: string;

  // Status (same across themes)
  successText: string;
  successBg: string;
  warningText: string;
  warningBg: string;
  dangerText: string;
  dangerBg: string;

  // Elements
  avatar: string;
  participantBadge: string;
  participantBadgeAvatar: string;
  rankBadge: (rank: number) => string;
  discussedBadge: string;
  progressTrack: string;
  progressFill: string;
  stepActive: string;
  stepInactive: string;
  divider: string;
  voteColor: string;
  voteColorMuted: string;

  // Fixed UI
  endSessionBtn: string;
  phaseTimer: string;
  timerCard: string;
  timerExtendBtn: string;
  footer: string;
  footerLink: string;
}

export type ThemeName = 'notion' | 'warm' | 'ink';

// ─── Notion ──────────────────────────────────────────────────────────────────

const notion: Theme = {
  name: 'notion',
  label: 'Notetaker',

  page: 'min-h-screen bg-gray-50 p-6',

  card: 'bg-white rounded-xl shadow-sm p-6 border border-gray-200',
  cardActive: 'bg-white rounded-xl shadow-sm border-2 border-blue-400 p-6',
  cardAlert: 'bg-white rounded-xl shadow-sm p-6 border-2 border-orange-300',
  dialog: 'bg-white rounded-xl shadow-lg p-8 max-w-sm w-full border border-gray-200',
  overlay: 'fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6',
  listItem: 'bg-gray-50 rounded-lg p-3',
  infoBox: 'bg-blue-50 rounded-lg p-4 border border-blue-100',

  btnPrimary: 'bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-sm',
  btnPrimaryDisabled: 'bg-gray-200 text-gray-400 rounded-lg font-medium cursor-not-allowed',
  btnConfirm: 'bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm',
  btnSecondary: 'bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors',
  btnOutline: 'border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors',
  btnDanger: 'bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors',
  btnSmall: 'bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors',
  btnGhost: 'text-gray-600 hover:text-gray-900 font-medium transition-colors',

  btnIconVoteActive: 'p-2.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors',
  btnIconVoteInactive: 'p-2.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors',
  btnIconEdit: 'p-2.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors',
  btnIconDelete: 'p-2.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors',

  input: 'w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors',
  textarea: 'w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors resize-none',
  slider: 'w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600',

  heading: 'text-gray-900',
  body: 'text-gray-600',
  muted: 'text-gray-400',

  iconBubble: 'inline-flex items-center justify-center w-14 h-14 bg-gray-900 rounded-2xl mb-4',

  accent: 'text-blue-600',
  accentBg: 'bg-blue-50',
  accentBorder: 'border-blue-200',

  successText: 'text-green-600',
  successBg: 'bg-green-50',
  warningText: 'text-orange-600',
  warningBg: 'bg-orange-50',
  dangerText: 'text-red-600',
  dangerBg: 'bg-red-50',

  avatar: 'w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold',
  participantBadge: 'flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium',
  participantBadgeAvatar: 'w-5 h-5 bg-gray-900 text-white rounded flex items-center justify-center text-xs font-bold',
  rankBadge: (rank: number) =>
    rank === 1
      ? 'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold bg-yellow-100 text-yellow-800'
      : rank === 2
        ? 'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold bg-gray-100 text-gray-700'
        : rank === 3
          ? 'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold bg-orange-100 text-orange-700'
          : 'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold bg-blue-50 text-blue-700',
  discussedBadge: 'text-xs text-green-700 bg-green-50 px-2.5 py-1 rounded-md font-medium',
  progressTrack: 'w-full bg-gray-200 rounded-full',
  progressFill: 'bg-blue-500 rounded-full transition-all duration-500',
  stepActive: 'flex items-center justify-center w-8 h-8 rounded-lg text-sm font-medium bg-gray-900 text-white transition-all duration-300',
  stepInactive: 'flex items-center justify-center w-8 h-8 rounded-lg text-sm font-medium bg-gray-200 text-gray-500 transition-all duration-300',
  divider: 'border-t border-gray-200',
  voteColor: 'text-red-500',
  voteColorMuted: 'text-gray-400',

  endSessionBtn: 'fixed top-4 left-4 z-50 flex items-center gap-1.5 px-3 py-2 bg-white text-gray-500 text-xs font-medium rounded-lg shadow-sm border border-gray-200 hover:border-red-300 hover:text-red-500 transition-colors',
  phaseTimer: 'fixed top-4 right-4 bg-white rounded-xl shadow-sm p-3 border border-gray-200 z-50',
  timerCard: 'bg-white rounded-xl shadow-sm p-6 border border-gray-200',
  timerExtendBtn: 'flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium',
  footer: 'fixed bottom-0 inset-x-0 text-center py-2 text-xs text-gray-400 pointer-events-none',
  footerLink: 'underline underline-offset-2 hover:text-gray-600 transition-colors pointer-events-auto',
};

// ─── Warm Minimal ────────────────────────────────────────────────────────────

const warm: Theme = {
  name: 'warm',
  label: 'Warm',

  page: 'min-h-screen bg-stone-50 p-6',

  card: 'bg-white rounded-2xl p-6 border border-stone-200',
  cardActive: 'bg-white rounded-2xl border-2 border-amber-400 p-6',
  cardAlert: 'bg-white rounded-2xl p-6 border-2 border-orange-300',
  dialog: 'bg-white rounded-2xl p-8 max-w-sm w-full border border-stone-200',
  overlay: 'fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-6',
  listItem: 'bg-stone-50 rounded-xl p-3',
  infoBox: 'bg-amber-50 rounded-xl p-4 border border-amber-100',

  btnPrimary: 'bg-amber-700 text-white rounded-xl font-medium hover:bg-amber-800 transition-colors',
  btnPrimaryDisabled: 'bg-stone-200 text-stone-400 rounded-xl font-medium cursor-not-allowed',
  btnConfirm: 'bg-amber-700 text-white rounded-xl font-medium hover:bg-amber-800 transition-colors',
  btnSecondary: 'bg-stone-100 text-stone-700 rounded-xl font-medium hover:bg-stone-200 transition-colors',
  btnOutline: 'border border-stone-300 text-stone-600 rounded-xl font-medium hover:bg-stone-50 transition-colors',
  btnDanger: 'bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors',
  btnSmall: 'bg-stone-100 text-stone-600 rounded-xl text-sm font-medium hover:bg-stone-200 transition-colors',
  btnGhost: 'text-amber-700 hover:text-amber-900 font-medium transition-colors',

  btnIconVoteActive: 'p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors',
  btnIconVoteInactive: 'p-2.5 rounded-xl bg-stone-100 text-stone-400 hover:bg-red-50 hover:text-red-500 transition-colors',
  btnIconEdit: 'p-2.5 rounded-xl bg-stone-100 text-stone-400 hover:bg-amber-50 hover:text-amber-700 transition-colors',
  btnIconDelete: 'p-2.5 rounded-xl bg-stone-100 text-stone-400 hover:bg-red-50 hover:text-red-500 transition-colors',

  input: 'w-full px-4 py-3 text-lg border border-stone-300 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-colors',
  textarea: 'w-full px-4 py-3 text-lg border border-stone-300 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-colors resize-none',
  slider: 'w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-700',

  heading: 'text-stone-800',
  body: 'text-stone-500',
  muted: 'text-stone-400',

  iconBubble: 'inline-flex items-center justify-center w-14 h-14 bg-amber-700 rounded-2xl mb-4',

  accent: 'text-amber-700',
  accentBg: 'bg-amber-50',
  accentBorder: 'border-amber-200',

  successText: 'text-green-600',
  successBg: 'bg-green-50',
  warningText: 'text-orange-600',
  warningBg: 'bg-orange-50',
  dangerText: 'text-red-600',
  dangerBg: 'bg-red-50',

  avatar: 'w-10 h-10 bg-amber-700 rounded-xl flex items-center justify-center text-white font-bold',
  participantBadge: 'flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 rounded-xl text-sm font-medium',
  participantBadgeAvatar: 'w-5 h-5 bg-amber-700 text-white rounded-lg flex items-center justify-center text-xs font-bold',
  rankBadge: (rank: number) =>
    rank === 1
      ? 'w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold bg-yellow-100 text-yellow-800'
      : rank === 2
        ? 'w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold bg-stone-100 text-stone-700'
        : rank === 3
          ? 'w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold bg-orange-100 text-orange-700'
          : 'w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold bg-amber-50 text-amber-700',
  discussedBadge: 'text-xs text-green-700 bg-green-50 px-2.5 py-1 rounded-lg font-medium',
  progressTrack: 'w-full bg-stone-200 rounded-full',
  progressFill: 'bg-amber-600 rounded-full transition-all duration-500',
  stepActive: 'flex items-center justify-center w-8 h-8 rounded-xl text-sm font-medium bg-amber-700 text-white transition-all duration-300',
  stepInactive: 'flex items-center justify-center w-8 h-8 rounded-xl text-sm font-medium bg-stone-200 text-stone-500 transition-all duration-300',
  divider: 'border-t border-stone-200',
  voteColor: 'text-red-500',
  voteColorMuted: 'text-stone-400',

  endSessionBtn: 'fixed top-4 left-4 z-50 flex items-center gap-1.5 px-3 py-2 bg-white text-stone-500 text-xs font-medium rounded-xl border border-stone-200 hover:border-red-300 hover:text-red-500 transition-colors',
  phaseTimer: 'fixed top-4 right-4 bg-white rounded-2xl p-3 border border-stone-200 z-50',
  timerCard: 'bg-white rounded-2xl p-6 border border-stone-200',
  timerExtendBtn: 'flex items-center gap-1 px-3 py-1 bg-stone-100 text-stone-600 rounded-xl hover:bg-stone-200 transition-colors text-sm font-medium',
  footer: 'fixed bottom-0 inset-x-0 text-center py-2 text-xs text-stone-400 pointer-events-none',
  footerLink: 'underline underline-offset-2 hover:text-stone-600 transition-colors pointer-events-auto',
};

// ─── Ink & Paper ─────────────────────────────────────────────────────────────

const ink: Theme = {
  name: 'ink',
  label: 'Ink',

  page: 'min-h-screen bg-white p-6',

  card: 'bg-white rounded-md p-6 border border-gray-200',
  cardActive: 'bg-white rounded-md border-2 border-indigo-500 p-6',
  cardAlert: 'bg-white rounded-md p-6 border-2 border-orange-400',
  dialog: 'bg-white rounded-md p-8 max-w-sm w-full border border-gray-300',
  overlay: 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6',
  listItem: 'bg-gray-50 rounded-md p-3',
  infoBox: 'bg-indigo-50 rounded-md p-4 border border-indigo-100',

  btnPrimary: 'bg-gray-900 text-white rounded-md font-medium hover:bg-gray-800 transition-colors',
  btnPrimaryDisabled: 'bg-gray-200 text-gray-400 rounded-md font-medium cursor-not-allowed',
  btnConfirm: 'bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-colors',
  btnSecondary: 'bg-gray-100 text-gray-800 rounded-md font-medium hover:bg-gray-200 transition-colors',
  btnOutline: 'border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors',
  btnDanger: 'bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors',
  btnSmall: 'bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors',
  btnGhost: 'text-indigo-600 hover:text-indigo-800 font-medium transition-colors',

  btnIconVoteActive: 'p-2.5 rounded-md bg-red-50 text-red-500 hover:bg-red-100 transition-colors',
  btnIconVoteInactive: 'p-2.5 rounded-md bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors',
  btnIconEdit: 'p-2.5 rounded-md bg-gray-100 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors',
  btnIconDelete: 'p-2.5 rounded-md bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors',

  input: 'w-full px-4 py-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition-colors',
  textarea: 'w-full px-4 py-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition-colors resize-none',
  slider: 'w-full h-2 bg-gray-200 rounded appearance-none cursor-pointer accent-indigo-600',

  heading: 'text-gray-900',
  body: 'text-gray-500',
  muted: 'text-gray-400',

  iconBubble: 'inline-flex items-center justify-center w-14 h-14 bg-gray-900 rounded-lg mb-4',

  accent: 'text-indigo-600',
  accentBg: 'bg-indigo-50',
  accentBorder: 'border-indigo-200',

  successText: 'text-green-600',
  successBg: 'bg-green-50',
  warningText: 'text-orange-600',
  warningBg: 'bg-orange-50',
  dangerText: 'text-red-600',
  dangerBg: 'bg-red-50',

  avatar: 'w-10 h-10 bg-gray-900 rounded-md flex items-center justify-center text-white font-bold',
  participantBadge: 'flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm font-medium',
  participantBadgeAvatar: 'w-5 h-5 bg-gray-900 text-white rounded-sm flex items-center justify-center text-xs font-bold',
  rankBadge: (rank: number) =>
    rank === 1
      ? 'w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold bg-yellow-100 text-yellow-800'
      : rank === 2
        ? 'w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold bg-gray-100 text-gray-700'
        : rank === 3
          ? 'w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold bg-orange-100 text-orange-700'
          : 'w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold bg-indigo-50 text-indigo-700',
  discussedBadge: 'text-xs text-green-700 bg-green-50 px-2.5 py-1 rounded-sm font-medium',
  progressTrack: 'w-full bg-gray-200 rounded-full',
  progressFill: 'bg-indigo-500 rounded-full transition-all duration-500',
  stepActive: 'flex items-center justify-center w-8 h-8 rounded-md text-sm font-medium bg-gray-900 text-white transition-all duration-300',
  stepInactive: 'flex items-center justify-center w-8 h-8 rounded-md text-sm font-medium bg-gray-200 text-gray-500 transition-all duration-300',
  divider: 'border-t border-gray-200',
  voteColor: 'text-red-500',
  voteColorMuted: 'text-gray-400',

  endSessionBtn: 'fixed top-4 left-4 z-50 flex items-center gap-1.5 px-3 py-2 bg-white text-gray-500 text-xs font-medium rounded-md border border-gray-300 hover:border-red-400 hover:text-red-500 transition-colors',
  phaseTimer: 'fixed top-4 right-4 bg-white rounded-md p-3 border border-gray-200 z-50',
  timerCard: 'bg-white rounded-md p-6 border border-gray-200',
  timerExtendBtn: 'flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium',
  footer: 'fixed bottom-0 inset-x-0 text-center py-2 text-xs text-gray-400 pointer-events-none',
  footerLink: 'underline underline-offset-2 hover:text-gray-600 transition-colors pointer-events-auto',
};

// ─── Exports ─────────────────────────────────────────────────────────────────

export const themes: Record<ThemeName, Theme> = { notion, warm, ink };
