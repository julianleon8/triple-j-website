# Claude Code Instructions — Triple J Website

## Memory Architecture

This project uses a two-brain memory system. At the start of every session, load context from both sources before doing any work.

### 1. Obsidian Vault (Working Memory)
Vault name: `Triple J Website`

Read these notes at session start:
```
obsidian read file="Project Context" vault="Triple J Website"
obsidian read file="Decisions" vault="Triple J Website"
obsidian read file="Session Notes" vault="Triple J Website"
```

At session end (or when significant work is done), append a summary to Session Notes and update Project Context / Decisions as needed.

### 2. NotebookLM (Document Memory)
Notebook ID: `triple-j-website`
URL: `https://notebooklm.google.com/notebook/f4aaf762-3ede-45b9-a1ad-b9d8a6319207`

Query when you need source-grounded answers from uploaded project documents:
```
cd ~/.claude/skills/notebooklm && python scripts/run.py ask_question.py --question "..." --notebook-id triple-j-website
```

Only query NotebookLM when the user has uploaded relevant docs. If the notebook is empty, skip and rely on Obsidian + conversation context.

## Session Workflow

1. **Start** — Read Obsidian notes (Project Context, Decisions, Session Notes)
2. **During** — Query NotebookLM for doc-grounded specifics when needed
3. **End** — Write session summary back to Obsidian (Session Notes), update Project Context or Decisions if anything changed

## Project Folder
`~/Desktop/Triple J Project` — central drop for assets, files, and references

## Key Files in Vault
- `Project Context.md` — goals, stack, people, overview
- `Decisions.md` — log of decisions and reasons
- `Session Notes.md` — end-of-session summaries, most recent at top
