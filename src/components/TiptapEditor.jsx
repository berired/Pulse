import React, { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Table from '@tiptap/extension-table';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Code,
  Undo2,
  Redo2,
} from 'lucide-react';
import './TiptapEditor.css';

const TiptapEditor = ({ value, onChange, placeholder = 'Start typing...' }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: { languageClassPrefix: 'language-' },
      }),
      Table.configure({ resizable: true }),
    ],
    content: value || `<p>${placeholder}</p>`,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });

  const toggleBold = useCallback(
    () => editor?.chain().focus().toggleBold().run(),
    [editor]
  );

  const toggleItalic = useCallback(
    () => editor?.chain().focus().toggleItalic().run(),
    [editor]
  );

  const toggleHeading = useCallback(
    () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
    [editor]
  );

  const toggleBulletList = useCallback(
    () => editor?.chain().focus().toggleBulletList().run(),
    [editor]
  );

  const toggleOrderedList = useCallback(
    () => editor?.chain().focus().toggleOrderedList().run(),
    [editor]
  );

  const toggleCodeBlock = useCallback(
    () => editor?.chain().focus().toggleCodeBlock().run(),
    [editor]
  );

  const insertTable = useCallback(() => {
    editor
      ?.chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  }, [editor]);

  const undo = useCallback(() => editor?.chain().focus().undo().run(), [editor]);
  const redo = useCallback(() => editor?.chain().focus().redo().run(), [editor]);

  if (!editor) return null;

  return (
    <div className="tiptap-editor">
      <div className="toolbar">
        <button
          onClick={toggleBold}
          className={`toolbar-btn ${editor.isActive('bold') ? 'active' : ''}`}
          title="Bold (Ctrl+B)"
        >
          <Bold size={18} />
        </button>
        <button
          onClick={toggleItalic}
          className={`toolbar-btn ${editor.isActive('italic') ? 'active' : ''}`}
          title="Italic (Ctrl+I)"
        >
          <Italic size={18} />
        </button>
        <div className="toolbar-divider" />

        <button
          onClick={toggleHeading}
          className={`toolbar-btn ${editor.isActive('heading') ? 'active' : ''}`}
          title="Heading 2"
        >
          <Heading2 size={18} />
        </button>
        <div className="toolbar-divider" />

        <button
          onClick={toggleBulletList}
          className={`toolbar-btn ${editor.isActive('bulletList') ? 'active' : ''}`}
          title="Bullet List"
        >
          <List size={18} />
        </button>
        <button
          onClick={toggleOrderedList}
          className={`toolbar-btn ${editor.isActive('orderedList') ? 'active' : ''}`}
          title="Ordered List"
        >
          <ListOrdered size={18} />
        </button>
        <div className="toolbar-divider" />

        <button
          onClick={toggleCodeBlock}
          className={`toolbar-btn ${editor.isActive('codeBlock') ? 'active' : ''}`}
          title="Code Block"
        >
          <Code size={18} />
        </button>

        <button onClick={insertTable} className="toolbar-btn" title="Insert Table">
          ▦
        </button>

        <div className="toolbar-divider" />
        <button onClick={undo} className="toolbar-btn" title="Undo (Ctrl+Z)">
          <Undo2 size={18} />
        </button>
        <button onClick={redo} className="toolbar-btn" title="Redo (Ctrl+Y)">
          <Redo2 size={18} />
        </button>
      </div>

      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
};

export default TiptapEditor;
