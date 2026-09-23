"use client";

import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExt from "@tiptap/extension-image";
import LinkExt from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import {
  Bold,
  Code,
  Code2,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Table as TableIcon,
  Undo2,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { MediaPicker } from "./media-picker";

function ToolButton({ onClick, active, label, children, disabled }: { onClick: () => void; active?: boolean; label: string; children: ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn("flex size-8 items-center justify-center rounded-md text-mist-600 transition-colors hover:bg-mist-100 hover:text-ink-900 disabled:opacity-30", active && "bg-ink-900 text-white hover:bg-ink-900 hover:text-white")}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor, onImage }: { editor: Editor; onImage: () => void }) {
  const inTable = editor.isActive("table");
  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL (leave empty to remove)", prev ?? "https://");
    if (url === null) return;
    if (url === "") editor.chain().focus().extendMarkRange("link").unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };
  const sep = <span aria-hidden className="mx-1 h-5 w-px bg-mist-200" />;
  return (
    <div role="toolbar" aria-label="Formatting" className="sticky top-[8.25rem] z-10 flex flex-wrap items-center gap-0.5 rounded-t-xl border-b border-mist-200 bg-white/95 p-1.5 backdrop-blur">
      <ToolButton label="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Heading2 className="size-4" />
      </ToolButton>
      <ToolButton label="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        <Heading3 className="size-4" />
      </ToolButton>
      {sep}
      <ToolButton label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold className="size-4" />
      </ToolButton>
      <ToolButton label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic className="size-4" />
      </ToolButton>
      <ToolButton label="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <Strikethrough className="size-4" />
      </ToolButton>
      <ToolButton label="Inline code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
        <Code className="size-4" />
      </ToolButton>
      <ToolButton label="Link" active={editor.isActive("link")} onClick={setLink}>
        <Link2 className="size-4" />
      </ToolButton>
      {sep}
      <ToolButton label="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List className="size-4" />
      </ToolButton>
      <ToolButton label="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered className="size-4" />
      </ToolButton>
      <ToolButton label="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote className="size-4" />
      </ToolButton>
      <ToolButton label="Code block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
        <Code2 className="size-4" />
      </ToolButton>
      <ToolButton label="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <Minus className="size-4" />
      </ToolButton>
      {sep}
      <ToolButton label="Insert image" onClick={onImage}>
        <ImagePlus className="size-4" />
      </ToolButton>
      <ToolButton label="Insert table" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
        <TableIcon className="size-4" />
      </ToolButton>
      {inTable && (
        <span className="flex items-center gap-1 pl-1 text-xs">
          <button type="button" className="rounded px-1.5 py-1 hover:bg-mist-100" onClick={() => editor.chain().focus().addRowAfter().run()}>
            + Row
          </button>
          <button type="button" className="rounded px-1.5 py-1 hover:bg-mist-100" onClick={() => editor.chain().focus().addColumnAfter().run()}>
            + Col
          </button>
          <button type="button" className="rounded px-1.5 py-1 hover:bg-mist-100" onClick={() => editor.chain().focus().deleteRow().run()}>
            − Row
          </button>
          <button type="button" className="rounded px-1.5 py-1 hover:bg-mist-100" onClick={() => editor.chain().focus().deleteColumn().run()}>
            − Col
          </button>
          <button type="button" className="rounded px-1.5 py-1 text-danger-500 hover:bg-danger-50" onClick={() => editor.chain().focus().deleteTable().run()}>
            Delete table
          </button>
        </span>
      )}
      <span className="ml-auto flex">
        <ToolButton label="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 className="size-4" />
        </ToolButton>
        <ToolButton label="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 className="size-4" />
        </ToolButton>
      </span>
    </div>
  );
}

/** TipTap rich-text editor. Output HTML is sanitised again on the server. */
export function RichTextEditor({ id, value, onChange }: { id: string; value: string; onChange: (html: string) => void }) {
  const [picker, setPicker] = useState(false);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] }, link: false }),
      LinkExt.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: null, target: null } }),
      ImageExt.configure({ HTMLAttributes: { loading: "lazy" } }),
      Placeholder.configure({ placeholder: "Start writing…" }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value || "",
    editorProps: {
      attributes: { id, class: "prose-jarz max-w-none px-5 py-5", "aria-label": "Content editor", role: "textbox", "aria-multiline": "true" },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Sync external resets (e.g. discard changes).
  useEffect(() => {
    if (editor && value !== editor.getHTML() && !editor.isFocused) editor.commands.setContent(value || "", { emitUpdate: false });
  }, [value, editor]);

  if (!editor) return <div className="h-96 rounded-xl skeleton" />;

  return (
    <div className="rounded-xl border border-mist-200 bg-white focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/15">
      <Toolbar editor={editor} onImage={() => setPicker(true)} />
      <EditorContent editor={editor} />
      <MediaPicker open={picker} onClose={() => setPicker(false)} onPick={(img) => editor.chain().focus().setImage({ src: img.src, alt: img.alt }).run()} />
    </div>
  );
}
