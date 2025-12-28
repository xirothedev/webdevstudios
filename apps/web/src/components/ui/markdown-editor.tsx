'use client';

import * as Dialog from '@radix-ui/react-dialog';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Markdown } from '@tiptap/markdown';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Redo,
  Undo,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type MarkdownEditorTheme = 'light' | 'dark';

interface MarkdownEditorThemeConfig {
  container: string;
  toolbar: string;
  toolbarDivider: string;
  toolbarButton: {
    base: string;
    active: string;
    inactive: string;
  };
  editor: {
    container: string;
    content: string;
  };
  placeholder: string;
}

const themeConfigs: Record<MarkdownEditorTheme, MarkdownEditorThemeConfig> = {
  dark: {
    container: 'border-wds-accent/30 bg-wds-background rounded-lg border',
    toolbar:
      'border-wds-accent/30 flex flex-wrap items-center gap-1 border-b p-2',
    toolbarDivider: 'mx-1 h-6 w-px bg-wds-accent/30',
    toolbarButton: {
      base: 'h-8 w-8 p-0',
      active: 'bg-wds-accent/20 text-wds-accent',
      inactive: 'text-wds-text/70 hover:bg-wds-accent/10 hover:text-wds-text',
    },
    editor: {
      container:
        'focus-within:ring-wds-accent/20 focus-within:border-wds-accent rounded-b-lg focus-within:ring-2',
      content:
        'text-wds-text [&_.ProseMirror]:outline-none [&_.ProseMirror]:px-4 [&_.ProseMirror]:py-2 [&_.ProseMirror]:text-sm [&_.ProseMirror]:leading-relaxed [&_.ProseMirror]:text-white/80 [&_.ProseMirror_.is-empty::before]:text-wds-text/50 [&_.ProseMirror_.is-empty::before]:content-[attr(data-placeholder)] [&_.ProseMirror_.is-empty::before]:float-left [&_.ProseMirror_.is-empty::before]:pointer-events-none [&_.ProseMirror_.is-empty::before]:h-0 [&_.ProseMirror_h1]:text-xl [&_.ProseMirror_h1]:font-semibold [&_.ProseMirror_h1]:text-white [&_.ProseMirror_h1]:mb-2 [&_.ProseMirror_h2]:text-lg [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:text-white [&_.ProseMirror_h2]:mb-2 [&_.ProseMirror_h3]:text-base [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:text-white [&_.ProseMirror_h3]:mb-2 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:ml-4 [&_.ProseMirror_ul]:space-y-1 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:ml-4 [&_.ProseMirror_ol]:space-y-1 [&_.ProseMirror_a]:text-wds-accent [&_.ProseMirror_a]:underline [&_.ProseMirror_a:hover]:text-wds-accent/80 [&_.ProseMirror_strong]:font-semibold [&_.ProseMirror_strong]:text-white [&_.ProseMirror_em]:italic [&_.ProseMirror_em]:text-white/90',
    },
    placeholder: 'text-wds-text/50',
  },
  light: {
    container: 'border-gray-300 bg-white rounded-lg border',
    toolbar:
      'border-gray-300 flex flex-wrap items-center gap-1 border-b p-2 bg-gray-50',
    toolbarDivider: 'mx-1 h-6 w-px bg-gray-300',
    toolbarButton: {
      base: 'h-8 w-8 p-0',
      active: 'bg-blue-100 text-blue-600',
      inactive: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
    },
    editor: {
      container:
        'focus-within:ring-blue-500/20 focus-within:border-blue-500 rounded-b-lg focus-within:ring-2',
      content:
        'text-gray-900 [&_.ProseMirror]:outline-none [&_.ProseMirror]:px-4 [&_.ProseMirror]:py-2 [&_.ProseMirror]:text-sm [&_.ProseMirror]:leading-relaxed [&_.ProseMirror]:text-gray-800 [&_.ProseMirror_.is-empty::before]:text-gray-400 [&_.ProseMirror_.is-empty::before]:content-[attr(data-placeholder)] [&_.ProseMirror_.is-empty::before]:float-left [&_.ProseMirror_.is-empty::before]:pointer-events-none [&_.ProseMirror_.is-empty::before]:h-0 [&_.ProseMirror_h1]:text-xl [&_.ProseMirror_h1]:font-semibold [&_.ProseMirror_h1]:text-gray-900 [&_.ProseMirror_h1]:mb-2 [&_.ProseMirror_h2]:text-lg [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:text-gray-900 [&_.ProseMirror_h2]:mb-2 [&_.ProseMirror_h3]:text-base [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:text-gray-900 [&_.ProseMirror_h3]:mb-2 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:ml-4 [&_.ProseMirror_ul]:space-y-1 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:ml-4 [&_.ProseMirror_ol]:space-y-1 [&_.ProseMirror_a]:text-blue-600 [&_.ProseMirror_a]:underline [&_.ProseMirror_a:hover]:text-blue-700 [&_.ProseMirror_strong]:font-semibold [&_.ProseMirror_strong]:text-gray-900 [&_.ProseMirror_em]:italic [&_.ProseMirror_em]:text-gray-800',
    },
    placeholder: 'text-gray-400',
  },
};

export interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  theme?: MarkdownEditorTheme;
  minHeight?: string;
  className?: string;
}

/**
 * Reusable Markdown Editor component with Tiptap
 * Supports light and dark themes
 *
 * @example
 * ```tsx
 * <MarkdownEditor
 *   value={content}
 *   onChange={setContent}
 *   theme="dark"
 *   placeholder="Enter your content..."
 * />
 * ```
 */
export function MarkdownEditor({
  value,
  onChange,
  disabled = false,
  placeholder = 'Enter content (supports markdown)...',
  theme = 'dark',
  minHeight = '300px',
  className,
}: MarkdownEditorProps) {
  const isUpdatingFromProp = useRef(false);
  const themeConfig = themeConfigs[theme];
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class:
            theme === 'dark'
              ? 'text-wds-accent underline hover:text-wds-accent/80'
              : 'text-blue-600 underline hover:text-blue-700',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value || '',
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (isUpdatingFromProp.current) {
        return;
      }
      if (editor.markdown) {
        const markdown = editor.markdown.serialize(editor.getJSON());
        onChange(markdown);
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none',
      },
    },
  });

  // Update editor content when value prop changes
  useEffect(() => {
    if (editor && value !== undefined && editor.markdown) {
      const currentMarkdown = editor.markdown.serialize(editor.getJSON());
      if (currentMarkdown !== value) {
        isUpdatingFromProp.current = true;
        editor.commands.setContent(value || '', {
          contentType: 'markdown',
        });
        // Reset flag after a short delay to allow update to complete
        setTimeout(() => {
          isUpdatingFromProp.current = false;
        }, 0);
      }
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  const getButtonClassName = (isActive: boolean) => {
    return cn(
      themeConfig.toolbarButton.base,
      isActive
        ? themeConfig.toolbarButton.active
        : themeConfig.toolbarButton.inactive
    );
  };

  const handleLinkClick = () => {
    if (!editor) return;

    const { from, to } = editor.state.selection;
    const attrs = editor.getAttributes('link');

    if (attrs.href) {
      // Editing existing link
      setLinkUrl(attrs.href);
    } else {
      // Creating new link - check if there's selected text
      const selectedText = editor.state.doc.textBetween(from, to);
      setLinkUrl(selectedText.startsWith('http') ? selectedText : '');
    }

    setLinkDialogOpen(true);
  };

  const handleLinkSubmit = () => {
    if (!editor || !linkUrl.trim()) return;

    const trimmedUrl = linkUrl.trim();
    if (!trimmedUrl) {
      setLinkDialogOpen(false);
      return;
    }

    // Add protocol if missing
    const urlWithProtocol = trimmedUrl.startsWith('http')
      ? trimmedUrl
      : `https://${trimmedUrl}`;

    editor.chain().focus().setLink({ href: urlWithProtocol }).run();
    setLinkDialogOpen(false);
    setLinkUrl('');
  };

  const handleRemoveLink = () => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
    setLinkDialogOpen(false);
    setLinkUrl('');
  };

  const handleLinkDialogOpenChange = (open: boolean) => {
    setLinkDialogOpen(open);
    if (!open) {
      setLinkUrl('');
    }
  };

  return (
    <div className={cn(themeConfig.container, className)}>
      {/* Toolbar */}
      <div className={themeConfig.toolbar}>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={
            disabled || !editor.can().chain().focus().toggleBold().run()
          }
          className={getButtonClassName(editor.isActive('bold'))}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={
            disabled || !editor.can().chain().focus().toggleItalic().run()
          }
          className={getButtonClassName(editor.isActive('italic'))}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>

        <div className={themeConfig.toolbarDivider} />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          disabled={
            disabled ||
            !editor.can().chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={getButtonClassName(
            editor.isActive('heading', { level: 1 })
          )}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          disabled={
            disabled ||
            !editor.can().chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={getButtonClassName(
            editor.isActive('heading', { level: 2 })
          )}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          disabled={
            disabled ||
            !editor.can().chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={getButtonClassName(
            editor.isActive('heading', { level: 3 })
          )}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className={themeConfig.toolbarDivider} />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={
            disabled || !editor.can().chain().focus().toggleBulletList().run()
          }
          className={getButtonClassName(editor.isActive('bulletList'))}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={
            disabled || !editor.can().chain().focus().toggleOrderedList().run()
          }
          className={getButtonClassName(editor.isActive('orderedList'))}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className={themeConfig.toolbarDivider} />

        <Dialog.Root
          open={linkDialogOpen}
          onOpenChange={handleLinkDialogOpenChange}
        >
          <Dialog.Trigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleLinkClick}
              disabled={
                disabled ||
                !editor.can().chain().focus().setLink({ href: '' }).run()
              }
              className={getButtonClassName(editor.isActive('link'))}
              title="Add/Edit Link"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay
              className={cn(
                'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
                'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
              )}
            />
            <Dialog.Content
              className={cn(
                'fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border p-6 shadow-lg',
                'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
                theme === 'dark'
                  ? 'border-wds-accent/30 bg-wds-background text-wds-text'
                  : 'border-gray-300 bg-white text-gray-900'
              )}
            >
              <Dialog.Title
                className={cn(
                  'mb-4 text-lg font-semibold',
                  theme === 'dark' ? 'text-wds-text' : 'text-gray-900'
                )}
              >
                {editor?.getAttributes('link').href ? 'Edit Link' : 'Add Link'}
              </Dialog.Title>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="link-url"
                    className={cn(
                      'mb-2 block text-sm font-medium',
                      theme === 'dark' ? 'text-wds-text/80' : 'text-gray-700'
                    )}
                  >
                    URL
                  </label>
                  <Input
                    id="link-url"
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleLinkSubmit();
                      }
                      if (e.key === 'Escape') {
                        setLinkDialogOpen(false);
                      }
                    }}
                    placeholder="https://example.com"
                    autoFocus
                    className={
                      theme === 'dark'
                        ? 'border-wds-accent/30 bg-wds-background text-wds-text placeholder:text-wds-text/50 focus:border-wds-accent focus:ring-wds-accent/20'
                        : 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20'
                    }
                  />
                </div>

                <div className="flex justify-end gap-2">
                  {editor?.getAttributes('link').href && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleRemoveLink}
                      className={
                        theme === 'dark'
                          ? 'border-wds-accent/30 bg-wds-background text-wds-text hover:bg-wds-accent/10'
                          : 'border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
                      }
                    >
                      Remove Link
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLinkDialogOpen(false)}
                    className={
                      theme === 'dark'
                        ? 'border-wds-accent/30 bg-wds-background text-wds-text hover:bg-wds-accent/10'
                        : 'border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
                    }
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleLinkSubmit}
                    className={
                      theme === 'dark'
                        ? 'bg-wds-accent hover:bg-wds-accent/90 text-black'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }
                  >
                    {editor?.getAttributes('link').href ? 'Update' : 'Add'}
                  </Button>
                </div>
              </div>

              <Dialog.Close asChild>
                <button
                  className={cn(
                    'absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:outline-none',
                    theme === 'dark'
                      ? 'text-wds-text/70 hover:text-wds-text focus:ring-wds-accent/20'
                      : 'text-gray-500 hover:text-gray-900 focus:ring-blue-500/20'
                  )}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </button>
              </Dialog.Close>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        <div className={themeConfig.toolbarDivider} />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={disabled || !editor.can().chain().focus().undo().run()}
          className={getButtonClassName(false)}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={disabled || !editor.can().chain().focus().redo().run()}
          className={getButtonClassName(false)}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor Content */}
      <div className={themeConfig.editor.container}>
        <EditorContent
          editor={editor}
          style={{ minHeight }}
          className={cn(
            themeConfig.editor.content,
            '[&_.ProseMirror]:min-h-[300px]'
          )}
        />
      </div>
    </div>
  );
}
