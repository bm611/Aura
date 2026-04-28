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
import { isStarterNote } from '../utils/starterNotes';
import { useAuth } from '../contexts/AuthContext';
import type { NoteFile, TreeNode } from '../types';
import type { SyncStatus } from './noteEditorUtils';
import {
	formatRelativeTime,
	compareRecentNotes,
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
	dayOfWeek,
	dateLabel,
	isGettingStarted,
	noteCount,
	streak,
	totalWords,
	onNewNote,
	onCreateDailyNote,
}: {
	dayOfWeek: string;
	dateLabel: string;
	isGettingStarted: boolean;
	noteCount: number;
	streak: number;
	totalWords: number;
	onNewNote: () => void;
	onCreateDailyNote: () => void;
}) {
	return (
		<section className="border-b-[1.5px] border-[var(--ink)] bg-[var(--bg-primary)]">
			<div className="px-5 pt-5 pb-5">
				<h1 className="title-script text-[clamp(3rem,15vw,4.6rem)] leading-[0.84] text-[var(--ink)]">
					{dayOfWeek}.
				</h1>

				<p className="label-mono mt-2">{dateLabel}</p>

				<div className="mt-5 border-[1.5px] border-[var(--ink)] bg-[var(--bg-surface)]">
					{isGettingStarted ? (
						<div className="px-4 py-5">
							<div className="label-mono-strong">Getting started</div>
							<p className="mt-3 max-w-[28ch] font-[var(--font-prose)] text-[14px] leading-relaxed text-[var(--text-secondary)]">
								Start with a fresh note or capture today&apos;s entry. Your writing stats show up once you have notes of your own.
							</p>
						</div>
					) : (
						<div className="grid grid-cols-3">
							<div className="flex flex-col gap-1 px-4 py-4 border-r-[1.5px] border-[var(--ink)]">
								<span className="font-mono text-[22px] font-bold leading-none text-[var(--ink)]">
									{compactNumber(noteCount)}
								</span>
								<span className="label-mono">Notes</span>
							</div>
							<div className="flex flex-col gap-1 px-4 py-4 border-r-[1.5px] border-[var(--ink)]">
								<span className="font-mono text-[22px] font-bold leading-none text-[var(--ink)]">{streak}</span>
								<span className="label-mono">Streak</span>
							</div>
							<div className="flex flex-col gap-1 px-4 py-4">
								<span className="font-mono text-[22px] font-bold leading-none text-[var(--ink)]">
									{compactNumber(totalWords)}
								</span>
								<span className="label-mono">Words</span>
							</div>
						</div>
					)}

					<div className="grid grid-cols-1 min-[360px]:grid-cols-2 border-t-[1.5px] border-[var(--ink)]">
						<button
							type="button"
							onClick={onNewNote}
							className="flex items-center justify-center gap-2 min-h-12 px-4 py-3 border-b-[1.5px] min-[360px]:border-b-0 min-[360px]:border-r-[1.5px] border-[var(--ink)] bg-transparent text-[var(--ink)] font-mono text-[11px] font-medium uppercase tracking-[0.08em] transition-colors hover:bg-[var(--bg-hover)] active:bg-[var(--bg-deep)]"
						>
							<Icon icon={Add01Icon} size={13} strokeWidth={2} />
							New note
						</button>
						<button
							type="button"
							onClick={onCreateDailyNote}
							className="flex items-center justify-center gap-2 min-h-12 px-4 py-3 bg-[var(--accent)] text-[var(--accent-text)] font-mono text-[11px] font-medium uppercase tracking-[0.08em] transition-colors hover:opacity-90"
						>
							<Icon icon={Calendar01Icon} size={13} strokeWidth={2} />
							Today&apos;s entry
						</button>
					</div>
				</div>
			</div>
		</section>
	);
}
function CompactRecentRow({
	note,
	onOpen,
}: {
	note: NoteFile;
	index: number;
	onOpen: () => void;
}) {
	const updated = formatRelativeTime(new Date(note.updatedAt || note.createdAt));

	return (
		<button
			type="button"
			onClick={onOpen}
			className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-[var(--bg-hover)] border-b border-[var(--border-subtle)] last:border-b-0"
		>
			<span className="block w-1.5 h-1.5 border border-[var(--text-muted)] flex-shrink-0 mt-0.5" aria-hidden />
			<span className="flex-1 min-w-0 font-mono text-[13px] font-semibold uppercase tracking-[0.05em] leading-tight text-[var(--ink)] truncate">
				{getNoteDisplayTitle(note)}
			</span>
			<span className="label-mono flex-shrink-0">{updated}</span>
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
	const userNotes = useMemo(
		() => fileNotes.filter((note) => !isStarterNote(note)),
		[fileNotes],
	);
	const isGettingStarted = userNotes.length === 0;

	const { streak, totalWords } = useMemo(() => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const sortedNotes = [...userNotes].sort(
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
	}, [userNotes]);

	const recentAndPinned = useMemo(() => {
		const sorted = [...fileNotes].sort(compareRecentNotes);
		const pinned = sorted.filter((n) => isPinned(n));
		const others = sorted.filter((n) => !isPinned(n));
		return [...pinned, ...others].slice(0, 8);
	}, [fileNotes]);
	const pinnedNotes = useMemo(
		() => recentAndPinned.filter(isPinned),
		[recentAndPinned],
	);
	const recentNotes = useMemo(
		() => recentAndPinned.filter((note) => !isPinned(note)),
		[recentAndPinned],
	);

	const [hoveredId, setHoveredId] = useState<string | null>(null);
	const previewNote = useMemo(() => {
		if (hoveredId) return fileNotes.find((n) => n.id === hoveredId) ?? null;
		return (
			recentNotes.find((note) => !isStarterNote(note)) ??
			pinnedNotes.find((note) => !isStarterNote(note)) ??
			recentNotes[0] ??
			pinnedNotes[0] ??
			null
		);
	}, [hoveredId, fileNotes, recentNotes, pinnedNotes]);

	const today = new Date();
	const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });
	const dayNumber = String(today.getDate()).padStart(2, '0');
	const monthYear = today.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();
	const dateLabel = today.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});

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
				<CompactHeroPanel
					dayOfWeek={dayOfWeek}
					dateLabel={dateLabel}
					isGettingStarted={isGettingStarted}
					noteCount={userNotes.length}
					streak={streak}
					totalWords={totalWords}
					onNewNote={onNewNote}
					onCreateDailyNote={onCreateDailyNote}
				/>

				{recentAndPinned.length > 0 ? (
					<>
						{pinnedNotes.length > 0 && (
							<section className="border-b-[1.5px] border-[var(--ink)]">
								<div className="flex items-center justify-between px-5 py-3 border-b-[1.5px] border-[var(--ink)] bg-[var(--bg-surface)]">
									<span className="label-mono-strong">Pinned</span>
									<span className="label-mono">{pinnedNotes.length} files</span>
								</div>
								{pinnedNotes.map((note, index) => (
									<CompactRecentRow key={note.id} note={note} index={index + 1} onOpen={() => onSelectNote(note.id)} />
								))}
							</section>
						)}
						{recentNotes.length > 0 && (
							<section className="border-b-[1.5px] border-[var(--ink)] mt-6">
								<div className="flex items-center justify-between px-5 py-3 border-b-[1.5px] border-[var(--ink)] bg-[var(--bg-surface)]">
									<span className="label-mono-strong">Recent</span>
									<span className="label-mono">{recentNotes.length} files</span>
								</div>
								{recentNotes.map((note, index) => (
									<CompactRecentRow key={note.id} note={note} index={index + 1} onOpen={() => onSelectNote(note.id)} />
								))}
							</section>
						)}
					</>
				) : (
					<CompactEmptyState onNewNote={onNewNote} />
				)}
			</div>

			<div className="hidden lg:flex lg:flex-1 lg:min-h-0 lg:flex-col">
				{/* ── Dashboard grid: greeting | stats ── */}
				<div className="grid grid-cols-1 md:grid-cols-[1fr_minmax(300px,420px)] border-b-[1.5px] border-[var(--ink)]">
					{/* Greeting */}
					<div className="px-6 py-8 md:py-10 border-b md:border-b-0 md:border-r-[1.5px] border-[var(--ink)] bg-[var(--bg-primary)]">
						<h1 className="title-script text-[56px] md:text-[72px] leading-none mb-3">
							{dayOfWeek}.
						</h1>
						<p className="font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--ink)] mt-2">
							{dayNumber} {monthYear}
						</p>
					</div>

					{/* Stats + Actions */}
					{isGettingStarted ? (
						<div className="flex flex-col bg-[var(--bg-surface)] self-stretch">
							<div className="flex-1 px-5 py-6 border-b-[1.5px] border-[var(--ink)]">
								<div className="label-mono-strong">Getting started</div>
								<p className="mt-4 max-w-[28ch] font-[var(--font-prose)] text-[15px] leading-relaxed text-[var(--text-secondary)]">
									Start with a fresh note or capture today&apos;s entry. Your writing stats show up once you have notes of your own.
								</p>
							</div>

							<div className="grid grid-cols-2">
								<button
									type="button"
									onClick={onNewNote}
									className="flex items-center justify-center gap-2 h-12 border-r-[1.5px] border-[var(--ink)] bg-transparent text-[var(--ink)] font-mono text-[11px] font-medium uppercase tracking-[0.08em] cursor-pointer hover:bg-[var(--bg-hover)] transition-colors active:bg-[var(--bg-deep)]"
								>
									<Icon icon={Add01Icon} size={13} strokeWidth={2} />
									New note
								</button>
								<button
									type="button"
									onClick={onCreateDailyNote}
									className="flex items-center justify-center gap-2 h-12 bg-[var(--accent)] text-[var(--accent-text)] font-mono text-[11px] font-medium uppercase tracking-[0.08em] cursor-pointer hover:bg-[var(--accent-hover)] transition-colors"
								>
									<Icon icon={Calendar01Icon} size={13} strokeWidth={2} />
									Today&apos;s entry
								</button>
							</div>
						</div>
					) : (
						<div className="grid grid-cols-3 grid-rows-[1fr_auto] bg-[var(--bg-surface)] self-stretch">
							<StatBlock label="Notes" value={compactNumber(userNotes.length)} />
							<StatBlock label="Streak" value={String(streak)} />
							<StatBlock label="Words" value={compactNumber(totalWords)} />

							<div className="col-span-3 grid grid-cols-3 border-t-[1.5px] border-[var(--ink)]">
								<button
									type="button"
									onClick={onNewNote}
									className="flex items-center justify-center gap-2 h-12 col-span-1 border-r-[1.5px] border-[var(--ink)] bg-transparent text-[var(--ink)] font-mono text-[11px] font-medium uppercase tracking-[0.08em] cursor-pointer hover:bg-[var(--bg-hover)] transition-colors active:bg-[var(--bg-deep)]"
								>
									<Icon icon={Add01Icon} size={13} strokeWidth={2} />
									New note
								</button>
								<button
									type="button"
									onClick={onCreateDailyNote}
									className="flex items-center justify-center gap-2 h-12 col-span-2 bg-[var(--accent)] text-[var(--accent-text)] font-mono text-[11px] font-medium uppercase tracking-[0.08em] cursor-pointer hover:bg-[var(--accent-hover)] transition-colors"
								>
									<Icon icon={Calendar01Icon} size={13} strokeWidth={2} />
									Today&apos;s entry
								</button>
							</div>
						</div>
					)}
				</div>

				{/* ── Recent / Pinned ── */}
				<div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_minmax(300px,420px)] min-h-0">
					{/* Pinned + Recent list */}
					<div className="flex flex-col border-b md:border-b-0 md:border-r-[1.5px] border-[var(--ink)] min-h-0">
						{recentAndPinned.length === 0 ? (
							<div className="flex-1 overflow-y-auto">
								<EmptyRecent onNewNote={onNewNote} />
							</div>
						) : (
							<div className="flex-1 overflow-y-auto">
								{pinnedNotes.length > 0 && (
									<NoteListSection
										label="Pinned"
										notes={pinnedNotes}
										onSelectNote={onSelectNote}
										onHoverNote={setHoveredId}
										onLeaveNote={() => setHoveredId(null)}
									/>
								)}
								{recentNotes.length > 0 && (
									<NoteListSection
										label="Recent"
										notes={recentNotes}
										onSelectNote={onSelectNote}
										onHoverNote={setHoveredId}
										onLeaveNote={() => setHoveredId(null)}
										withTopBorder={pinnedNotes.length > 0}
									/>
								)}
							</div>
						)}
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

function NoteListSection({
	label,
	notes,
	onSelectNote,
	onHoverNote,
	onLeaveNote,
	withTopBorder = false,
}: {
	label: string;
	notes: NoteFile[];
	onSelectNote: (noteId: string) => void;
	onHoverNote: (noteId: string) => void;
	onLeaveNote: () => void;
	withTopBorder?: boolean;
}) {
	return (
		<section className={withTopBorder ? 'border-t-[1.5px] border-[var(--ink)]' : ''}>
			<div className="flex items-center justify-between px-6 py-3 border-b-[1.5px] border-[var(--ink)] bg-[var(--bg-surface)]">
				<span className="label-mono-strong">{label}</span>
				<span className="label-mono">{notes.length} files</span>
			</div>
			<div className="[&>*:last-child]:border-b-0">
				{notes.map((note) => (
					<RecentRow
						key={note.id}
						note={note}
						onSelect={() => onSelectNote(note.id)}
						onHover={() => onHoverNote(note.id)}
						onLeave={onLeaveNote}
					/>
				))}
			</div>
		</section>
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
