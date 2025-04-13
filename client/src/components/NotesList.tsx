import { useState, useEffect } from 'react';
import { Note } from '@shared/schema';
import NoteItem from './Note';
import { Skeleton } from '@/components/ui/skeleton';

interface NotesListProps {
  notes: Note[];
  isLoading: boolean;
  isGridView: boolean;
  onSelectNote: (note: Note) => void;
  onTogglePin: (note: Note) => void;
  onToggleArchive: (note: Note) => void;
  onChangeColor: (note: Note, color: string) => void;
  onDeleteNote: (uuid: string) => void;
}

export default function NotesList({
  notes,
  isLoading,
  isGridView,
  onSelectNote,
  onTogglePin,
  onToggleArchive,
  onChangeColor,
  onDeleteNote
}: NotesListProps) {
  const [animatedNotes, setAnimatedNotes] = useState<Note[]>([]);

  // Animate notes when they change
  useEffect(() => {
    setAnimatedNotes(notes);
  }, [notes]);

  if (isLoading) {
    return (
      <div className={`grid gap-4 ${isGridView 
        ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
        : 'grid-cols-1 max-w-2xl mx-auto'}`}
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="w-full h-48" />
        ))}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="120" 
          height="120" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="mb-4 opacity-20"
        >
          <path d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20z"/>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
          <line x1="9" y1="9" x2="9.01" y2="9"/>
          <line x1="15" y1="9" x2="15.01" y2="9"/>
        </svg>
        <p className="text-lg">Notes you add appear here</p>
      </div>
    );
  }

  return (
    <div 
      className={`grid gap-4 ${isGridView 
        ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
        : 'grid-cols-1 max-w-2xl mx-auto'}`}
    >
      {animatedNotes.map((note) => (
        <NoteItem
          key={note.uuid}
          note={note}
          onClick={() => onSelectNote(note)}
          onDoubleClick={() => onSelectNote(note)}
          onTogglePin={() => onTogglePin(note)}
          onToggleArchive={() => onToggleArchive(note)}
          onChangeColor={(color) => onChangeColor(note, color)}
          onDelete={() => onDeleteNote(note.uuid)}
        />
      ))}
    </div>
  );
}
