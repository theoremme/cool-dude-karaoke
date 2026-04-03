# Debug Folder Convention

All debug output for this project must use the `debug/` folder at the project root.

## Rules

- **Writing debug info**: When generating logs, snapshots, error dumps, or any diagnostic output, write files to `debug/`. Use descriptive filenames (e.g., `debug/youtube-api-response.json`, `debug/ipc-error.log`).
- **Reading debug info**: When investigating issues, check `debug/` first for existing diagnostic files before asking the user for details.
- **Do not** write debug files anywhere else in the project (not in `src/`, `dist/`, or the project root).
- **Do not** commit the `debug/` folder — it is gitignored.
- The `debug/` folder may contain files from previous sessions. Read them for context when relevant.

## Examples

| Scenario | File |
|---|---|
| Capture a raw YouTube API response | `debug/youtube-api-response.json` |
| Log an Electron IPC error | `debug/ipc-error.log` |
| Dump current app state | `debug/app-state.json` |
| Record webpack build output | `debug/webpack-build.log` |
