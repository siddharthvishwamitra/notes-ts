import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import CreateNoteInput from "@/components/CreateNoteInput";
import NotesList from "@/components/NotesList";
import NoteEditor from "@/components/NoteEditor";
import SettingsModal from "@/components/SettingsModal";
import SyncStatus from "@/components/SyncStatus";
import { useNotes } from "@/lib/useNotes";
import { Note } from "@shared/schema";
import { Plus } from "lucide-react";
import { initAutoSync } from "@/lib/googleDriveSync";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGridView, setIsGridView] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>("notes");

  const {
    notes,
    filteredNotes,
    isLoading,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    toggleArchive,
    changeColor,
  } = useNotes();

  useEffect(() => {
    // Initialize auto-sync
    const cleanup = initAutoSync();
    return () => cleanup();
  }, []);

  const selectedNote = selectedNoteId 
    ? notes.find(note => note.uuid === selectedNoteId) 
    : null;

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleViewToggle = () => {
    setIsGridView(!isGridView);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNoteId(note.uuid);
  };

  const handleCloseEditor = () => {
    setSelectedNoteId(null);
  };

  const handleCreateNote = (note: Note) => {
    updateNote(note);
  };

  const handleUpdateNote = (note: Note) => {
    updateNote(note);
  };

  const handleDeleteNote = (uuid: string) => {
    deleteNote(uuid);
    if (selectedNoteId === uuid) {
      setSelectedNoteId(null);
    }
  };

  const displayedNotes = filteredNotes({
    searchTerm,
    isArchived: selectedSection === "archive" ? true : undefined,
    excludeArchived: selectedSection !== "archive"
  });

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header 
        onMenuToggle={handleToggleSidebar}
        onSearch={handleSearch}
        onSettingsClick={() => setIsSettingsOpen(true)}
        onViewToggle={handleViewToggle}
        isGridView={isGridView}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          isOpen={isSidebarOpen} 
          selectedSection={selectedSection}
          onSelectSection={setSelectedSection}
        />
        
        <main className={`flex-1 transition-all duration-300 overflow-auto ${isSidebarOpen ? 'md:ml-64' : ''}`}>
          <div className="container mx-auto px-4 py-4">
            {selectedSection !== "archive" && (
              <CreateNoteInput onSave={handleCreateNote} />
            )}
            
            <NotesList 
              notes={displayedNotes}
              isLoading={isLoading}
              isGridView={isGridView}
              onSelectNote={handleSelectNote}
              onTogglePin={togglePin}
              onToggleArchive={toggleArchive}
              onChangeColor={changeColor}
              onDeleteNote={handleDeleteNote}
            />
          </div>
        </main>
      </div>
      
      {/* Floating Action Button */}
      <div className="fixed right-6 bottom-6">
        <button 
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-transform hover:scale-105"
          onClick={() => {
            const newNote = createNote();
            updateNote(newNote);
            handleSelectNote(newNote);
          }}
        >
          <Plus size={24} />
        </button>
      </div>
      
      {/* Note Editor Modal */}
      {selectedNote && (
        <NoteEditor 
          note={selectedNote}
          onClose={handleCloseEditor}
          onSave={handleUpdateNote}
          onDelete={handleDeleteNote}
          onTogglePin={togglePin}
          onToggleArchive={toggleArchive}
          onChangeColor={changeColor}
        />
      )}
      
      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
      
      {/* Sync Status */}
      <SyncStatus />
    </div>
  );
}
