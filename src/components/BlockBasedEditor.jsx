import React, { useMemo, useRef, useState, useCallback } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import {
  $createHeadingNode,
  $createQuoteNode,
} from '@lexical/rich-text';
import {
  $createListItemNode,
  $createListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list';
import {
  $createCodeNode,
} from '@lexical/code';
import {
  KEY_DOWN_COMMAND,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  COMMAND_PRIORITY_LOW,
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
} from 'lexical';
import './BlockBasedEditor.css';

/**
 * Simple Error Boundary for Lexical Editor
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
  position 
}) {
  const menuRef = useRef(null);
  const selectedItemRef = useRef(null);

  // Scroll selected item into view
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
 * Plugin to handle slash commands
 */
function SlashCommandPlugin({ onChange }) {
  const [editor] = useLexicalComposerContext();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [position, setPosition] = useState(null);
  const [query, setQuery] = useState('');
  const commandsRef = useRef([
    { id: 'text', label: 'Text', icon: 'T', action: (editor) => { /* default */ } },
    { id: 'bold', label: 'Bold', icon: 'B', shortcut: '**', action: (editor) => applyBold(editor) },
    { id: 'italic', label: 'Italic', icon: 'I', shortcut: '*', action: (editor) => applyItalic(editor) },
    { id: 'h1', label: 'Heading 1', icon: 'H₁', shortcut: '#', action: (editor) => insertHeading(editor, 'h1') },
    { id: 'h2', label: 'Heading 2', icon: 'H₂', shortcut: '##', action: (editor) => insertHeading(editor, 'h2') },
    { id: 'h3', label: 'Heading 3', icon: 'H₃', shortcut: '###', action: (editor) => insertHeading(editor, 'h3') },
    { id: 'h4', label: 'Heading 4', icon: 'H₄', shortcut: '####', action: (editor) => insertHeading(editor, 'h4') },
    { id: 'ul', label: 'Bulleted list', icon: '•', shortcut: '-', action: (editor) => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined) },
    { id: 'ol', label: 'Numbered list', icon: '1.', action: (editor) => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined) },
    { id: 'quote', label: 'Quote', icon: '"', action: (editor) => insertQuote(editor) },
    { id: 'code', label: 'Code block', icon: '<>', action: (editor) => insertCodeBlock(editor) },
  ]);

  const filteredCommands = commandsRef.current.filter(cmd => 
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  const applyBold = useCallback((editor) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.formatText('bold');
      }
    });
  }, []);

  const applyItalic = useCallback((editor) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.formatText('italic');
      }
    });
  }, []);

  const insertHeading = useCallback((editor, level) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const levelMap = { h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4' };
        const heading = $createHeadingNode(levelMap[level]);
        selection.insertNodes([heading]);
      }
    });
  }, []);

  const insertQuote = useCallback((editor) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const quote = $createQuoteNode();
        selection.insertNodes([quote]);
      }
    });
  }, []);

  const insertCodeBlock = useCallback((editor) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const codeBlock = $createCodeNode('javascript');
        selection.insertNodes([codeBlock]);
      }
    });
  }, []);

  React.useEffect(() => {
    return editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event) => {
        if (event.key === '/') {
          event.preventDefault();
          setIsOpen(true);
          setSelectedIndex(0);
          setQuery('');
          
          // Get cursor position for menu placement
          const selection = window.getSelection();
          if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            
            // Calculate position with viewport boundaries
            let top = rect.bottom + 8; // 8px below the text
            let left = rect.left;
            
            // Menu dimensions (approximate)
            const menuWidth = 260;
            const menuHeight = 320; // approximate max height with scrolling
            
            // Check if menu would go off-screen horizontally
            if (left + menuWidth > window.innerWidth) {
              left = window.innerWidth - menuWidth - 10;
            }
            
            // Check if menu would go off-screen vertically
            if (top + menuHeight > window.innerHeight) {
              top = rect.top - menuHeight - 8; // Place above instead
            }
            
            // Ensure minimum margins
            left = Math.max(10, left);
            top = Math.max(10, top);
            
            setPosition({ top, left });
          }
          return true;
        }

        if (isOpen) {
          if (event.key === 'Escape') {
            setIsOpen(false);
            return true;
          }

          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
            return true;
          }

          if (event.key === 'ArrowUp') {
            event.preventDefault();
            setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
            return true;
          }

          if (event.key === 'Enter') {
            event.preventDefault();
            const command = filteredCommands[selectedIndex];
            if (command) {
              handleSelectCommand(command);
            }
            return true;
          }

          if (event.key.length === 1 && event.key !== '/') {
            setQuery((prev) => prev + event.key);
            setSelectedIndex(0);
            return false;
          }

          if (event.key === 'Backspace') {
            setQuery((prev) => prev.slice(0, -1));
            if (query.length === 1) {
              setIsOpen(false);
            }
            return false;
          }
        }

        return false;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor, isOpen, selectedIndex, query, filteredCommands]);

  const handleSelectCommand = useCallback((command) => {
    // Remove the "/" from the editor
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.removeText();
      }
    });

    // Execute the command action
    command.action(editor);
    setIsOpen(false);
    setQuery('');
  }, [editor]);

  return (
    <SlashCommandMenu
      items={filteredCommands}
      selectedIndex={selectedIndex}
      onSelect={(item) => {
        handleSelectCommand(item);
      }}
      isVisible={isOpen}
      position={position}
    />
  );
}

/**
 * Plugin to handle content changes and export HTML
 */
function ContentChangePlugin({ onChange }) {
  const [editor] = useLexicalComposerContext();

  React.useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const contentEditableElement = editor.getRootElement();
        if (contentEditableElement) {
          // Get the HTML content from the DOM element
          const html = contentEditableElement.innerHTML;
          onChange(html);
        }
      });
    });
  }, [editor, onChange]);

  return null;
}

/**
 * BlockBasedEditor - Free rich text editor using Lexical (by Meta)
 * Replaces Tiptap/React-Quill with modern, React 19-compatible editor
 * Stores content as HTML (compatible with JSONB database storage)
 */
function BlockBasedEditor({ 
  value, 
  onChange, 
  placeholder = 'Enter your content...',
  readOnly = false 
}) {
  const initialConfig = useMemo(() => ({
    namespace: 'BlockBasedEditor',
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
    editable: !readOnly,
  }), [readOnly]);

  return (
    <div className="block-based-editor">
      <LexicalComposer initialConfig={initialConfig}>
        <div className="editor-container">
          <RichTextPlugin
            contentEditable={
              <ContentEditable 
                className="editor-input" 
                aria-placeholder={placeholder}
              />
            }
            placeholder={<div className="editor-placeholder">{placeholder}</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ContentChangePlugin onChange={onChange} />
          <SlashCommandPlugin onChange={onChange} />
        </div>
      </LexicalComposer>
    </div>
  );
}

export default BlockBasedEditor;
