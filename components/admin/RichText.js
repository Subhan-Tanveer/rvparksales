'use client';
import { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';

// Links keep their class, so the site's buttons (class="btn") stay buttons.
const LinkKeepClass = Link.extend({
  addAttributes() {
    return { ...this.parent?.(), class: { default: null } };
  },
}).configure({ openOnClick: false, autolink: true, defaultProtocol: 'https' });
import { uploadImage } from '@/components/admin/util';

// Word-processor style editor for descriptions, blog posts and pages:
// headings, bold/italic, lists, quotes, links, photos, undo, plus an
// "HTML" view for anything special.
export default function RichText({ value, onChange, folder = 'content' }) {
  const [html, setHtml] = useState(false);
  const [busy, setBusy] = useState(false);
  const file = useRef(null);
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [2, 3, 4] }, link: false }), LinkKeepClass, Image],
    content: value || '',
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => onChange(ed.isEmpty ? '' : ed.getHTML()),
  });

  // Content swapped from outside (e.g. after loading) → refresh the editor.
  useEffect(() => {
    if (editor && !editor.isFocused && (value || '') !== editor.getHTML() && !(editor.isEmpty && !value)) editor.commands.setContent(value || '', { emitUpdate: false });
  }, [value, editor]);

  if (!editor) return <div className="rte"><div className="rte-body"><div className="ProseMirror" /></div></div>;

  const B = ({ on, run, title, children }) => (
    <button type="button" className={on ? 'on' : ''} title={title} aria-label={title} onMouseDown={(e) => e.preventDefault()} onClick={run}>{children}</button>
  );
  const c = () => editor.chain().focus();

  function link() {
    const prev = editor.getAttributes('link').href || '';
    const url = window.prompt('Link address (leave empty to remove the link):', prev);
    if (url === null) return;
    if (!url.trim()) { c().extendMarkRange('link').unsetLink().run(); return; }
    const href = /^(https?:|mailto:|tel:|\/)/.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
    c().extendMarkRange('link').setLink({ href }).run();
  }

  async function addImage(e) {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    setBusy(true);
    try { const src = await uploadImage(f, folder); c().setImage({ src, alt: '' }).run(); } catch (err) { alert(err.message); }
    setBusy(false);
  }

  return (
    <div className="rte">
      <div className="rte-bar">
        <B title="Paragraph" on={editor.isActive('paragraph')} run={() => c().setParagraph().run()}>¶</B>
        <B title="Heading" on={editor.isActive('heading', { level: 2 })} run={() => c().toggleHeading({ level: 2 }).run()}>H2</B>
        <B title="Small heading" on={editor.isActive('heading', { level: 3 })} run={() => c().toggleHeading({ level: 3 }).run()}>H3</B>
        <span className="sep" />
        <B title="Bold" on={editor.isActive('bold')} run={() => c().toggleBold().run()}><b>B</b></B>
        <B title="Italic" on={editor.isActive('italic')} run={() => c().toggleItalic().run()}><i>I</i></B>
        <B title="Underline" on={editor.isActive('underline')} run={() => c().toggleUnderline().run()}><u>U</u></B>
        <span className="sep" />
        <B title="Bullet list" on={editor.isActive('bulletList')} run={() => c().toggleBulletList().run()}>• List</B>
        <B title="Numbered list" on={editor.isActive('orderedList')} run={() => c().toggleOrderedList().run()}>1. List</B>
        <B title="Quote" on={editor.isActive('blockquote')} run={() => c().toggleBlockquote().run()}>❝</B>
        <span className="sep" />
        <B title="Link" on={editor.isActive('link')} run={link}>Link</B>
        <B title="Make the selected link a button" on={editor.isActive('link', { class: 'btn' })} run={() => { if (!editor.isActive('link')) { alert('Select a link first (or add one with Link).'); return; } c().extendMarkRange('link').updateAttributes('link', { class: editor.isActive('link', { class: 'btn' }) ? null : 'btn' }).run(); }}>Button</B>
        <B title="Insert photo" run={() => file.current?.click()}>{busy ? 'Uploading…' : 'Photo'}</B>
        <B title="Divider line" run={() => c().setHorizontalRule().run()}>―</B>
        <span className="sep" />
        <B title="Undo" run={() => c().undo().run()}>↶</B>
        <B title="Redo" run={() => c().redo().run()}>↷</B>
        <span className="sep" />
        <B title="Edit HTML" on={html} run={() => setHtml(!html)}>HTML</B>
      </div>
      <input ref={file} type="file" accept="image/*" hidden onChange={addImage} />
      {html ? (
        <textarea className="rte-html" value={value || ''} onChange={(e) => { onChange(e.target.value); editor.commands.setContent(e.target.value || '', { emitUpdate: false }); }} spellCheck={false} />
      ) : (
        <div className="rte-body"><EditorContent editor={editor} /></div>
      )}
    </div>
  );
}
