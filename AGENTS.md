# Answer Cut Lab maintenance

An offline source-versus-edit workbench for shortening an interview answer while keeping useful follow-up detail.

- Run by opening index.html directly. No server, installation or build step.
- Plain browser JavaScript and CSS. core.js also exposes CommonJS for `node --test tests.cjs`.
- Preserve direct file:// use. Keep runtime files flat; do not add remote fonts, libraries, analytics, storage writes or AI services.
- core.js owns file validation and measurements; app.js owns DOM behavior. Treat imported text as text, never HTML.
- Examples must be labeled fictional. Numeric differences are prompts for review, never factual validation or a score.
- Keep original, edited answer and follow-up notes distinct. Invalid import must preserve the current draft.
- Verify by using the real file:// app: edit, park selected text, export, clear and reopen. Run the core tests after changes.
- Current scope: local editing and explicit file export only. No hosted deployment or CI is configured.
- README.md is the usage and limitations reference. Keep it aligned with observable behavior.
