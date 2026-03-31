export interface Template {
  id: string
  name: string
  description: string
  icon: string
  tags: string[]
  content: string
}

export const TEMPLATES: Template[] = [
  {
    id: 'meeting',
    name: 'Meeting Notes',
    description: 'Structured agenda, attendees, and action items',
    icon: 'Meeting',
    tags: ['meeting'],
    content: `# Meeting Notes

**Date:** 
**Location / Link:** 

---

> [!info] Context
> Add any background or purpose for this meeting.

---

## Attendees

| Name | Role |
|------|------|
|      |      |
|      |      |

## Agenda

1. 
2. 
3. 

---

## Discussion

### 

### 

---

> [!todo] Action Items
> 
> - [ ] 
> - [ ] 
> - [ ] 

---

## Decisions Made

- 

## Next Meeting

**Date:** 
**Topics:** 
`,
  },
  {
    id: 'interview-prep',
    name: 'Interview Prep',
    description: 'Company research, questions, and STAR stories',
    icon: 'Briefcase',
    tags: ['interview', 'career'],
    content: `# Interview Preparation

**Company:** 
**Role:** 
**Date:** 

---

> [!info] Company Overview
> 
> - **Industry:** 
> - **Size:** 
> - **Mission:** 
> - **Recent News:** 

---

## Role Research

- **Key Responsibilities:** 
- **Required Skills:** 
- **Nice-to-haves:** 

---

> [!tip] Key Talking Points
> 
> Note 2–3 things that make you the strongest fit for this role.
> 
> 1. 
> 2. 
> 3. 

---

## STAR Stories

### Story 1 — 

- **Situation:** 
- **Task:** 
- **Action:** 
- **Result:** 

### Story 2 — 

- **Situation:** 
- **Task:** 
- **Action:** 
- **Result:** 

---

> [!question] Questions to Ask
> 
> 1. 
> 2. 
> 3. 
> 4. 

---

> [!warning]- Potential Red Flags
> Note anything to address proactively.
> 
> - 

## Post-Interview Notes

- **Feeling:** 
- **Follow-up sent:** 
`,
  },
  {
    id: 'habit-tracker',
    name: 'Habit Tracker',
    description: 'Weekly habit tracking with checkboxes',
    icon: 'Checkbox',
    tags: ['habit', 'health'],
    content: `# Habit Tracker

**Week of:** 

---

## Habits

| Habit | Mon | Tue | Wed | Thu | Fri | Sat | Sun | Total |
|-------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:-----:|
|       |  ☐  |  ☐  |  ☐  |  ☐  |  ☐  |  ☐  |  ☐  |  0/7  |
|       |  ☐  |  ☐  |  ☐  |  ☐  |  ☐  |  ☐  |  ☐  |  0/7  |
|       |  ☐  |  ☐  |  ☐  |  ☐  |  ☐  |  ☐  |  ☐  |  0/7  |

---

## Goals This Week

- [ ] 
- [ ] 
- [ ] 

---

> [!success] Wins
> What went well this week?
> 
> - 

> [!warning]- Challenges
> What got in the way? How will you handle it next week?
> 
> - 

---

## Weekly Reflection

> [!quote] Reflection
> 

**Score this week (1–10):** 
**One thing to improve next week:** 
`,
  },
  {
    id: 'project-planning',
    name: 'Project Planning',
    description: 'Overview, milestones, tasks, and timeline',
    icon: 'Folder',
    tags: ['project', 'planning'],
    content: `# Project Name

> [!abstract] Overview
> 
> - **Description:** 
> - **Objective:** 
> - **Owner:** 
> - **Stakeholders:** 
> - **Target Date:** 

---

## Milestones

| Milestone | Due Date | Status |
|-----------|----------|--------|
|           |          | 🔲 Not started |
|           |          | 🔲 Not started |
|           |          | 🔲 Not started |

---

## Tasks

### Phase 1 — 

- [ ] 
- [ ] 

### Phase 2 — 

- [ ] 
- [ ] 

### Phase 3 — 

- [ ] 
- [ ] 

---

## Resources

- 

---

> [!warning]- Risks & Mitigation
> 
> | Risk | Likelihood | Impact | Mitigation |
> |------|-----------|--------|------------|
> |      | Low / Med / High | Low / Med / High |  |

> [!important]- Decisions Log
> Record key decisions and the rationale behind them.
> 
> - **[Date]** — 

---

## Notes

`,
  },
  {
    id: 'daily-note',
    name: 'Daily Note',
    description: 'Journal, todos, and ideas for today',
    icon: 'Calendar',
    tags: ['daily'],
    content: `# Daily Note

**Date:** Tuesday, March 31, 2026

---

> [!quote] Intention for Today
> What do you want to focus on or feel by the end of the day?
> 

---

## To-Dos

- [ ] 
- [ ] 
- [ ] 

---

## Journal

### Morning

### Evening

---

> [!success] Wins
> What went well today?
> 
> - 

> [!tip]- Ideas & Notes
> Capture any ideas or random thoughts.
> 
> - 

---

## Grateful for

1. 
2. 
3. 
`,
  },
  {
    id: 'dev-log',
    name: 'Dev Log',
    description: 'Bug reports, code snippets, and dev notes',
    icon: 'SourceCode',
    tags: ['dev', 'engineering'],
    content: `# Dev Log

**Date:** 
**Project:** 
**Branch / PR:** 

---

## Summary

> [!abstract] What I worked on
> Brief description of the feature, fix, or investigation.

---

## Problem

### Description

### Steps to Reproduce

1. 
2. 
3. 

### Expected vs Actual

- **Expected:** 
- **Actual:** 

---

> [!bug]- Error / Stack Trace
> 
\`\`\`
paste error here
\`\`\`

---

## Investigation

### Findings

- 

### Relevant Code

\`\`\`typescript
// paste relevant code snippet
\`\`\`

---

## Solution

### Approach

> [!tip] Why this approach?
> Explain the reasoning or trade-offs.

### Changes Made

- [ ] 
- [ ] 
- [ ] 

### Code After Fix

\`\`\`typescript
// paste updated code
\`\`\`

---

> [!important]- Breaking Changes
> Note anything that could affect other parts of the codebase.
> 
> - 

---

## Follow-up

- [ ] Write tests
- [ ] Update docs
- [ ] Open PR
`,
  },
  {
    id: 'quick-note',
    name: 'Quick Note',
    description: 'Simple blank note for fast capture',
    icon: 'File',
    tags: [],
    content: `# 

`,
  },
]
