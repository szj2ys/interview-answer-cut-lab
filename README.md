# Answer Cut Lab

An offline editing workbench for an English interview answer that is too long. Keep the full source, make a shorter version, and move useful details into a follow-up note. A digit-token comparison calls attention to numbers introduced during editing. You decide what is accurate and relevant.

## Use it

1. On this repository, choose **Code → Download ZIP** and extract the ZIP.
2. Open **index.html** from the extracted folder. Keep core.js, app.js and styles.css beside it.
3. Enter one real, non-confidential experience, or choose **Try a fictional example**.
4. Choose **Start a shorter copy**. Edit the copy while the original remains available.
5. Select a detail in the shorter answer and choose **Move selected text to follow-ups**.
6. Check the approximate word/time budget and any newly introduced numeric strings. Rehearse aloud; the tool does not measure your voice.
7. Use **Save practice file** to reopen the work later, or **Export Markdown** for a readable note. **Copy shorter answer** has a manual-copy fallback if the clipboard is unavailable.

No installation, server, account, microphone or API key is needed. The editor has no dependencies or build step. It runs directly from the downloaded folder; there is no hosted application or deployment.

## A practical example

The fictional example starts with a volunteer explaining a checklist revision. The shorter version retains the two-person trial and the observed count of 12 clarification requests, along with the missing before-count. It does not turn those observations into a claimed reduction.

Try adding “I reduced questions by 40%” to the shorter version. The editor flags **40%** because that numeric string is absent from the source. It cannot establish whether 40% is false: the user must consult their actual evidence. Removing a number, changing a unit, or claiming personal credit for team work can still change the meaning without producing a flag.

## Scope and limitations

- Counts and speaking-time estimates are approximate. The assumed pace is an editing aid, not a recommended rate or a measure of fluency. Pauses are not modeled.
- The comparison looks at exact digit-written numeric strings, including signs and percent symbols. Spelled-out numbers, units, causality, ownership and factual accuracy are not checked.
- A checked review box is a user note, not independent validation.
- No answer is generated or rewritten automatically. No AI, transcription, hiring prediction or language certification is provided.
- Bundled examples are fictional teaching material, not customer experience or hiring results.

## Privacy

Everything entered stays in the open tab. There are no uploads, analytics, external scripts or browser-storage writes. Closing or reloading clears the draft. Exported files contain your notes and are saved only when you choose; keep them private. Opening a valid practice file asks before replacing nonempty work, and an invalid file leaves the current draft intact. Clearing a nonempty draft also asks first.

The optional related-reading link opens a separate online page. It is not required for offline use.

## Why this project is distinct

This is a source-versus-edit workbench with a follow-up parking area and numeric-change review. It does not repeat the existing pair timer's turn scheduling, the quote checker's report-quotation validation, the repair workbook's static exercises, the evidence cards' prompt selection, or the claim map's evidence-basis form.

For broader preparation, see MakeInterview's [Guide to answering in English](https://makeinterview.com/en/blog/job-interview-in-english). This project is made by the MakeInterview team and works independently of its separate live voice-interview service, which is currently paused.

## Development and verification

The files are plain HTML, CSS and JavaScript. Open index.html directly to run the application.

Optional core tests require Node.js 18 or later, with no package installation:

~~~sh
node --test tests.cjs
~~~

The tests cover source preservation, numeric-token differences, selection movement, invalid imports, Unicode text, export fencing and independent draft state. To verify the browser workflow, use the actual downloaded folder: edit → numeric warning → park a selection → export → reopen. Also check invalid-file preservation, clear cancellation, clipboard fallback, narrow layout and absence of automatic HTTP requests.

Files:
- index.html — accessible form and practical prompts.
- core.js — measurements, file validation, selection movement and Markdown export.
- app.js — local editor, downloads and import.
- styles.css — responsive layout.
- tests.cjs — dependency-free core checks.
- AGENTS.md — maintenance boundaries and verification flow.
- LICENSE — MIT licence for the code and original teaching content.

No CI or deployment is configured. Repository publication is separate from any search-engine indexing or third-party endorsement.

