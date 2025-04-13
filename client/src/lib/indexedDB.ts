import Dexie, { type Table } from 'dexie';
import { type Note } from '@shared/schema';

export interface NoteWithoutId extends Omit<Note, 'id'> {}

class NotesDatabase extends Dexie {
  notes!: Table<Note, number>;
  
  constructor() {
    super('NotesDatabase');
    this.version(1).stores({
      notes: 'uuid, title, isPinned, isArchived, updatedAt, createdAt'
    });
  }
}

export const db = new NotesDatabase();

export async function initializeDb() {
  try {
    // Check if the database is accessible
    await db.notes.count();
    console.log('IndexedDB initialized successfully');
  } catch (error) {
    console.error('Failed to initialize IndexedDB:', error);
    throw error;
  }
}

export async function getAllNotes(): Promise<Note[]> {
  return await db.notes.toArray();
}

export async function getNoteByUuid(uuid: string): Promise<Note | undefined> {
  return await db.notes.get(uuid);
}

export async function saveNote(note: Note): Promise<string> {
  return await db.notes.put(note);
}

export async function deleteNote(uuid: string): Promise<void> {
  await db.notes.delete(uuid);
}

export async function searchNotes(query: string): Promise<Note[]> {
  if (!query.trim()) return getAllNotes();
  
  const searchTerm = query.toLowerCase().trim();
  
  return await db.notes
    .filter(note => {
      const titleMatch = note.title?.toLowerCase().includes(searchTerm);
      const contentMatch = typeof note.content === 'string' 
        ? note.content.toLowerCase().includes(searchTerm)
        : JSON.stringify(note.content).toLowerCase().includes(searchTerm);
      
      return titleMatch || contentMatch;
    })
    .toArray();
}

export async function getNotesByFilter({
  isPinned,
  isArchived,
  color
}: {
  isPinned?: boolean;
  isArchived?: boolean;
  color?: string;
}): Promise<Note[]> {
  let query = db.notes;
  
  if (isPinned !== undefined) {
    query = query.filter(note => note.isPinned === isPinned);
  }
  
  if (isArchived !== undefined) {
    query = query.filter(note => note.isArchived === isArchived);
  }
  
  if (color) {
    query = query.filter(note => note.color === color);
  }
  
  return await query.toArray();
}

export async function clearAllNotes(): Promise<void> {
  await db.notes.clear();
}
