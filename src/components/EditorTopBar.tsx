import {
  ArrowShrinkIcon,
  SidebarLeftIcon,
  Moon01Icon,
  Sun01Icon,
} from '@hugeicons/core-free-icons'
import Icon from './Icon'

interface EditorTopBarProps {
  className?: string
  sidebarCollapsed: boolean
  sidebarButtonClassName?: string
  onToggleSidebar: () => void
  theme: string
  themeButtonClassName?: string
  onToggleTheme: () => void
  showFocusToggle?: boolean
  onToggleFocusMode?: () => void
}

export default function EditorTopBar({
  className = '',
  sidebarCollapsed,
  sidebarButtonClassName = 'flex',
  onToggleSidebar,
  theme,
  themeButtonClassName = 'flex',
  onToggleTheme,
  showFocusToggle = false,
  onToggleFocusMode,
}: EditorTopBarProps) {
  return (
    <div className={`relative z-10 items-center justify-between px-4 py-2 md:px-6 ${className || 'flex'}`}>
      {sidebarCollapsed ? (
        <button
          type="button"
          onClick={onToggleSidebar}
          className={`neu-icon-btn h-10 w-10 flex items-center justify-center rounded-full text-[var(--text-muted)] transition-all duration-200 hover:text-[var(--text-primary)] ${sidebarButtonClassName}`}
          title="Open sidebar (Cmd+B)"
        >
          <Icon icon={SidebarLeftIcon} size={21} stroke={1.5} style={{ transform: 'scaleX(-1)' }} />
        </button>
      ) : (
        <div className="w-10" />
      )}

      <div className="flex items-center gap-1 max-md:ml-auto">
        {showFocusToggle ? (
          <button
            type="button"
            onClick={onToggleFocusMode}
            className="neu-icon-btn hidden h-10 w-10 items-center justify-center rounded-full text-[var(--text-muted)] transition-all duration-200 hover:text-[var(--text-primary)] md:flex"
            title="Focus mode (⌘⇧F)"
          >
            <Icon icon={ArrowShrinkIcon} size={21} stroke={1.5} />
          </button>
        ) : null}

        <button
          type="button"
          onClick={onToggleTheme}
          className={`neu-icon-btn h-10 w-10 items-center justify-center rounded-full text-[var(--text-muted)] transition-all duration-200 hover:text-[var(--text-primary)] ${themeButtonClassName}`}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? <Icon icon={Sun01Icon} size={21} stroke={1.5} /> : <Icon icon={Moon01Icon} size={21} stroke={1.5} />}
        </button>
      </div>
    </div>
  )
}
