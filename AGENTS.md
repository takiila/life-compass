# Life Compass agent guide

- The project identity is `life-compass`. The `undo418` Manus Training Compass is
  legacy reference material, not the current repository.
- Before writing Expo code, read the exact SDK 57 documentation at
  https://docs.expo.dev/versions/v57.0.0/.
- The canonical AI-Memory project folder is normally
  `../AI-Memory/Projects/traning-compass/`. If that sibling path is unavailable,
  check `C:\soft\AI-Memory\Projects\traning-compass\`.
- At the start of work, read `PROJECT.md`, `CURRENT.md`, and `TODO.md` there.
  For UX or real-use work also read `JOURNEYS.md` and `FEEDBACK.md`; for migration
  work read `FEATURES.md`; for feature changes read `PROVENANCE.md` and
  `DECISIONS.md`.
- When current code or test evidence conflicts with AI-Memory, prefer the primary
  evidence and reconcile AI-Memory at the end of the work.
- Never commit secrets, populated environment files, credentials, health data,
  device data, local databases, or user backup files.
- When Fable 5.1, Arena, or another external AI is used for review, first read
  `../AI-Memory/Knowledge/外部AIレビュー運用.md` (or the same file under
  `C:\soft\AI-Memory\Knowledge\`). Never send AI-Memory itself or private user
  data to the external AI; build a public-safe review packet from public source and
  generalized requirements only.
- External AI findings are proposals. Codex owns ACCEPT / MODIFY / REJECT decisions,
  implementation, tests, diff review, and any follow-up review.
- After a meaningful external-AI or specification-change cycle, reconcile the
  resulting current facts into AI-Memory. Keep durable design in PROJECT/DECISIONS,
  unfinished accepted work in TODO, current evidence in CURRENT, user friction in
  FEEDBACK, feature state in PROVENANCE, acceptance in JOURNEYS, and migration state
  in FEATURES. Do not paste raw external-AI output into authoritative documents.
