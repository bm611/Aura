const fs = require('fs');
const file = 'apps/web/src/components/LandingPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Label
content = content.replace(
  /className="mb-4 inline-block rounded-full border border-\[var\(--border-default\)\] bg-\[var\(--bg-surface\)\] px-3 py-1 text-\[11px\] font-semibold uppercase tracking-\[0\.12em\] text-\[var\(--text-muted\)\]"/g,
  'className="mb-4 inline-block border-[1.5px] border-[var(--ink)] bg-[var(--bg-surface)] px-3 py-1 label-mono-strong shadow-[var(--stamp-shadow)]"'
);

// 2. Mocks/Panels
content = content.replace(
  /rounded-2xl border border-\[var\(--border-subtle\)\] bg-\[var\(--bg-primary\)\] shadow-\[0_32px_80px_rgba\(0,0,0,0\.45\)\]/g,
  'panel-bordered-thick'
);
content = content.replace(
  /rounded-2xl border border-\[var\(--border-subtle\)\] bg-\[var\(--bg-elevated\)\] shadow-\[0_32px_80px_rgba\(0,0,0,0\.5\)\]/g,
  'panel-bordered-thick'
);

// 3. Buttons (Get Started)
content = content.replace(
  /className="glass-accent group inline-flex items-center gap-3 rounded-full bg-\[var\(--accent\)\] px-8 py-4 font-medium text-white transition-\[transform,filter,box-shadow\] duration-200 hover:brightness-110 active:scale-\[0\.96\]"/g,
  'className="btn-stamp btn-stamp-accent group inline-flex items-center gap-3 px-8 py-4 text-base"'
);
content = content.replace(
  /className="flex h-8 w-8 items-center justify-center rounded-full bg-white\/20 shadow-sm transition-\[transform,background-color\] duration-150 group-hover:translate-x-1 group-hover:bg-white\/30"/g,
  'className="flex h-8 w-8 items-center justify-center transition-[transform] duration-150 group-hover:translate-x-1"'
);

// 4. Buttons (Sign In)
content = content.replace(
  /className="glass-ghost group inline-flex items-center gap-2\.5 rounded-full px-6 py-3\.5 text-\[14px\] font-medium text-\[var\(--text-muted\)\] transition-\[transform,color,border-color,box-shadow,background-color\] duration-200 ease-out hover:text-\[var\(--text-primary\)\] active:scale-\[0\.96\]"/g,
  'className="btn-stamp btn-stamp-ghost group inline-flex items-center gap-2.5 px-6 py-3.5"'
);

// 5. Chrome bar
content = content.replace(
  /className="flex items-center gap-1\.5 border-b border-\[var\(--border-subtle\)\] bg-\[var\(--bg-surface\)\] px-4 py-3"/g,
  'className="flex items-center gap-1.5 border-b-[1.5px] border-[var(--ink)] bg-[var(--bg-surface)] px-4 py-3"'
);
content = content.replace(
  /className="h-2\.5 w-2\.5 rounded-full bg-\[var\(--danger\)\] opacity-70"/g,
  'className="h-2.5 w-2.5 border-[1px] border-[var(--ink)] bg-[var(--danger)]"'
);
content = content.replace(
  /className="h-2\.5 w-2\.5 rounded-full bg-\[var\(--warning\)\] opacity-70"/g,
  'className="h-2.5 w-2.5 border-[1px] border-[var(--ink)] bg-[var(--warning)]"'
);
content = content.replace(
  /className="h-2\.5 w-2\.5 rounded-full bg-\[var\(--success\)\] opacity-70"/g,
  'className="h-2.5 w-2.5 border-[1px] border-[var(--ink)] bg-[var(--success)]"'
);

// 6. Tip Callouts
content = content.replace(
  /className="flex gap-3 rounded-xl border border-\[#5ea8c8\]\/25 bg-\[#5ea8c8\]\/8 px-4 py-3"/g,
  'className="flex gap-3 border-[1.5px] border-[var(--ink)] bg-[#5ea8c8]/10 px-4 py-3 shadow-[var(--stamp-shadow)]"'
);
content = content.replace(
  /className="flex gap-3 rounded-xl border border-\[var\(--accent\)\]\/20 bg-\[var\(--accent\)\]\/6 px-4 py-3"/g,
  'className="flex gap-3 border-[1.5px] border-[var(--ink)] bg-[var(--accent)]/10 px-4 py-3 shadow-[var(--stamp-shadow)]"'
);
content = content.replace(
  /className="flex gap-3 rounded-xl border border-\[var\(--accent\)\]\/20 bg-\[var\(--accent\)\]\/6 px-3\.5 py-3"/g,
  'className="flex gap-3 border-[1.5px] border-[var(--ink)] bg-[var(--accent)]/10 px-3.5 py-3 shadow-[var(--stamp-shadow)]"'
);

// 7. Checkboxes
content = content.replace(
  /className="flex h-4 w-4 shrink-0 items-center justify-center rounded"/g,
  'className="flex h-4 w-4 shrink-0 items-center justify-center border-[1.5px] border-[var(--ink)]"'
);

// 8. Code block mock
content = content.replace(
  /className="overflow-hidden rounded-lg border border-\[var\(--border-subtle\)\] bg-\[var\(--bg-elevated\)\]"/g,
  'className="overflow-hidden border-[1.5px] border-[var(--ink)] bg-[var(--bg-elevated)] shadow-[var(--stamp-shadow)]"'
);
content = content.replace(
  /className="flex items-center justify-between border-b border-\[var\(--border-subtle\)\] px-3 py-2"/g,
  'className="flex items-center justify-between border-b-[1.5px] border-[var(--ink)] px-3 py-2"'
);

// 9. AI input & streaming badge
content = content.replace(
  /className="border-b border-\[var\(--border-subtle\)\] bg-\[var\(--bg-surface\)\] px-4 py-3"/g,
  'className="border-b-[1.5px] border-[var(--ink)] bg-[var(--bg-surface)] px-4 py-3"'
);
content = content.replace(
  /className="inline-flex items-center gap-1 rounded-full border border-\[var\(--accent\)\]\/30 bg-\[var\(--accent\)\]\/10 px-2\.5 py-0\.5 text-\[11px\] font-medium text-\[var\(--accent\)\]"/g,
  'className="inline-flex items-center gap-1 border-[1px] border-[var(--ink)] bg-[var(--accent)] px-2.5 py-0.5 label-mono text-[var(--ink)] shadow-[2px_2px_0_var(--ink)]"'
);
content = content.replace(
  /className="ml-auto rounded-full bg-\[var\(--success\)\]\/15 px-2 py-0\.5 text-\[10px\] font-medium text-\[var\(--success\)\]"/g,
  'className="ml-auto border-[1.5px] border-[var(--ink)] bg-[var(--success)] px-2 py-0.5 label-mono text-[var(--ink)] shadow-[2px_2px_0_var(--ink)]"'
);

// 10. Capability icons
content = content.replace(
  /className="mt-0\.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-\[var\(--border-subtle\)\] bg-\[var\(--bg-surface\)\] text-\[var\(--accent\)\]"/g,
  'className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border-[1.5px] border-[var(--ink)] bg-[var(--bg-surface)] text-[var(--accent)] shadow-[var(--stamp-shadow)]"'
);

// 11. Command Palette
content = content.replace(
  /className="flex items-center gap-3 border-b border-\[var\(--border-subtle\)\] px-4 py-3\.5"/g,
  'className="flex items-center gap-3 border-b-[1.5px] border-[var(--ink)] px-4 py-3.5"'
);
content = content.replace(
  /className="rounded border border-\[var\(--border-default\)\] bg-\[var\(--bg-surface\)\] px-1\.5 py-0\.5 text-\[10px\] font-medium text-\[var\(--text-muted\)\]"/g,
  'className="border-[1.5px] border-[var(--ink)] bg-[var(--bg-surface)] px-1.5 py-0.5 label-mono shadow-[2px_2px_0_var(--ink)]"'
);
content = content.replace(
  /className="ml-auto rounded border border-\[var\(--border-subtle\)\] bg-\[var\(--bg-surface\)\] px-1\.5 py-0\.5 text-\[9px\] text-\[var\(--text-muted\)\]"/g,
  'className="ml-auto border-[1.5px] border-[var(--ink)] bg-[var(--bg-surface)] px-1.5 py-0.5 label-mono shadow-[2px_2px_0_var(--ink)]"'
);
content = content.replace(
  /className={`flex items-center gap-2\.5 rounded-lg px-2 py-2 text-xs \${gi === 0 && ii === 0 \? 'bg-\[var\(--bg-hover\)\] text-\[var\(--text-primary\)\]' : 'text-\[var\(--text-secondary\)\]'}`}/g,
  'className={`flex items-center gap-2.5 px-2 py-2 text-xs font-mono uppercase tracking-wide border-[1px] border-transparent ${gi === 0 && ii === 0 ? "surface-inverse border-[var(--ink)]" : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"}`}'
);
content = content.replace(
  /className="rounded-full border border-\[var\(--border-subtle\)\] bg-\[var\(--bg-surface\)\] px-3 py-1 text-xs text-\[var\(--text-muted\)\]"/g,
  'className="border-[1.5px] border-[var(--ink)] bg-[var(--bg-surface)] px-3 py-1 label-mono shadow-[var(--stamp-shadow)]"'
);
content = content.replace(
  /className="rounded border border-\[var\(--border-default\)\] bg-\[var\(--bg-surface\)\] px-2 py-0\.5 text-sm text-\[var\(--text-primary\)\]"/g,
  'className="border-[1.5px] border-[var(--ink)] bg-[var(--bg-surface)] px-2 py-0.5 label-mono-strong shadow-[2px_2px_0_var(--ink)]"'
);

// 12. Pillars
content = content.replace(
  /className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-\[var\(--border-subtle\)\] bg-\[var\(--bg-elevated\)\]"/g,
  'className="mb-5 flex h-10 w-10 items-center justify-center border-[1.5px] border-[var(--ink)] bg-[var(--bg-elevated)] shadow-[var(--stamp-shadow)]"'
);
content = content.replace(
  /className="flex items-center gap-2 rounded-full border border-\[var\(--border-subtle\)\] bg-\[var\(--bg-elevated\)\] px-4 py-2 text-xs text-\[var\(--text-muted\)\]"/g,
  'className="flex items-center gap-2 border-[1.5px] border-[var(--ink)] bg-[var(--bg-elevated)] px-4 py-2 label-mono shadow-[var(--stamp-shadow)]"'
);

// 13. Swatches & Fonts
content = content.replace(
  /className="h-8 w-8 rounded-full ring-2 ring-offset-2 ring-offset-\[var\(--bg-deep\)\] transition-transform duration-200 group-hover:scale-110"/g,
  'className="h-8 w-8 border-[1.5px] border-[var(--ink)] transition-transform duration-200 group-hover:-translate-y-1 shadow-[var(--stamp-shadow)]"'
);
content = content.replace(
  /className={`rounded-full border px-3 py-1 text-xs transition-colors \${i === 0 \? 'border-\[var\(--accent\)\]\/50 bg-\[var\(--accent\)\]\/10 text-\[var\(--accent\)\]' : 'border-\[var\(--border-subtle\)\] bg-\[var\(--bg-surface\)\] text-\[var\(--text-muted\)\]'}`}/g,
  'className={`border-[1.5px] border-[var(--ink)] px-3 py-1 text-xs font-mono uppercase tracking-wide transition-colors shadow-[var(--stamp-shadow)] ${i === 0 ? "bg-[var(--accent)] text-[var(--ink)]" : "bg-[var(--bg-surface)] text-[var(--ink)]"}`}'
);

// 14. Theme panel
content = content.replace(
  /className={`flex items-center justify-between rounded-xl border px-4 py-3 \${active \? 'border-\[var\(--accent\)\]\/30 bg-\[var\(--accent\)\]\/8' : 'border-\[var\(--border-subtle\)\] bg-\[var\(--bg-surface\)\]'}`}/g,
  'className={`flex items-center justify-between border-[1.5px] px-4 py-3 shadow-[var(--stamp-shadow)] ${active ? "border-[var(--ink)] bg-[var(--accent)]" : "border-[var(--ink)] bg-[var(--bg-surface)]"}`}'
);
content = content.replace(
  /className={`text-sm \${active \? 'font-medium text-\[var\(--text-primary\)\]' : 'text-\[var\(--text-muted\)\]'}`}/g,
  'className={`label-mono ${active ? "text-[var(--ink)]" : "text-[var(--text-muted)]"}`}'
);
content = content.replace(
  /className="flex h-4 w-4 items-center justify-center rounded-full" style={{ background: 'var\(--accent\)' }}/g,
  'className="flex h-4 w-4 items-center justify-center border-[1.5px] border-[var(--ink)] bg-[var(--bg-surface)]"'
);
content = content.replace(
  /<path d="M1\.5 4L3 5\.5L6\.5 2" stroke="white" strokeWidth="1\.5" strokeLinecap="round" strokeLinejoin="round" \/>/g,
  '<path d="M1.5 4L3 5.5L6.5 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />'
);

// 15. Wide toggle
content = content.replace(
  /className="flex h-5 w-9 items-center rounded-full bg-\[var\(--accent\)\] px-0\.5"/g,
  'className="flex h-5 w-9 items-center border-[1.5px] border-[var(--ink)] bg-[var(--accent)] px-0.5 shadow-[2px_2px_0_var(--ink)]"'
);
content = content.replace(
  /className="ml-auto h-4 w-4 rounded-full bg-white shadow-sm"/g,
  'className="ml-auto h-3.5 w-3.5 border-[1px] border-[var(--ink)] bg-white"'
);

// 16. Icon Preview
content = content.replace(
  /className="mt-6 rounded-xl border border-\[var\(--border-subtle\)\] bg-\[var\(--bg-surface\)\] p-4"/g,
  'className="mt-6 border-[1.5px] border-[var(--ink)] bg-[var(--bg-surface)] p-4 shadow-[var(--stamp-shadow)]"'
);
content = content.replace(
  /className="mb-3 text-\[10px\] uppercase tracking-widest text-\[var\(--text-muted\)\]"/g,
  'className="mb-3 label-mono"'
);
content = content.replace(
  /className="h-5 w-5 rounded-full" style={{ background: 'var\(--accent\)' }}/g,
  'className="h-5 w-5 border-[1.5px] border-[var(--ink)] shadow-[2px_2px_0_var(--ink)]" style={{ background: "var(--accent)" }}'
);

fs.writeFileSync(file, content);
console.log('Applied brutalist theme substitutions to ' + file);
