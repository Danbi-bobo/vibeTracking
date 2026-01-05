
export enum EnergyLevel {
  EXTREME_LOW = 1,
  LOW = 2,
  NEUTRAL = 3,
  HIGH = 4,
  PEAK = 5
}

export interface JournalEntry {
  id: string;
  date: string; // ISO format YYYY-MM-DD
  energy: EnergyLevel;
  content: string;
  image?: string; // URL
  tags: string[];
  aiInsight?: string;
}

export const ENERGY_META = {
  [EnergyLevel.EXTREME_LOW]: { emoji: '😴', label: 'Cạn kiệt', color: '#fca5a5', bg: 'bg-red-100' },
  [EnergyLevel.LOW]: { emoji: '🥱', label: 'Hơi mệt', color: '#fcd34d', bg: 'bg-yellow-100' },
  [EnergyLevel.NEUTRAL]: { emoji: '😐', label: 'Bình thường', color: '#93c5fd', bg: 'bg-blue-100' },
  [EnergyLevel.HIGH]: { emoji: '😊', label: 'Tốt nè', color: '#86efac', bg: 'bg-green-100' },
  [EnergyLevel.PEAK]: { emoji: '🔥', label: 'Rực rỡ', color: '#f9a8d4', bg: 'bg-pink-100' },
};

export interface Theme {
  id: string;
  name: string;
  main: string;
  light: string;
  hover: string;
}

export const THEMES: Theme[] = [
  { id: 'indigo', name: 'Indigo', main: '#4f46e5', light: '#e0e7ff', hover: '#4338ca' },
  { id: 'emerald', name: 'Emerald', main: '#059669', light: '#d1fae5', hover: '#047857' },
  { id: 'rose', name: 'Rose', main: '#e11d48', light: '#ffe4e6', hover: '#be123c' },
  { id: 'amber', name: 'Amber', main: '#d97706', light: '#fef3c7', hover: '#b45309' },
  { id: 'violet', name: 'Violet', main: '#7c3aed', light: '#ede9fe', hover: '#6d28d9' },
];