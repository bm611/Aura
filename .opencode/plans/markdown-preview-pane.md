# Plan: Render Markdown in HomeScreen Preview Pane

## Overview
Replace the plain-text preview in `PreviewPane` with rendered markdown using `react-markdown` (already installed and used in `AiChatPage.tsx`).

## Changes in `apps/web/src/components/HomeScreen.tsx`

### 1. Add imports (line 3, after framer-motion)
```ts
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
```

### 2. Replace the `<pre>` block in `PreviewPane` (lines 636-643)
**Current:**
```tsx
<div className="px-6 py-5 space-y-3">
  {preview ? (
    <pre className="whitespace-pre-wrap font-[var(--font-prose)] text-[14px] leading-relaxed text-[var(--text-secondary)]">
      {preview}
    </pre>
  ) : (
    <p className="label-mono">No content yet.</p>
  )}
</div>
```

**Replace with:**
```tsx
<div className="px-6 py-5 space-y-3">
  {note.content ? (
    <div className="preview-markdown font-[var(--font-prose)] text-[14px] leading-relaxed text-[var(--text-secondary)] space-y-3">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="mb-3 mt-4 text-lg font-bold text-[var(--ink)]">{children}</h1>,
          h2: ({ children }) => <h2 className="mb-2 mt-3 text-base font-bold text-[var(--ink)]">{children}</h2>,
          h3: ({ children }) => <h3 className="mb-2 mt-3 text-sm font-bold text-[var(--ink)]">{children}</h3>,
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="mb-2 list-disc pl-5 last:mb-0 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="mb-2 list-decimal pl-5 last:mb-0 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="pl-1">{children}</li>,
          blockquote: ({ children }) => <blockquote className="border-l-4 border-[var(--accent)] pl-3 italic my-2">{children}</blockquote>,
          a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">{children}</a>,
          code: ({ children, className }) => {
            const isInline = !className;
            return isInline
              ? <code className="px-1 py-0.5 bg-[var(--bg-hover)] text-[var(--ink)] text-[13px]">{children}</code>
              : <code className="block bg-[var(--bg-hover)] p-3 overflow-x-auto text-[13px]">{children}</code>;
          },
          pre: ({ children }) => <pre className="my-2 overflow-x-auto">{children}</pre>,
        }}
      >
        {note.content}
      </ReactMarkdown>
    </div>
  ) : (
    <p className="label-mono">No content yet.</p>
  )}
</div>
```

### 3. Remove the unused `preview` variable
Delete line 619: `const preview = plainTextPreview(note.content);`

## Rationale
- `react-markdown` and `remark-gfm` are already installed dependencies (used in `AiChatPage.tsx`)
- `note.content` is a raw markdown string — perfect input for `react-markdown`
- The custom components match the app's typography while keeping the preview compact
- `plainTextPreview` remains available for other uses (isn't deleted, just no longer used in `PreviewPane`)
