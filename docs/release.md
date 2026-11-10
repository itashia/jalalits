# Release preparation

1. Confirm each package name. After the first version exists on npm, configure npm Trusted Publishing for this repository and `.github/workflows/publish.yml` on every package, and explicitly allow direct `npm publish` for that publisher. npm does not allow configuring a Trusted Publisher before the package exists.
2. Review the Changesets release PR, package metadata, generated changelog, compatibility notes, and packed files.
3. Merge the version changes and run the **Publish packages** workflow manually from the protected default branch.
4. Verify npm package pages, provenance attestations, and install smoke tests after publication.

The workflow requests only `contents: read` and the short-lived `id-token: write` permission. It contains no npm token. npm CLI 11.5.1 or later is installed to support npm Trusted Publishing. The workflow is prepared but has not been run; the first publication must bootstrap each package before its Trusted Publisher can be configured. See [npm's Trusted Publishing requirements](https://docs.npmjs.com/trusted-publishers/).
