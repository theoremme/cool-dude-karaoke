Release a new version of the Amped Electron app.

Steps:
1. Check that all changes are committed and pushed. If not, ask the user before proceeding.
2. Read the current version from package.json.
3. Bump the patch version (e.g., 1.5 -> 1.6). If the user specifies a version, use that instead.
4. Update the version in package.json.
5. Commit the version bump: "Bump version to vX.Y"
6. Create a git tag: vX.Y
7. Push the commit and tag to origin.
8. Tell the user the build is running and link to the GitHub Actions page: https://github.com/theoremme/cool-dude-karaoke/actions
9. Remind them that once the build completes, releases will be at: https://github.com/theoremme/cool-dude-karaoke/releases
