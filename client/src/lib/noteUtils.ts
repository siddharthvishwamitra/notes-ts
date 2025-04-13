import { v4 as uuidv4 } from 'uuid';
import { Note } from '@shared/schema';
import { RichTextContent } from './richTextEditor';

export type NoteColor = 
  | 'default'
  | 'red'
  | 'orange' 
  | 'yellow' 
  | 'green' 
  | 'teal' 
  | 'blue' 
  | 'purple'
  | 'pink'
  | 'gray';

export interface NoteColorInfo {
  id: NoteColor;
  name: string;
  bgClass: string;
  darkBgClass: string;
  borderClass: string;
  darkBorderClass: string;
}

export const noteColors: NoteColorInfo[] = [
  { 
    id: 'default', 
    name: 'Default', 
    bgClass: 'bg-white', 
    darkBgClass: 'dark:bg-gray-800', 
    borderClass: 'border-gray-200', 
    darkBorderClass: 'dark:border-gray-700' 
  },
  { 
    id: 'red', 
    name: 'Red', 
    bgClass: 'bg-red-50', 
    darkBgClass: 'dark:bg-red-900/30', 
    borderClass: 'border-red-200', 
    darkBorderClass: 'dark:border-red-800/50' 
  },
  { 
    id: 'orange', 
    name: 'Orange', 
    bgClass: 'bg-orange-50', 
    darkBgClass: 'dark:bg-orange-900/30', 
    borderClass: 'border-orange-200', 
    darkBorderClass: 'dark:border-orange-800/50' 
  },
  { 
    id: 'yellow', 
    name: 'Yellow', 
    bgClass: 'bg-amber-50', 
    darkBgClass: 'dark:bg-amber-900/30', 
    borderClass: 'border-amber-200', 
    darkBorderClass: 'dark:border-amber-800/50' 
  },
  { 
    id: 'green', 
    name: 'Green', 
    bgClass: 'bg-green-50', 
    darkBgClass: 'dark:bg-green-900/30', 
    borderClass: 'border-green-200', 
    darkBorderClass: 'dark:border-green-800/50' 
  },
  { 
    id: 'teal', 
    name: 'Teal', 
    bgClass: 'bg-teal-50', 
    darkBgClass: 'dark:bg-teal-900/30', 
    borderClass: 'border-teal-200', 
    darkBorderClass: 'dark:border-teal-800/50' 
  },
  { 
    id: 'blue', 
    name: 'Blue', 
    bgClass: 'bg-blue-50', 
    darkBgClass: 'dark:bg-blue-900/30', 
    borderClass: 'border-blue-200', 
    darkBorderClass: 'dark:border-blue-800/50' 
  },
  { 
    id: 'purple', 
    name: 'Purple', 
    bgClass: 'bg-purple-50', 
    darkBgClass: 'dark:bg-purple-900/30', 
    borderClass: 'border-purple-200', 
    darkBorderClass: 'dark:border-purple-800/50' 
  },
  { 
    id: 'pink', 
    name: 'Pink', 
    bgClass: 'bg-pink-50', 
    darkBgClass: 'dark:bg-pink-900/30', 
    borderClass: 'border-pink-200', 
    darkBorderClass: 'dark:border-pink-800/50' 
  },
  { 
    id: 'gray', 
    name: 'Gray', 
    bgClass: 'bg-gray-50', 
    darkBgClass: 'dark:bg-gray-900/50', 
    borderClass: 'border-gray-200', 
    darkBorderClass: 'dark:border-gray-700/70' 
  }
];

export function getColorInfo(colorId: string | null): NoteColorInfo {
  if (!colorId) return noteColors[0]; // Default color
  return noteColors.find(color => color.id === colorId) || noteColors[0];
}

export function createEmptyNote(): Note {
  return {
    id: 0, // IndexedDB will assign actual ID
    uuid: uuidv4(),
    title: '',
    content: {},
    color: 'default',
    isPinned: false,
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    labels: [],
    userId: null
  };
}

export function sortNotes(notes: Note[]): Note[] {
  // First sort by isPinned, then by updatedAt
  return [...notes].sort((a, b) => {
    // Pinned notes come first
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    
    // Then sort by updatedAt (most recent first)
    const dateA = new Date(a.updatedAt).getTime();
    const dateB = new Date(b.updatedAt).getTime();
    return dateB - dateA;
  });
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function formatDate(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const noteDate = new Date(date);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (noteDate >= today) {
    return 'Today';
  } else if (noteDate >= yesterday) {
    return 'Yesterday';
  } else {
    // Format as "MMM DD"
    return noteDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }
}
