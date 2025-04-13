import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { EditorState, convertToRaw, convertFromRaw, RichUtils, getDefaultKeyBinding, DraftHandleValue } from 'draft-js';
import Editor from '@draft-js-plugins/editor';
import createToolbarPlugin from '@draft-js-plugins/static-toolbar';
import { 
  ItalicButton,
  BoldButton,
  UnderlineButton,
  CodeButton,
  UnorderedListButton,
  OrderedListButton,
  BlockquoteButton,
  CodeBlockButton,
} from '@draft-js-plugins/buttons';
import '@draft-js-plugins/static-toolbar/lib/plugin.css';
import 'draft-js/dist/Draft.css';

const staticToolbarPlugin = createToolbarPlugin();
const { Toolbar } = staticToolbarPlugin;
const plugins = [staticToolbarPlugin];

export type RichTextContent = {
  rawContent: any;
  plainText: string;
};

export interface RichTextEditorRef {
  getContent: () => RichTextContent;
  setContent: (content: any) => void;
  focus: () => void;
  isEmpty: () => boolean;
}

interface RichTextEditorProps {
  initialContent?: any;
  placeholder?: string;
  readOnly?: boolean;
  onChange?: (content: RichTextContent) => void;
  className?: string;
  autoFocus?: boolean;
  showToolbar?: boolean;
  onBlur?: () => void;
  onFocus?: () => void;
  onEscape?: () => void;
}

export const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>((props, ref) => {
  const {
    initialContent,
    placeholder = 'Take a note...',
    readOnly = false,
    onChange,
    className = '',
    autoFocus = false,
    showToolbar = true,
    onBlur,
    onFocus,
    onEscape
  } = props;

  const [editorState, setEditorState] = React.useState(() => {
    if (initialContent && typeof initialContent === 'object' && initialContent.blocks) {
      try {
        return EditorState.createWithContent(convertFromRaw(initialContent));
      } catch (e) {
        console.error('Error creating editor content:', e);
        return EditorState.createEmpty();
      }
    }
    return EditorState.createEmpty();
  });

  const editorRef = useRef<Editor>(null);

  useEffect(() => {
    if (autoFocus && editorRef.current) {
      setTimeout(() => {
        editorRef.current?.focus();
      }, 100);
    }
  }, [autoFocus]);

  useEffect(() => {
    if (initialContent && typeof initialContent === 'object' && initialContent.blocks && !editorState.getCurrentContent().hasText()) {
      try {
        setEditorState(EditorState.createWithContent(convertFromRaw(initialContent)));
      } catch (e) {
        console.error('Error updating editor content:', e);
      }
    }
  }, [initialContent]);

  const handleKeyCommand = (command: string, editorState: EditorState): DraftHandleValue => {
    if (command === 'escape' && onEscape) {
      onEscape();
      return 'handled';
    }

    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  const keyBindingFn = (e: React.KeyboardEvent): string | null => {
    if (e.key === 'Escape') {
      return 'escape';
    }
    return getDefaultKeyBinding(e);
  };

  const handleChange = (newEditorState: EditorState) => {
    setEditorState(newEditorState);
    
    if (onChange) {
      const contentState = newEditorState.getCurrentContent();
      const rawContent = convertToRaw(contentState);
      const plainText = contentState.getPlainText();
      
      onChange({ rawContent, plainText });
    }
  };

  useImperativeHandle(ref, () => ({
    getContent: () => {
      const contentState = editorState.getCurrentContent();
      const rawContent = convertToRaw(contentState);
      const plainText = contentState.getPlainText();
      return { rawContent, plainText };
    },
    setContent: (content) => {
      if (content && typeof content === 'object' && content.blocks) {
        try {
          setEditorState(EditorState.createWithContent(convertFromRaw(content)));
        } catch (e) {
          console.error('Error setting editor content:', e);
          setEditorState(EditorState.createEmpty());
        }
      } else {
        setEditorState(EditorState.createEmpty());
      }
    },
    focus: () => {
      editorRef.current?.focus();
    },
    isEmpty: () => {
      return !editorState.getCurrentContent().hasText();
    }
  }));

  return (
    <div className={`rich-text-editor ${className}`}>
      {showToolbar && !readOnly && (
        <Toolbar>
          {(externalProps) => (
            <div className="flex items-center py-1 px-1 border-b border-gray-200 dark:border-gray-700 mb-2 overflow-x-auto">
              <BoldButton {...externalProps} />
              <ItalicButton {...externalProps} />
              <UnderlineButton {...externalProps} />
              <CodeButton {...externalProps} />
              <div className="mx-1 border-r border-gray-300 dark:border-gray-700 h-6"></div>
              <UnorderedListButton {...externalProps} />
              <OrderedListButton {...externalProps} />
              <BlockquoteButton {...externalProps} />
              <CodeBlockButton {...externalProps} />
            </div>
          )}
        </Toolbar>
      )}
      <div className="w-full">
        <Editor
          editorState={editorState}
          onChange={handleChange}
          placeholder={placeholder}
          readOnly={readOnly}
          plugins={plugins}
          ref={editorRef}
          handleKeyCommand={handleKeyCommand}
          keyBindingFn={keyBindingFn}
          onBlur={onBlur}
          onFocus={onFocus}
        />
      </div>
    </div>
  );
});

RichTextEditor.displayName = 'RichTextEditor';
