import { useState } from 'react';
import { 
  Bell, 
  UserPlus, 
  Palette, 
  Image, 
  Archive, 
  MoreVertical,
  Pin,
  PinOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { Editor, EditorState, convertFromRaw } from 'draft-js';
import 'draft-js/dist/Draft.css';

interface NoteItemProps {
  note: Note;
  onClick: () => void;
  onTogglePin: () => void;
  onToggleArchive: () => void;
  onChangeColor: (color: string) => void;
  onDelete: () => void;
  onDoubleClick?: () => void;
}

export default function NoteItem({ 
  note, 
  onClick, 
  onTogglePin,
  onToggleArchive,
  onChangeColor,
  onDelete,
  onDoubleClick
}: NoteItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const colorInfo = getColorInfo(note.color);
  
  // Setup editor state if content exists
  const editorState = note.content && typeof note.content === 'object' && Object.keys(note.content).length > 0
    ? EditorState.createWithContent(convertFromRaw(note.content))
    : EditorState.createEmpty();

  const handlePinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTogglePin();
  };

  return (
    <div 
      className={`group note-card rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer animate-in fade-in-0 zoom-in-95 ${colorInfo.bgClass} ${colorInfo.darkBgClass} border-${colorInfo.borderClass} ${colorInfo.darkBorderClass}`}
      onClick={onClick}
      onDoubleClick={onDoubleClick || onClick} 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative p-4">
        {/* Pin Button - Visible on hover or if pinned */}
        <button 
          className={`absolute right-2 top-2 transition-opacity ${
            isHovered || note.isPinned ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={handlePinClick}
          aria-label={note.isPinned ? "Unpin note" : "Pin note"}
        >
          {note.isPinned ? (
            <Pin className="h-5 w-5 text-primary" />
          ) : (
            <PinOff className="h-5 w-5 text-muted-foreground" />
          )}
        </button>
        
        {/* Note Content */}
        {note.title && (
          <div className="font-medium text-lg mb-2 pr-6">{note.title}</div>
        )}
        
        <div className="text-sm min-h-[20px] max-h-[200px] overflow-hidden">
          <Editor
            editorState={editorState}
            onChange={() => {}}
            readOnly={true}
          />
        </div>
      </div>
      
      {/* Actions Footer */}
      <div className="flex items-center justify-between p-2 border-t border-border">
        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              // Reminder functionality would go here
            }}
            aria-label="Set reminder"
          >
            <Bell className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              // Collaborator functionality would go here
            }}
            aria-label="Add collaborator"
          >
            <UserPlus className="h-4 w-4" />
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => e.stopPropagation()}
                aria-label="Change color"
              >
                <Palette className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-64 p-2" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid grid-cols-5 gap-2">
                {noteColors.map((color) => (
                  <button
                    key={color.id}
                    className={`h-8 w-8 rounded-full ${color.bgClass} ${color.darkBgClass} border ${color.borderClass} ${color.darkBorderClass} hover:shadow-md transition-shadow ${
                      note.color === color.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => onChangeColor(color.id)}
                    aria-label={`Set color to ${color.name}`}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              // Image functionality would go here
            }}
            aria-label="Add image"
          >
            <Image className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onToggleArchive();
            }}
            aria-label={note.isArchived ? "Unarchive" : "Archive"}
          >
            <Archive className="h-4 w-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => e.stopPropagation()}
                aria-label="More options"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem 
                onClick={() => onDelete()}
                className="text-destructive focus:text-destructive"
              >
                Delete note
              </DropdownMenuItem>
              <DropdownMenuItem>
                Add label
              </DropdownMenuItem>
              <DropdownMenuItem>
                Make a copy
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Date Display */}
        <div className="text-xs text-muted-foreground ml-auto">
          {formatDate(new Date(note.updatedAt))}
        </div>
      </div>
    </div>
  );
}
