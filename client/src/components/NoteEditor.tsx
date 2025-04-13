import { useState, useRef, useEffect } from 'react';
import { RichTextEditor, RichTextEditorRef, RichTextContent } from '@/lib/richTextEditor';
import { 
  Bell, 
  UserPlus, 
  Palette, 
  Image, 
  Archive, 
  MoreVertical,
  Pin,
  PinOff,
  Trash2,
  Copy,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Note } from '@shared/schema';
import { formatDate, getColorInfo, noteColors } from '@/lib/noteUtils';

interface NoteEditorProps {
  note: Note;
  onClose: () => void;
  onSave: (note: Note) => void;
  onDelete: (uuid: string) => void;
  onTogglePin: (note: Note) => void;
  onToggleArchive: (note: Note) => void;
  onChangeColor: (note: Note, color: string) => void;
}

export default function NoteEditor({ 
  note,
  onClose,
  onSave,
  onDelete,
  onTogglePin,
  onToggleArchive,
  onChangeColor
}: NoteEditorProps) {
  const [title, setTitle] = useState(note.title || '');
  const [hasChanges, setHasChanges] = useState(false);
  const editorRef = useRef<RichTextEditorRef>(null);
  const colorInfo = getColorInfo(note.color);
  
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        saveAndClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [title, hasChanges]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setHasChanges(true);
  };

  const handleContentChange = (content: RichTextContent) => {
    setHasChanges(true);
  };

  const saveAndClose = () => {
    if (hasChanges) {
      const editorContent = editorRef.current?.getContent();
      
      if (editorContent) {
        const updatedNote: Note = {
          ...note,
          title,
          content: editorContent.rawContent,
          updatedAt: new Date()
        };
        
        onSave(updatedNote);
      }
    }
    
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && saveAndClose()}>
      <DialogContent 
        className={`sm:max-w-[90vw] h-[90vh] ${colorInfo.bgClass} ${colorInfo.darkBgClass}`}
      >
        <DialogTitle className="sr-only">Note Editor</DialogTitle>
        <div className="p-1">
          <div className="flex items-center mb-1">
            <Input
              type="text"
              placeholder="Title"
              className="flex-grow text-lg font-medium bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
              value={title}
              onChange={handleTitleChange}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onTogglePin(note)}
              className="ml-2"
              aria-label={note.isPinned ? "Unpin note" : "Pin note"}
            >
              {note.isPinned ? (
                <Pin className="h-5 w-5 text-primary" />
              ) : (
                <PinOff className="h-5 w-5 text-muted-foreground" />
              )}
            </Button>
          </div>
          
          <div className="min-h-[400px] max-h-[70vh] overflow-y-auto mb-4">
            <RichTextEditor
              ref={editorRef}
              initialContent={note.content}
              onChange={handleContentChange}
              autoFocus
            />
          </div>
          
          <div className="text-xs text-muted-foreground mb-2">
            {formatDate(new Date(note.updatedAt))}
          </div>
        </div>
        
        <DialogFooter className="flex items-center justify-between border-t border-border py-2 px-1">
          <div className="flex items-center overflow-x-auto">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              aria-label="Remind me"
            >
              <Bell className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              aria-label="Collaborator"
            >
              <UserPlus className="h-4 w-4" />
            </Button>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground"
                  aria-label="Background options"
                >
                  <Palette className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2">
                <div className="grid grid-cols-5 gap-2">
                  {noteColors.map((color) => (
                    <button
                      key={color.id}
                      className={`h-8 w-8 rounded-full ${color.bgClass} ${color.darkBgClass} border ${color.borderClass} ${color.darkBorderClass} hover:shadow-md transition-shadow ${
                        note.color === color.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => onChangeColor(note, color.id)}
                      aria-label={`Set color to ${color.name}`}
                    />
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              aria-label="Add image"
            >
              <Image className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              onClick={() => onToggleArchive(note)}
              aria-label={note.isArchived ? "Unarchive" : "Archive"}
            >
              <Archive className="h-4 w-4" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground"
                  aria-label="More options"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem 
                  onClick={() => {
                    onDelete(note.uuid);
                    onClose();
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete note
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="h-4 w-4 mr-2" />
                  Make a copy
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Tag className="h-4 w-4 mr-2" />
                  Add label
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <Button
            variant="ghost"
            onClick={saveAndClose}
            className="ml-4"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
