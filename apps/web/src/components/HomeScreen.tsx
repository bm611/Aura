import { useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';

import {
	SidebarLeftIcon,
	Add01Icon,
	CloudUploadIcon,
	Calendar01Icon,
	ArrowRight01Icon,
} from '@hugeicons/core-free-icons';

import Icon from './Icon';
import SettingsMenu from './SettingsMenu';
import ProfilePanel from './ProfilePanel';
import { countBodyWords, getNoteDisplayTitle } from '../utils/noteMeta';
import { useAuth } from '../contexts/AuthContext';
import type { NoteFile, TreeNode } from '../types';
import type { SyncStatus } from './noteEditorUtils';
import {
	formatRelativeTime,
	compareRecentNotes,
	getTimeGreeting,
	getMotivationalMessage,
} from './noteEditorUtils';

interface HomeScreenProps {
	notes: TreeNode[];
	onNewNote: () => void;
	onCreateDailyNote: () => void;
	onUpdateNote: (id: string, updates: Record<string, unknown>, options?: Record<string, unknown>) => void;
	onSelectNote: (id: string | null) => void;
	theme: string;
	onSetTheme: (theme: string) => void;
	onCycleTheme: () => void;
	accentId: string;
	onAccentChange: (id: string) => void;
	sidebarCollapsed: boolean;
	onToggleSidebar: () => void;
	onOpenCommandPalette?: () => void;
	onOpenAuthModal: () => void;
	syncing: boolean;
	syncStatus: SyncStatus;
	onSync: () => void;
	fontId: string;
	onFontChange: (id: string) => void;
}

function compactNumber(n: number): string {
	if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
	return String(n);
}

function isPinned(note: NoteFile): boolean {
	return Array.isArray(note.tags) && note.tags.some((t) => t === 'favorite' || t === 'pinned');
}

function plainTextPreview(content: string | undefined, max = 280): string {
	if (!content) return '';
	const stripped = content
		.replace(/^---[\s\S]*?---/, '')
		.replace(/^#{1,6}\s+/gm, '')
		.replace(/\*\*(.+?)\*\*/g, '$1')
		.replace(/\*(.+?)\*/g, '$1')
		.replace(/`([^`]+)`/g, '$1')
		.replace(/\[(.+?)\]\(.+?\)/g, '$1')
		.replace(/\n{2,}/g, '\n\n')
		.trim();
	return stripped.length > max ? stripped.slice(0, max) + '…' : stripped;
}

function CompactHeroPanel({
	greeting,
	dateLabel,
	motto,
	noteCount,
}: {
	greeting: string;
	dateLabel: string;
	motto: string;
	noteCount: number;
}) {
	return (
		<section className="border-b-[1.5px] border-[var(--ink)]">
			<div className="grid grid-cols-[88px_minmax(0,1fr)]">
				<div className="flex flex-col justify-between gap-6 border-r-[1.5px] border-[var(--ink)] bg-[var(--bg-surface)] px-3 py-4">
					<span className="label-mono-strong">Issue</span>
					<span className="font-mono text-[32px] font-bold leading-none text-[var(--ink)]">
						{String(noteCount).padStart(2, '0')}
					</span>
					<span className="label-mono">Pocket</span>
				</div>
				<div className="px-5 py-5">
					<p className="label-mono-strong">Field desk</p>
					<h1 className="title-script mt-3 text-[clamp(3rem,14vw,4.75rem)] leading-[0.88]">
						{greeting}.
					</h1>
					<p className="mt-4 max-w-[26ch] font-[var(--font-prose)] text-[15px] leading-[1.45] text-[var(--text-secondary)]">
						{motto}
					</p>
					<p className="mt-4 label-mono">{dateLabel}</p>
				</div>
			</div>
		</section>
	);
}

function CompactStatCell({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex flex-col gap-2 border-r-[1.5px] last:border-r-0 border-[var(--ink)] bg-[var(--bg-surface)] px-4 py-4">
			<span className="font-mono text-[28px] font-bold leading-none text-[var(--ink)]">{value}</span>
			<span className="label-mono">{label}</span>
		</div>
	);
}

function CompactFeaturedNote({ note, onOpen }: { note: NoteFile; onOpen: () => void }) {
	const updated = formatRelativeTime(new Date(note.updatedAt || note.createdAt));
	const preview = plainTextPreview(note.content, 220).replace(/\s+/g, ' ').trim();
	const wordCount = compactNumber(countBodyWords(note.content));

	return (
		<section className="border-b-[1.5px] border-[var(--ink)] bg-[var(--bg-elevated)]">
			<div className="flex items-center justify-between border-b-[1.5px] border-[var(--ink)] bg-[var(--bg-surface)] px-5 py-3">
				<span className="label-mono-strong">{isPinned(note) ? 'Pinned note' : 'Lead note'}</span>
				<span className="label-mono">{updated}</span>
			</div>
			<button
				type="button"
				onClick={onOpen}
				className="group block w-full text-left px-5 py-5 transition-colors hover:bg-[var(--bg-hover)]"
			>
				<div className="flex items-start justify-between gap-4">
					<div className="min-w-0">
						<p className="label-mono">{wordCount} words</p>
						<h2 className="title-script mt-3 text-[42px] leading-[0.9] text-[var(--ink)]">
							{getNoteDisplayTitle(note)}
						</h2>
					</div>
					<span className="surface-inverse flex h-10 w-10 flex-shrink-0 items-center justify-center border-[1.5px] border-[var(--ink)] transition-transform group-hover:-translate-y-0.5">
						<Icon icon={ArrowRight01Icon} size={16} strokeWidth={2} />
					</span>
				</div>
				<p className="mt-4 font-[var(--font-prose)] text-[15px] leading-relaxed text-[var(--text-secondary)]">
					{preview || 'Blank page. Tap to start writing.'}
				</p>
			</button>
		</section>
	);
}

function CompactRecentRow({
	note,
	index,
	onOpen,
}: {
	note: NoteFile;
	index: number;
	onOpen: () => void;
}) {
	const updated = formatRelativeTime(new Date(note.updatedAt || note.createdAt));
	const preview = plainTextPreview(note.content, 120).replace(/\s+/g, ' ').trim();

	return (
		<button
			type="button"
			onClick={onOpen}
			className="grid w-full grid-cols-[64px_minmax(0,1fr)] text-left transition-colors hover:bg-[var(--bg-hover)]"
		>
			<div className="flex flex-col items-center justify-center gap-1 border-r-[1.5px] border-[var(--ink)] bg-[var(--bg-surface)] px-2 py-4">
				<span className="font-mono text-[18px] font-bold leading-none text-[var(--ink)]">
					{String(index).padStart(2, '0')}
				</span>
				<span className={isPinned(note) ? 'label-mono-strong text-[var(--accent)]' : 'label-mono'}>
					{isPinned(note) ? 'Pin' : 'Recent'}
				</span>
			</div>
			<div className="px-4 py-4">
				<div className="flex items-start justify-between gap-3">
					<span className="min-w-0 font-mono text-[13px] font-semibold uppercase tracking-[0.06em] leading-tight text-[var(--ink)]">
						{getNoteDisplayTitle(note)}
					</span>
					<span className="label-mono shrink-0">{updated}</span>
				</div>
				<p className="mt-2 font-[var(--font-prose)] text-[13px] leading-[1.45] text-[var(--text-secondary)]">
					{preview || 'Blank page. Open it.'}
				</p>
			</div>
		</button>
	);
}

function CompactEmptyState({ onNewNote }: { onNewNote: () => void }) {
	return (
		<section className="border-b-[1.5px] border-[var(--ink)] bg-[var(--bg-elevated)] px-5 py-12">
			<div className="panel-bordered inline-flex px-4 py-2 label-mono-strong">[ Blank desk ]</div>
			<h2 className="title-script mt-6 text-[42px] leading-[0.92] text-[var(--ink)]">Start here.</h2>
			<p className="mt-4 max-w-[30ch] font-[var(--font-prose)] text-[15px] leading-relaxed text-[var(--text-secondary)]">
				Your mobile home is ready for the first page. Create a note and this desk turns into a live queue.
			</p>
			<button type="button" onClick={onNewNote} className="btn-stamp btn-stamp-accent mt-6 h-12 px-5">
				<Icon icon={Add01Icon} size={14} strokeWidth={2} />
				New note
			</button>
		</section>
	);
}

export default function HomeScreen({
	notes,
	onNewNote,
	onCreateDailyNote,
	onSelectNote,
	theme,
	onSetTheme,
	accentId,
	onAccentChange,
	sidebarCollapsed,
	onToggleSidebar,
	onOpenAuthModal,
	syncing,
	syncStatus,
	onSync,
	fontId,
	onFontChange,
}: HomeScreenProps) {
	const { user } = useAuth();
	const [profileOpen, setProfileOpen] = useState(false);
	const profileAnchorRef = useRef<HTMLDivElement>(null);

	const fileNotes = useMemo(
		() => notes.filter((n): n is NoteFile => n.type === 'file' && !n.deletedAt),
		[notes],
	);

	const { streak, totalWords } = useMemo(() => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const sortedNotes = [...fileNotes].sort(
			(a, b) =>
				new Date(b.updatedAt || b.createdAt).getTime() -
				new Date(a.updatedAt || a.createdAt).getTime(),
		);

		let streakCount = 0;
		const currentDate = new Date(today);

		for (let i = 0; i < 365; i++) {
			const dayStart = new Date(currentDate);
			const dayEnd = new Date(currentDate);
			dayEnd.setHours(23, 59, 59, 999);

			const hasActivity = sortedNotes.some((note) => {
				const nd = new Date(note.updatedAt || note.createdAt);
				return nd >= dayStart && nd <= dayEnd;
			});

			if (hasActivity) {
				streakCount++;
				currentDate.setDate(currentDate.getDate() - 1);
			} else {
				break;
			}
		}

		const total = sortedNotes.reduce((sum, n) => sum + countBodyWords(n.content), 0);
		return { streak: streakCount, totalWords: total };
	}, [fileNotes]);

	const recentAndPinned = useMemo(() => {
		const sorted = [...fileNotes].sort(compareRecentNotes);
		const pinned = sorted.filter((n) => isPinned(n));
		const others = sorted.filter((n) => !isPinned(n));
		return [...pinned, ...others].slice(0, 8);
	}, [fileNotes]);

	const [hoveredId, setHoveredId] = useState<string | null>(null);
	const previewNote = useMemo(() => {
		if (hoveredId) return fileNotes.find((n) => n.id === hoveredId) ?? null;
		return recentAndPinned[0] ?? null;
	}, [hoveredId, fileNotes, recentAndPinned]);

	const today = new Date();
	const dateLabel = today
		.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
		.toUpperCase()
		.replace(',', ' ·');

	const greeting = getTimeGreeting();
	const motto = getMotivationalMessage(streak);
	const featuredCompactNote = recentAndPinned[0] ?? null;
	const compactQueue = featuredCompactNote ? recentAndPinned.slice(1, 7) : [];

	return (
		<div className="flex flex-1 min-w-0 flex-col bg-[var(--bg-primary)] overflow-hidden">
			{/* ── Top utility bar ── */}
			<div className="flex items-center justify-between px-4 py-2 border-b-[1.5px] border-[var(--ink)] bg-[var(--bg-surface)]">
				{sidebarCollapsed ? (
					<button
						type="button"
						onClick={onToggleSidebar}
						className="btn-cell"
						title="Toggle sidebar"
						aria-label="Toggle sidebar"
					>
						<Icon icon={SidebarLeftIcon} size={16} strokeWidth={1.5} />
					</button>
				) : (
					<div className="w-9" />
				)}

				<div className="ml-auto flex items-center gap-2 pr-1">
					{/* Settings pill */}
					<SettingsMenu
						theme={theme}
						onSetTheme={onSetTheme}
						accentId={accentId}
						onAccentChange={onAccentChange}
						syncing={syncing}
						syncStatus={syncStatus}
						onSync={onSync}
						fontId={fontId}
						onFontChange={onFontChange}
						className="!block"
					/>

					{/* User pill / Sign in pill */}
					{user ? (
						<div ref={profileAnchorRef} className="relative">
							<button
								type="button"
								onClick={() => setProfileOpen((v) => !v)}
								className="btn-pill gap-2"
								title="Profile"
								aria-expanded={profileOpen}
							>
								<div className="flex items-center justify-center w-5 h-5 bg-[var(--accent)] text-[var(--accent-text)] text-[10px] font-bold flex-shrink-0 overflow-hidden" style={{ borderRadius: '50%' }}>
									{user.user_metadata?.avatar_url ? (
										<img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
									) : (
										user.email?.[0]?.toUpperCase() || '?'
									)}
								</div>
								<span className="hidden max-w-[96px] truncate min-[400px]:inline">
									{user.user_metadata?.display_name || user.email?.split('@')[0]}
								</span>
							</button>
							<AnimatePresence>
								{profileOpen && (
									<ProfilePanel onClose={() => setProfileOpen(false)} />
								)}
							</AnimatePresence>
						</div>
					) : (
						<button
							type="button"
							onClick={onOpenAuthModal}
							className="btn-pill btn-pill-accent"
							title="Sign in to sync your notes"
						>
							<Icon icon={CloudUploadIcon} size={14} strokeWidth={1.5} />
							<span className="hidden min-[400px]:inline">Sign in</span>
						</button>
					)}
				</div>
			</div>

			<div className="lg:hidden flex-1 overflow-y-auto">
				<CompactHeroPanel greeting={greeting} dateLabel={dateLabel} motto={motto} noteCount={fileNotes.length} />

				<div className="grid grid-cols-3 border-b-[1.5px] border-[var(--ink)]">
					<CompactStatCell label="Notes" value={compactNumber(fileNotes.length)} />
					<CompactStatCell label="Streak" value={String(streak)} />
					<CompactStatCell label="Words" value={compactNumber(totalWords)} />
				</div>

				<div className="grid grid-cols-2 border-b-[1.5px] border-[var(--ink)] bg-[var(--bg-surface)]">
					<button
						type="button"
						onClick={onNewNote}
						className="btn-stamp btn-stamp-inverse h-14 rounded-none border-r-[1.5px] border-[var(--ink)] !shadow-none"
					>
						<Icon icon={Add01Icon} size={14} strokeWidth={2} />
						New note
					</button>
					<button
						type="button"
						onClick={onCreateDailyNote}
						className="btn-stamp btn-stamp-accent h-14 rounded-none border-[var(--ink)] !shadow-none"
					>
						<Icon icon={Calendar01Icon} size={14} strokeWidth={2} />
						Daily
					</button>
				</div>

				{featuredCompactNote ? (
					<CompactFeaturedNote note={featuredCompactNote} onOpen={() => onSelectNote(featuredCompactNote.id)} />
				) : (
					<CompactEmptyState onNewNote={onNewNote} />
				)}

				<section className="border-b-[1.5px] border-[var(--ink)] bg-[var(--bg-primary)]">
					<div className="flex items-center justify-between border-b-[1.5px] border-[var(--ink)] bg-[var(--bg-surface)] px-5 py-3">
						<span className="label-mono-strong">Queue</span>
						<span className="label-mono">{compactNumber(recentAndPinned.length)} files</span>
					</div>
					{compactQueue.length > 0 ? (
						compactQueue.map((note, index) => (
							<div key={note.id} className="border-b border-[var(--border-subtle)] last:border-b-0">
								<CompactRecentRow note={note} index={index + 2} onOpen={() => onSelectNote(note.id)} />
							</div>
						))
					) : featuredCompactNote ? (
						<div className="px-5 py-5">
							<p className="label-mono">No other recent notes yet.</p>
						</div>
					) : (
						<div className="px-5 py-5">
							<p className="label-mono">Your queue will build itself as soon as you start writing.</p>
						</div>
					)}
				</section>
			</div>

			<div className="hidden lg:flex lg:flex-1 lg:min-h-0 lg:flex-col">
				{/* ── Dashboard grid: greeting | stats ── */}
				<div className="grid grid-cols-1 md:grid-cols-[1fr_minmax(300px,420px)] border-b-[1.5px] border-[var(--ink)]">
					{/* Greeting */}
					<div className="px-6 py-8 md:py-10 border-b md:border-b-0 md:border-r-[1.5px] border-[var(--ink)] bg-[var(--bg-primary)]">
						<h1 className="title-script text-[56px] md:text-[72px] leading-none mb-3">
							{greeting}.
						</h1>
						<p className="font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--ink)] mt-2">
							{dateLabel}
						</p>
						<p className="label-mono mt-1.5">{motto}</p>
					</div>

					{/* Stats + Actions */}
					<div className="grid grid-cols-3 grid-rows-[1fr_auto] bg-[var(--bg-surface)] self-stretch">
						<StatBlock label="Notes" value={compactNumber(fileNotes.length)} />
						<StatBlock label="Streak" value={String(streak)} />
						<StatBlock label="Words" value={compactNumber(totalWords)} />

						<div className="col-span-3 grid grid-cols-3 border-t-[1.5px] border-[var(--ink)]">
							<button
								type="button"
								onClick={onNewNote}
								className="flex items-center justify-center gap-2 h-12 col-span-1 border-r-[1.5px] border-[var(--ink)] bg-transparent text-[var(--ink)] font-mono text-[11px] font-medium uppercase tracking-[0.08em] cursor-pointer hover:bg-[var(--bg-hover)] transition-colors active:bg-[var(--bg-deep)]"
							>
								<Icon icon={Add01Icon} size={13} strokeWidth={2} />
								New
							</button>
							<button
								type="button"
								onClick={onCreateDailyNote}
								className="flex items-center justify-center gap-2 h-12 col-span-2 bg-[var(--accent)] text-[var(--accent-text)] font-mono text-[11px] font-medium uppercase tracking-[0.08em] cursor-pointer hover:bg-[var(--accent-hover)] transition-colors"
							>
								<Icon icon={Calendar01Icon} size={13} strokeWidth={2} />
								Daily
							</button>
						</div>
					</div>
				</div>

				{/* ── Recent + Preview ── */}
				<div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_minmax(300px,420px)] min-h-0">
					{/* Recent / Pinned list */}
					<div className="flex flex-col border-b md:border-b-0 md:border-r-[1.5px] border-[var(--ink)] min-h-0">
						<div className="flex items-center justify-between px-6 py-3 border-b-[1.5px] border-[var(--ink)] bg-[var(--bg-surface)]">
							<span className="label-mono-strong">Recent</span>
						</div>
						<div className="flex-1 overflow-y-auto">
							{recentAndPinned.length === 0 ? (
								<EmptyRecent onNewNote={onNewNote} />
							) : (
								recentAndPinned.map((note) => (
									<RecentRow
										key={note.id}
										note={note}
										onSelect={() => onSelectNote(note.id)}
										onHover={() => setHoveredId(note.id)}
										onLeave={() => setHoveredId(null)}
									/>
								))
							)}
						</div>
					</div>

					{/* Preview pane */}
					<div className="flex flex-col bg-[var(--bg-primary)] min-h-0">
						<div className="flex items-center justify-between px-6 py-3 border-b-[1.5px] border-[var(--ink)] bg-[var(--bg-surface)]">
							<span className="label-mono-strong">Preview</span>
							{previewNote && (
								<button
									type="button"
									onClick={() => onSelectNote(previewNote.id)}
									className="label-mono-strong text-[var(--accent)] inline-flex items-center gap-1 hover:underline"
								>
									Open <Icon icon={ArrowRight01Icon} size={12} strokeWidth={2} />
								</button>
							)}
						</div>

						{previewNote ? (
							<PreviewPane note={previewNote} onOpen={() => onSelectNote(previewNote.id)} />
						) : (
							<EmptyPreview />
						)}

					</div>
				</div>
			</div>
		</div>
	);
}

function StatBlock({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex flex-col items-start justify-center px-4 py-5 border-r-[1.5px] last:border-r-0 border-[var(--ink)] bg-[var(--bg-surface)]">
			<div className="font-mono font-bold text-[28px] md:text-[34px] leading-none text-[var(--ink)]">
				{value}
			</div>
			<div className="label-mono mt-2">{label}</div>
		</div>
	);
}

function RecentRow({
	note,
	onSelect,
	onHover,
	onLeave,
}: {
	note: NoteFile;
	onSelect: () => void;
	onHover: () => void;
	onLeave: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onSelect}
			onMouseEnter={onHover}
			onMouseLeave={onLeave}
			className="flex items-center w-full gap-3 px-6 py-4 text-left border-b border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] transition-colors"
		>
			<span className="block w-1.5 h-1.5 border border-[var(--text-muted)] flex-shrink-0" aria-hidden />
			<span className="flex-1 font-mono text-[14px] font-medium truncate text-[var(--ink)]">
				{getNoteDisplayTitle(note)}
			</span>
			<span className="label-mono">{formatRelativeTime(new Date(note.updatedAt || note.createdAt))}</span>
		</button>
	);
}

function PreviewPane({ note, onOpen }: { note: NoteFile; onOpen: () => void }) {
	const updated = formatRelativeTime(new Date(note.updatedAt || note.createdAt));
	const preview = plainTextPreview(note.content);
	return (
		<div className="flex-1 overflow-y-auto">
			{/* Title block — inverted */}
			<button
				type="button"
				onClick={onOpen}
				className="block w-full text-left px-6 py-5 surface-inverse border-b-[1.5px] border-[var(--ink)] hover:bg-[var(--ink-soft)] transition-colors"
			>
				<div className="title-script text-[36px] mb-1" style={{ color: 'var(--text-inverse)' }}>
					{getNoteDisplayTitle(note)}
				</div>
				<div className="label-mono" style={{ color: 'rgba(245,241,230,0.6)' }}>
					Updated {updated} ago
				</div>
			</button>

			<div className="px-6 py-5 space-y-3">
				{preview ? (
					<pre className="whitespace-pre-wrap font-[var(--font-prose)] text-[14px] leading-relaxed text-[var(--text-secondary)]">
						{preview}
					</pre>
				) : (
					<p className="label-mono">No content yet.</p>
				)}
			</div>
		</div>
	);
}

function EmptyRecent({ onNewNote }: { onNewNote: () => void }) {
	return (
		<div className="flex flex-col items-center justify-center h-full py-16 px-6 gap-5">
			<div className="panel-bordered px-5 py-3 label-mono-strong">[ Nothing here ]</div>
			<p className="label-mono text-center max-w-xs">
				Start a note and it shows up here. Pin it with <span className="text-[var(--ink)]">★</span> to keep it on top.
			</p>
			<button type="button" onClick={onNewNote} className="btn-stamp btn-stamp-accent">
				<Icon icon={Add01Icon} size={14} strokeWidth={2} />
				New note
			</button>
		</div>
	);
}

function EmptyPreview() {
	return (
		<div className="flex-1 flex flex-col items-center justify-center px-6 gap-3">
			<div className="title-script text-[40px] text-[var(--text-muted)]">empty.</div>
			<p className="label-mono text-center">Hover a note to peek inside.</p>
		</div>
	);
}
