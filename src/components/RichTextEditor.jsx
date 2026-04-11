import React, { useMemo, useRef, useState, useCallback } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { 
  $getSelection, 
  $isRangeSelection,
  $createParagraphNode,
  COMMAND_PRIORITY_HIGH,
} from 'lexical';
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import { INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND } from '@lexical/list';
import './RichTextEditor.css';

/**
 * Error Boundary for Lexical
 */
const LexicalErrorBoundary = ({ children }) => <>{children}</>;

/**
 * Slash Command Menu Component
 */
function SlashCommandMenu({ 
  items, 
  selectedIndex, 
  onSelect, 
  isVisible,
  position,
  searchQuery 
}) {
  const menuRef = useRef(null);
  const selectedItemRef = useRef(null);

  React.useEffect(() => {
    if (selectedItemRef.current && menuRef.current) {
      selectedItemRef.current.scrollIntoView({ 
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [selectedIndex, isVisible]);

  if (!isVisible || items.length === 0) {
    return null;
  }

  const menuStyle = {
    position: 'fixed',
    top: position?.top || '0',
    left: position?.left || '0',
    zIndex: 1000,
  };

  return (
    <div 
      className="slash-command-menu-wrapper"
      style={menuStyle}
    >
      <div 
        className="slash-command-menu" 
        ref={menuRef}
      >
        <div className="slash-command-header">BASIC BLOCKS</div>
        {searchQuery && (
          <div className="slash-command-search-display">
            /{searchQuery}
          </div>
        )}
        <div className="slash-command-items-container">
          {items.map((item, index) => (
            <button
              key={item.id}
              ref={index === selectedIndex ? selectedItemRef : null}
              className={`slash-command-item ${index === selectedIndex ? 'active' : ''}`}
              onClick={() => onSelect(item)}
              type="button"
            >
              <span className="slash-command-icon">{item.icon}</span>
              <span className="slash-command-label">{item.label}</span>
              {item.shortcut && <span className="slash-command-shortcut">{item.shortcut}</span>}
            </button>
          ))}
        </div>
        <div className="slash-command-footer">
          <span className="slash-command-hint">esc</span>
          <span className="slash-command-text">Close menu</span>
        </div>
      </div>
    </div>
  );
}

/**
 * RichTextEditorCore - Inner component with Lexical context access
 * Handles slash commands and rich text formatting
 */
function RichTextEditorCore({ onChange, placeholder }) {
  const [editor] = useLexicalComposerContext();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [position, setPosition] = useState(null);
  const [query, setQuery] = useState('');

  // Track active formatting for multi-command stacking
  const activeFormattingRef = useRef(null);
  
  const commands = [
    { id: 'text', label: 'Text', icon: 'T' },
    { id: 'bold', label: 'Bold', icon: 'B', shortcut: '**' },
    { id: 'italic', label: 'Italic', icon: 'I', shortcut: '*' },
    { id: 'h1', label: 'Heading 1', icon: 'H₁', shortcut: '#' },
    { id: 'h2', label: 'Heading 2', icon: 'H₂', shortcut: '##' },
    { id: 'h3', label: 'Heading 3', icon: 'H₃', shortcut: '###' },
    { id: 'h4', label: 'Heading 4', icon: 'H₄', shortcut: '####' },
    { id: 'ul', label: 'Bulleted list', icon: '•', shortcut: '-' },
    { id: 'ol', label: 'Numbered list', icon: '1.' },
    { id: 'quote', label: 'Quote', icon: '"' },
    { id: 'code', label: 'Code block', icon: '<>' },
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  /**
   * Clear previous formatting when new slash command is applied
   */
  const clearPreviousFormatting = useCallback(() => {
    if (activeFormattingRef.current && activeFormattingRef.current !== 'text') {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          // Clear inline formatting
          selection.formatText('bold', false);
          selection.formatText('italic', false);
          selection.formatText('code', false);
        }
      });
    }
  }, [editor]);

  /**
   * Apply formatting for the selected command
   */
  const applyFormatting = useCallback((commandId) => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      // Clear previous formatting first
      clearPreviousFormatting();

      switch (commandId) {
        case 'bold':
          selection.formatText('bold');
          break;
        case 'italic':
          selection.formatText('italic');
          break;
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
          // For headings, we'll use a special code format marker
          selection.formatText('code');
          break;
        case 'quote':
          selection.formatText('code');
          break;
        case 'code':
          selection.formatText('code');
          break;
        case 'ul':
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
          break;
        case 'ol':
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
          break;
        case 'text':
        default:
          // Plain text - clear all formatting
          selection.formatText('bold', false);
          selection.formatText('italic', false);
          selection.formatText('code', false);
          break;
      }

      // Update active formatting for multi-command stacking
      activeFormattingRef.current = commandId;
    });
  }, [editor, clearPreviousFormatting]);

  /**
   * Handle menu selection
   */
  const handleMenuSelect = useCallback((item) => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      // Delete "/" + query characters backwards
      const charsToDelete = 1 + query.length;
      for (let i = 0; i < charsToDelete; i++) {
        selection.deleteCharacter(true);
      }
    });

    // Apply formatting after deletion
    applyFormatting(item.id);

    // Close menu and reset
    setIsOpen(false);
    setQuery('');
    onChange(editor.getEditorState().toJSON());
  }, [editor, query, applyFormatting, onChange]);

  /**
   * Handle key down events
   */
  const handleKeyDown = useCallback((e) => {
    // Detect "/" to open menu
    if (e.key === '/' && !isOpen) {
      setTimeout(() => {
        const contentEditor = document.querySelector('.editor-input');
        if (contentEditor) {
          const text = contentEditor.textContent;
          
          if (text && text.endsWith('/')) {
            const beforeSlash = text.substring(0, text.length - 1);
            // Only open menu if "/" is at start or after whitespace
            if (text === '/' || beforeSlash.endsWith(' ') || beforeSlash.endsWith('\n')) {
              setIsOpen(true);
              setSelectedIndex(0);
              setQuery('');
              
              // Position menu near cursor
              const selection = window.getSelection();
              if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                
                let top = rect.bottom + 8;
                let left = rect.left;
                const menuWidth = 260;
                const menuHeight = 320;
                
                if (left + menuWidth > window.innerWidth) {
                  left = window.innerWidth - menuWidth - 10;
                }
                if (top + menuHeight > window.innerHeight) {
                  top = rect.top - menuHeight - 8;
                }
                
                left = Math.max(10, left);
                top = Math.max(10, top);
                
                setPosition({ top, left });
              }
            }
          }
        }
      }, 0);
      return;
    }

    // Handle menu interactions
    if (isOpen) {
      // Escape: close menu, keep "/" as text
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(false);
        setQuery('');
        return;
      }

      // Arrow Down: next item
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
        return;
      }

      // Arrow Up: prev item
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        return;
      }

      // Enter: select command
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        if (filteredCommands.length > 0 && selectedIndex < filteredCommands.length) {
          handleMenuSelect(filteredCommands[selectedIndex]);
        }
        return;
      }

      // Space: close menu
      if (e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(false);
        setQuery('');
        return;
      }

      // Regular character: add to query
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        setQuery((prev) => prev + e.key);
        setSelectedIndex(0);
        return;
      }

      // Backspace: remove from query or close menu
      if (e.key === 'Backspace') {
        e.preventDefault();
        e.stopPropagation();
        const newQuery = query.slice(0, -1);
        
        if (newQuery === '') {
          // Delete the "/" character and close menu
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              selection.deleteCharacter(true);
            }
          });
          setIsOpen(false);
          onChange(editor.getEditorState().toJSON());
        } else {
          // Just update query
          setQuery(newQuery);
        }
        return;
      }
    }
  }, [isOpen, query, filteredCommands, selectedIndex, handleMenuSelect, editor, onChange]);

  /**
   * Prevent Enter newline when menu is open
   */
  const handleBeforeInput = useCallback((e) => {
    if (isOpen && e.inputType === 'insertLineBreak') {
      e.preventDefault();
    }
  }, [isOpen]);

  const handleInput = useCallback(() => {
    onChange(editor.getEditorState().toJSON());
  }, [editor, onChange]);

  return (
    <>
      <RichTextPlugin
        contentEditable={
          <ContentEditable 
            className="editor-input" 
            aria-placeholder={placeholder}
            onKeyDown={handleKeyDown}
            onBeforeInput={handleBeforeInput}
            onInput={handleInput}
          />
        }
        placeholder={<div className="editor-placeholder">{placeholder}</div>}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      <SlashCommandMenu
        items={filteredCommands}
        selectedIndex={selectedIndex}
        onSelect={handleMenuSelect}
        isVisible={isOpen}
        position={position}
        searchQuery={query}
      />
    </>
  );
}

/**
 * RichTextEditor - Notion-style rich text editor with slash commands
 * 
 * Features:
 * - 11 formatting commands accessible via "/"
 * - Multi-command stacking: new slash commands override previous formatting
 * - Notion-style UX: Escape keeps "/", Enter selects without newline
 * - Real-time filtering by typing after "/"
 * - Works in CarePlanBuilder and WikiEditor
 */
function RichTextEditor({ value, onChange, placeholder = 'Start typing...' }) {
  const initialConfig = useMemo(() => ({
    namespace: 'RichTextEditor',
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
      AutoLinkNode,
      LinkNode,
    ],
    onError: (error) => {
      console.error('Lexical error:', error);
    },
  }), []);

  return (
    <div className="rich-text-editor">
      <LexicalComposer initialConfig={initialConfig}>
        <div className="editor-container">
          <RichTextEditorCore 
            onChange={onChange}
            placeholder={placeholder}
          />
        </div>
      </LexicalComposer>
    </div>
  );
}

export default RichTextEditor;
