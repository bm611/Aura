import { Extension } from '@tiptap/core'
import { Plugin } from '@tiptap/pm/state'
import { looksLikeMarkdown, markdownToDoc } from '../markdown/markdownConversion'

const LATEX_PATTERN = /(\\\(.+?\\\))|(\\\[[\s\S]+?\\\])|(\$\$.+?\$\$)|(\$[^$\n]+\$)|(\(\s*\\[a-zA-Z]{2,})|(^\\[a-zA-Z]{2,})/m

export const MarkdownPaste = Extension.create({
  name: 'markdownPaste',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handlePaste: (_view, event) => {
            const html = event.clipboardData?.getData('text/html')
            const text = event.clipboardData?.getData('text/plain') || ''

            if (!text) {
              return false
            }

            // When HTML is present (e.g. pasting from web), still handle if
            // the plain text contains LaTeX that the browser HTML won't preserve.
            // Otherwise, require the text to look like markdown.
            if (html && !LATEX_PATTERN.test(text)) {
              return false
            }

            if (!html && !looksLikeMarkdown(text)) {
              return false
            }

            event.preventDefault()

            const doc = markdownToDoc(text, this.editor.extensionManager.extensions)
            this.editor.chain().focus(undefined, { scrollIntoView: false }).insertContent(doc.content || []).run()
            return true
          },
        },
      }),
    ]
  },
})
