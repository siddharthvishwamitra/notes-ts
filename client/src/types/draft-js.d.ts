declare module 'draft-js' {
  import { Component, ReactNode, KeyboardEvent } from 'react';

  export class Editor extends Component<any, any> {}
  export class EditorState {
    static createEmpty(): any;
    static createWithContent(content: any): any;
    getCurrentContent(): any;
    getSelection(): any;
  }
  export function convertFromRaw(rawContent: any): any;
  export function convertToRaw(contentState: any): any;
  export type DraftHandleValue = 'handled' | 'not-handled';
  export type DraftEditorCommand = string;
  export const RichUtils: {
    handleKeyCommand: (editorState: EditorState, command: string) => EditorState | null;
    toggleBlockType: (editorState: EditorState, blockType: string) => EditorState;
    toggleInlineStyle: (editorState: EditorState, inlineStyle: string) => EditorState;
  };
  export function getDefaultKeyBinding(e: KeyboardEvent): string | null;
}