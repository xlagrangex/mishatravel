"use client";

import { useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Unlink,
  ImageIcon,
  Minus,
  Undo,
  Redo,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({
  onClick,
  isActive = false,
  disabled = false,
  title,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors",
        "hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50",
        isActive && "bg-[#C41E2F]/10 text-[#C41E2F]"
      )}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="mx-1 h-6 w-px bg-gray-200" />;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Scrivi qui...",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-[#C41E2F] underline cursor-pointer",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-md",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none px-4 py-3 min-h-[200px] outline-none",
          "prose-headings:font-semibold prose-h2:text-xl prose-h3:text-lg",
          "prose-a:text-[#C41E2F] prose-a:underline",
          "prose-img:rounded-md prose-img:max-w-full"
        ),
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
    immediatelyRender: false,
  });

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL del link:", previousUrl);

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;

    const url = window.prompt("URL dell'immagine:");

    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="h-10 border-b border-gray-200 bg-gray-50" />
        <div className="min-h-[200px] px-4 py-3">
          <p className="text-sm text-muted-foreground">{placeholder}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-gray-200 bg-white transition-colors",
        "focus-within:border-[#C41E2F] focus-within:ring-1 focus-within:ring-[#C41E2F]/30"
      )}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50/80 px-2 py-1.5 rounded-t-lg">
        {/* Bold */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Grassetto"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>

        {/* Italic */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Corsivo"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Heading 2 */}
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editor.isActive("heading", { level: 2 })}
          title="Titolo H2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>

        {/* Heading 3 */}
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          isActive={editor.isActive("heading", { level: 3 })}
          title="Titolo H3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Bullet List */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Elenco puntato"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>

        {/* Ordered List */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Elenco numerato"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Link */}
        <ToolbarButton
          onClick={setLink}
          isActive={editor.isActive("link")}
          title="Inserisci link"
        >
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>

        {/* Unlink */}
        <ToolbarButton
          onClick={() => editor.chain().focus().unsetLink().run()}
          disabled={!editor.isActive("link")}
          title="Rimuovi link"
        >
          <Unlink className="h-4 w-4" />
        </ToolbarButton>

        {/* Image */}
        <ToolbarButton onClick={addImage} title="Inserisci immagine">
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Horizontal Rule */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Linea orizzontale"
        >
          <Minus className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Undo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Annulla"
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>

        {/* Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Ripeti"
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />
    </div>
  );
}
