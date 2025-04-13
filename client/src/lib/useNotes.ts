import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Note } from '@shared/schema';
import { 
  getAllNotes, 
  saveNote, 
  deleteNote as deleteNoteFromDb, 
  searchNotes as searchNotesInDb 
} from './indexedDB';
import { syncToDrive } from './googleDriveSync';
import { createEmptyNote, sortNotes } from './noteUtils';
import { useToast } from '@/hooks/use-toast';

export function useNotes() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get all notes
  const { 
    data: notes = [], 
    isLoading,
    error,
    refetch 
  } = useQuery({
    queryKey: ['/notes'],
    queryFn: async () => {
      const notes = await getAllNotes();
      return sortNotes(notes);
    }
  });
  
  // Filter notes based on search term, pinned, archived status
  const filteredNotes = useCallback((options: { 
    isPinned?: boolean, 
    isArchived?: boolean,
    excludeArchived?: boolean,
    searchTerm?: string
  } = {}) => {
    const { isPinned, isArchived, excludeArchived = true, searchTerm = '' } = options;
    
    let filtered = [...notes];
    
    // Filter by pinned status if specified
    if (isPinned !== undefined) {
      filtered = filtered.filter(note => note.isPinned === isPinned);
    }
    
    // Filter by archived status if specified
    if (isArchived !== undefined) {
      filtered = filtered.filter(note => note.isArchived === isArchived);
    } else if (excludeArchived) {
      filtered = filtered.filter(note => !note.isArchived);
    }
    
    // Filter by search term if specified
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(note => {
        const titleMatch = note.title?.toLowerCase().includes(term);
        const contentMatch = typeof note.content === 'string' 
          ? note.content.toLowerCase().includes(term)
          : JSON.stringify(note.content).toLowerCase().includes(term);
        
        return titleMatch || contentMatch;
      });
    }
    
    return sortNotes(filtered);
  }, [notes]);
  
  // Create or update a note
  const { mutate: saveNoteMutation, isPending: isSaving } = useMutation({
    mutationFn: async (note: Note) => {
      const result = await saveNote(note);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/notes'] });
      syncToDrive().catch(console.error);
    },
    onError: (error) => {
      toast({
        title: 'Failed to save note',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
  
  // Delete a note
  const { mutate: deleteNoteMutation, isPending: isDeleting } = useMutation({
    mutationFn: async (uuid: string) => {
      await deleteNoteFromDb(uuid);
      return uuid;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/notes'] });
      syncToDrive().catch(console.error);
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete note',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
  
  // Search for notes
  const searchNotes = useCallback(async (term: string) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      return notes;
    }
    
    const results = await searchNotesInDb(term);
    return results;
  }, [notes]);
  
  const createNote = useCallback(() => {
    const note = createEmptyNote();
    // We return the note without saving it
    // The caller is expected to call updateNote to save it
    return note;
  }, []);
  
  const updateNote = useCallback((note: Note) => {
    saveNoteMutation({ ...note, updatedAt: new Date() });
  }, [saveNoteMutation]);
  
  const deleteNote = useCallback((uuid: string) => {
    deleteNoteMutation(uuid);
  }, [deleteNoteMutation]);
  
  const togglePin = useCallback((note: Note) => {
    saveNoteMutation({
      ...note,
      isPinned: !note.isPinned,
      updatedAt: new Date()
    });
  }, [saveNoteMutation]);
  
  const toggleArchive = useCallback((note: Note) => {
    saveNoteMutation({
      ...note,
      isArchived: !note.isArchived,
      updatedAt: new Date()
    });
  }, [saveNoteMutation]);
  
  const changeColor = useCallback((note: Note, color: string) => {
    saveNoteMutation({
      ...note,
      color,
      updatedAt: new Date()
    });
  }, [saveNoteMutation]);
  
  return {
    notes,
    searchTerm,
    filteredNotes,
    isLoading,
    error,
    isSaving,
    isDeleting,
    refetch,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    toggleArchive,
    changeColor,
    searchNotes
  };
}
