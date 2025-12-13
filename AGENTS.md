# Repository Guidelines

## Project Structure & Module Organization
- Source assets live at the repo root: `index.html`, `game.html`, `mode.html`, and their companion scripts (`game.js`, `mode.js`, `login.js`, `createUser.js`) form the user workflow, while `style.css` centralizes shared styling.
- Static media and animations are handled directly in the HTML/JS; no separate asset directories exist yet, so keep new images or sounds beside the referencing file or introduce a clearly named subfolder (e.g., `assets/`) and document it immediately.
- Persistent state is stored in the browser via `localStorage` under the `math_game_data` key, so updates should maintain the existing data schema with `users`, `archivedUsers`, and `currentUser` objects.

## Build, Test, and Development Commands
- There is no build toolchain: open the relevant HTML file in a browser (`open game.html` on macOS, or run `python3 -m http.server 8000` from the repo root and visit `http://localhost:8000/game.html`) to verify behavior.
- Use `python3 -m http.server 8000` (or `npx live-server .`) when testing DOM interactions, because the game relies on `fetch`-like timing and `localStorage` that are not available over `file://`.
- When editing multiple scripts, reload pages or clear `math_game_data` in the browser console to reset scores and current mode.

## Coding Style & Naming Conventions
- JavaScript files follow 4-space indentation, trailing semicolons, and descriptive `camelCase` for variables/functions; keep helper functions near the logic they support, as in `game.js`.
- File names use lowercase kebab-case (e.g., `create-user` would fit the existing pattern) and HTML/JS pairings keep the same base name for clarity (`mode.html` + `mode.js`).
- Prefer `const` for references that do not change and `let` for mutable state; avoid `var`. Keep comments concise and aligned with the block they describe (see the top-of-file doc comment in `game.js`).
- No linting tool is configured, so rely on consistent spacing and readability when extending the code.

## Testing Guidelines
- Automated tests are not present; rely on manual verification: navigate each mode via `mode.html`, submit answers on `game.html`, and confirm scoring/level updates match expectations.
- Run through edge cases stored in `localStorage` by manually editing the persisted JSON in the browser devtools or clearing the storage before retries.
- When adding new logic, document the verification steps in the pull request summary so reviewers can reproduce the scenario.

## Commit & Pull Request Guidelines
- Follow Conventional Commit syntax (e.g., `feat:`, `fix:`, `refactor:`, `docs:`) as shown in recent history; include an optional scope inside parentheses if the change touches a single file or subsystem (`fix(login.js): handle missing user`).
- Pull requests should describe the change, include testing steps (commands or manual instructions), and note any browser-specific behavior or setup. Attach screenshots only when the UI changes are significant and hard to picture in prose.
- Link related issues when available and mention any outstanding manual checks a reviewer should perform (e.g., resetting localStorage before testing).

## Security & Configuration Tips
- Keep secrets out of the repo; all state is client-side, so avoid committing API keys or credentials. If you introduce server-side tooling later, document how to protect `.env` files.
- When adjusting localStorage schema, include migration logic so existing players do not lose progress and note the change in the PR description.
