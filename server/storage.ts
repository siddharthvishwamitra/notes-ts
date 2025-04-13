import { notes, users, type User, type InsertUser, type Note, type InsertNote } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Note functions
  getNotes(): Promise<Note[]>;
  getNoteById(id: number): Promise<Note | undefined>;
  getNoteByUuid(uuid: string): Promise<Note | undefined>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(uuid: string, note: Partial<InsertNote>): Promise<Note | undefined>;
  deleteNote(uuid: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private notes: Map<number, Note>;
  currentUserId: number;
  currentNoteId: number;

  constructor() {
    this.users = new Map();
    this.notes = new Map();
    this.currentUserId = 1;
    this.currentNoteId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getNotes(): Promise<Note[]> {
    return Array.from(this.notes.values());
  }

  async getNoteById(id: number): Promise<Note | undefined> {
    return this.notes.get(id);
  }

  async getNoteByUuid(uuid: string): Promise<Note | undefined> {
    return Array.from(this.notes.values()).find(
      (note) => note.uuid === uuid,
    );
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = this.currentNoteId++;
    const now = new Date();
    const note: Note = { 
      ...insertNote, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.notes.set(id, note);
    return note;
  }

  async updateNote(uuid: string, updateData: Partial<InsertNote>): Promise<Note | undefined> {
    const note = await this.getNoteByUuid(uuid);
    if (!note) return undefined;

    const updatedNote: Note = {
      ...note,
      ...updateData,
      updatedAt: new Date()
    };
    
    this.notes.set(note.id, updatedNote);
    return updatedNote;
  }

  async deleteNote(uuid: string): Promise<boolean> {
    const note = await this.getNoteByUuid(uuid);
    if (!note) return false;
    
    return this.notes.delete(note.id);
  }
}

export const storage = new MemStorage();
