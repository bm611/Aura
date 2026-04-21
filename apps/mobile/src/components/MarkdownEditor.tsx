import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { View, StyleSheet, ActivityIndicator, Text, type ViewStyle } from 'react-native'
import { WebView } from 'react-native-webview'

export type EditorCommand =
  | 'bold'
  | 'italic'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'bulletList'
  | 'orderedList'
  | 'taskList'
  | 'blockquote'
  | 'code'
  | 'codeBlock'
  | 'horizontalRule'
  | 'undo'
  | 'redo'
  | 'link'
  | 'table'

export interface MarkdownEditorHandle {
  runCommand: (command: EditorCommand, payload?: Record<string, unknown>) => void
  getContent: () => void
  focus: () => void
}

interface MarkdownEditorProps {
  value: string
  onChange: (markdown: string) => void
  placeholder?: string
  style?: ViewStyle
}

const EDITOR_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: transparent;
      color: #e8e8e8;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 16px;
      line-height: 1.625;
      -webkit-font-smoothing: antialiased;
      -webkit-tap-highlight-color: transparent;
    }
    #editor {
      min-height: 100vh;
      padding: 0 4px;
    }
    .ProseMirror {
      outline: none;
      caret-color: #e8e8e8;
    }
    .ProseMirror p {
      margin: 0 0 12px;
    }
    .ProseMirror p.is-editor-empty:first-child::before {
      content: attr(data-placeholder);
      float: left;
      color: #444;
      pointer-events: none;
      height: 0;
    }
    .ProseMirror h1, .ProseMirror h2, .ProseMirror h3 {
      margin: 20px 0 10px;
      font-weight: 600;
      line-height: 1.3;
    }
    .ProseMirror h1 { font-size: 26px; }
    .ProseMirror h2 { font-size: 22px; }
    .ProseMirror h3 { font-size: 18px; }
    .ProseMirror ul, .ProseMirror ol {
      padding-left: 24px;
      margin: 8px 0;
    }
    .ProseMirror li {
      margin: 4px 0;
    }
    .ProseMirror li > p {
      margin: 0;
    }
    .ProseMirror blockquote {
      border-left: 3px solid #333;
      margin: 12px 0;
      padding-left: 14px;
      color: #aaa;
      font-style: italic;
    }
    .ProseMirror pre {
      background: #1a1a1a;
      padding: 14px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 12px 0;
    }
    .ProseMirror pre code {
      background: transparent;
      padding: 0;
      font-size: 14px;
      color: #e8e8e8;
    }
    .ProseMirror code {
      background: #1a1a1a;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Menlo', monospace;
      font-size: 14px;
      color: #e07a8a;
    }
    .ProseMirror a {
      color: #4a9eff;
      text-decoration: none;
    }
    .ProseMirror hr {
      border: none;
      border-top: 1px solid #2a2a2a;
      margin: 20px 0;
    }
    .ProseMirror table {
      border-collapse: collapse;
      width: 100%;
      margin: 12px 0;
      font-size: 14px;
    }
    .ProseMirror th, .ProseMirror td {
      border: 1px solid #2a2a2a;
      padding: 8px 10px;
      text-align: left;
    }
    .ProseMirror th {
      background: #1a1a1a;
      font-weight: 600;
    }
    .ProseMirror tr:nth-child(even) {
      background: #141414;
    }
    .ProseMirror:focus { outline: none; }
    ::selection { background: #264f78; color: #fff; }
    ul[data-type="taskList"] {
      list-style: none;
      padding-left: 0;
    }
    ul[data-type="taskList"] li {
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }
    ul[data-type="taskList"] li > label {
      flex-shrink: 0;
      margin-top: 2px;
    }
    ul[data-type="taskList"] li > div {
      flex: 1;
    }
    ul[data-type="taskList"] input[type="checkbox"] {
      accent-color: #e07a8a;
      width: 16px;
      height: 16px;
    }
  </style>
</head>
<body>
  <div id="editor"></div>
  <script type="module">
    import { Editor } from 'https://esm.sh/@tiptap/core@2.11.5';
    import StarterKit from 'https://esm.sh/@tiptap/starter-kit@2.11.5';
    import Link from 'https://esm.sh/@tiptap/extension-link@2.11.5';
    import TaskList from 'https://esm.sh/@tiptap/extension-task-list@2.11.5';
    import TaskItem from 'https://esm.sh/@tiptap/extension-task-item@2.11.5';
    import Table from 'https://esm.sh/@tiptap/extension-table@2.11.5';
    import TableRow from 'https://esm.sh/@tiptap/extension-table-row@2.11.5';
    import TableHeader from 'https://esm.sh/@tiptap/extension-table-header@2.11.5';
    import TableCell from 'https://esm.sh/@tiptap/extension-table-cell@2.11.5';
    import { Markdown } from 'https://esm.sh/tiptap-markdown@0.8.10';
    import Placeholder from 'https://esm.sh/@tiptap/extension-placeholder@2.11.5';

    let editor = null;
    let isReady = false;
    let pendingContent = null;
    let pendingPlaceholder = '';
    let changeTimeout = null;

    function emit(type, payload) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type, ...payload }));
      }
    }

    function initEditor(content, placeholder) {
      editor = new Editor({
        element: document.getElementById('editor'),
        extensions: [
          StarterKit.configure({
            heading: { levels: [1, 2, 3] },
          }),
          Link.configure({
            autolink: true,
            openOnClick: false,
          }),
          TaskList,
          TaskItem.configure({ nested: true }),
          Table.configure({ resizable: false }),
          TableRow,
          TableHeader,
          TableCell,
          Markdown.configure({
            html: false,
            tightLists: true,
            bulletListMarker: '-',
          }),
          Placeholder.configure({
            placeholder: placeholder || 'Start writing...',
          }),
        ],
        content: content || '',
        onCreate: () => {
          isReady = true;
          emit('ready', {});
          if (pendingContent !== null) {
            editor.commands.setContent(pendingContent, false, { format: 'markdown' });
            pendingContent = null;
          }
        },
        onUpdate: () => {
          clearTimeout(changeTimeout);
          changeTimeout = setTimeout(() => {
            const markdown = editor.storage.markdown.getMarkdown();
            emit('change', { markdown });
          }, 150);
        },
      });
    }

    window.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'init') {
          if (isReady && editor) {
            editor.commands.setContent(data.content || '', false, { format: 'markdown' });
          } else {
            pendingContent = data.content || '';
            pendingPlaceholder = data.placeholder || '';
            if (!editor) initEditor(pendingContent, pendingPlaceholder);
          }
        } else if (data.type === 'command') {
          if (!editor) return;
          const chain = editor.chain().focus();
          switch (data.command) {
            case 'bold': chain.toggleBold().run(); break;
            case 'italic': chain.toggleItalic().run(); break;
            case 'heading1': chain.toggleHeading({ level: 1 }).run(); break;
            case 'heading2': chain.toggleHeading({ level: 2 }).run(); break;
            case 'heading3': chain.toggleHeading({ level: 3 }).run(); break;
            case 'bulletList': chain.toggleBulletList().run(); break;
            case 'orderedList': chain.toggleOrderedList().run(); break;
            case 'taskList': chain.toggleTaskList().run(); break;
            case 'blockquote': chain.toggleBlockquote().run(); break;
            case 'code': chain.toggleCode().run(); break;
            case 'codeBlock': chain.toggleCodeBlock().run(); break;
            case 'horizontalRule': chain.setHorizontalRule().run(); break;
            case 'undo': chain.undo().run(); break;
            case 'redo': chain.redo().run(); break;
            case 'link': {
              const url = data.url || 'https://';
              chain.toggleLink({ href: url }).run();
              break;
            }
            case 'table': chain.insertTable({ rows: 3, cols: 3 }).run(); break;
          }
        } else if (data.type === 'getContent') {
          if (editor) {
            const markdown = editor.storage.markdown.getMarkdown();
            emit('content', { markdown });
          }
        } else if (data.type === 'focus') {
          if (editor) editor.commands.focus('end', { scrollIntoView: false });
        }
      } catch (e) {
        emit('error', { message: e.message });
      }
    });

    // Auto-init with empty content after a short delay
    setTimeout(() => {
      if (!editor) initEditor('', '');
    }, 50);
  </script>
</body>
</html>
`

const MarkdownEditor = forwardRef<MarkdownEditorHandle, MarkdownEditorProps>(
  ({ value, onChange, placeholder, style }, ref) => {
    const webViewRef = useRef<WebView>(null)
    const [isReady, setIsReady] = useState(false)
    const [hasError, setHasError] = useState(false)
    const initialContentSent = useRef(false)
    const pendingValue = useRef(value)

    const sendInit = useCallback(() => {
      if (webViewRef.current && isReady && !initialContentSent.current) {
        webViewRef.current.injectJavaScript(
          `window.dispatchEvent(new MessageEvent('message', { data: ${JSON.stringify(
            JSON.stringify({
              type: 'init',
              content: pendingValue.current,
              placeholder: placeholder || 'Start writing...',
            })
          )} })); true;`
        )
        initialContentSent.current = true
      }
    }, [isReady, placeholder])

    useEffect(() => {
      sendInit()
    }, [sendInit])

    const handleMessage = useCallback(
      (event: { nativeEvent: { data: string } }) => {
        try {
          const data = JSON.parse(event.nativeEvent.data)
          switch (data.type) {
            case 'ready':
              setIsReady(true)
              break
            case 'change':
              onChange(data.markdown || '')
              break
            case 'error':
              console.warn('Editor error:', data.message)
              break
          }
        } catch {
          // ignore malformed messages
        }
      },
      [onChange]
    )

    useImperativeHandle(ref, () => ({
      runCommand: (command: EditorCommand, payload?: Record<string, unknown>) => {
        webViewRef.current?.injectJavaScript(
          `window.dispatchEvent(new MessageEvent('message', { data: ${JSON.stringify(
            JSON.stringify({ type: 'command', command, ...payload })
          )} })); true;`
        )
      },
      getContent: () => {
        webViewRef.current?.injectJavaScript(
          `window.dispatchEvent(new MessageEvent('message', { data: ${JSON.stringify(
            JSON.stringify({ type: 'getContent' })
          )} })); true;`
        )
      },
      focus: () => {
        webViewRef.current?.injectJavaScript(
          `window.dispatchEvent(new MessageEvent('message', { data: ${JSON.stringify(
            JSON.stringify({ type: 'focus' })
          )} })); true;`
        )
      },
    }))

    return (
      <View style={[styles.container, style]}>
        {!isReady && !hasError && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color="#888" />
            <Text style={styles.loadingText}>Loading editor...</Text>
          </View>
        )}
        {hasError && (
          <View style={styles.errorOverlay}>
            <Text style={styles.errorText}>Failed to load editor</Text>
          </View>
        )}
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: EDITOR_HTML }}
          onMessage={handleMessage}
          onError={() => setHasError(true)}
          style={styles.webview}
          scrollEnabled={true}
          keyboardDisplayRequiresUserAction={false}
          hideKeyboardAccessoryView={true}
          autoManageStatusBarEnabled={false}
          containerStyle={{ backgroundColor: 'transparent' }}
        />
      </View>
    )
  }
)

MarkdownEditor.displayName = 'MarkdownEditor'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
    zIndex: 1,
  },
  loadingText: {
    color: '#888',
    marginTop: 12,
    fontSize: 14,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
    zIndex: 1,
  },
  errorText: {
    color: '#e07a8a',
    fontSize: 14,
  },
})

export default MarkdownEditor
