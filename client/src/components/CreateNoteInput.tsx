import { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  CheckSquare, 
  Brush, 
  Image, 
  Bell, 
  UserPlus, 
  Palette, 
  Archive, 
  MoreVertical 
} from 'lucide-react';
import { RichTextEditor, type RichTextEditorRef } from '@/lib/richTextEditor';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Note } from '@shared/schema';
import { createEmptyNote } from '@/lib/noteUtils';

interface CreateNoteInputProps {
  onSave: (note: Note) => void;
}

export default function CreateNoteInput({ onSave }: CreateNoteInputProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const editorRef = useRef<RichTextEditorRef>(null);

  const handleExpand = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  const handleClose = () => {
    const editorContent = editorRef.current?.getContent();
    
    if (editorContent && (title.trim() !== '' || editorContent.plainText.trim() !== '')) {
      const note = createEmptyNote();
      note.uuid = uuidv4();
      note.title = title;
      note.content = editorContent.rawContent;
      
      onSave(note);
    }
    
    // Reset form
    setTitle('');
    editorRef.current?.setContent(null);
    setIsExpanded(false);
  };

  return (
    <div className="max-w-2xl mx-auto mb-8">
      <div 
        className="bg-background border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 mx-auto"
        onClick={handleExpand}
      >
        {!isExpanded ? (
          <div className="p-4 cursor-text">
            <div className="flex items-center">
              <Input
                type="text"
                placeholder="Take a note..."
                className="flex-grow bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                onClick={handleExpand}
              />
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExpand();
                  }}
                >
                  <CheckSquare className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExpand();
                  }}
                >
                  <Brush className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExpand();
                  }}
                >
                  <Image className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="p-4">
              <Input
                type="text"
                placeholder="Title"
                className="w-full bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-lg mb-2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <div className="min-h-[100px]">
                <RichTextEditor
                  ref={editorRef}
                  placeholder="Take a note..."
                  autoFocus
                  showToolbar={false}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-2 border-t border-border">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground"
                  title="Remind me"
                >
                  <Bell className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground"
                  title="Collaborator"
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground"
                  title="Background options"
                >
                  <Palette className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground"
                  title="Add image"
                >
                  <Image className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground"
                  title="Archive"
                >
                  <Archive className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground"
                  title="More"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
              <Button
                variant="ghost"
                className="text-sm font-medium"
                onClick={handleClose}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
