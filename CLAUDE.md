# AnyPress Blocks: agent guide

A WordPress plugin of interactive blocks, installed on every AnyPress store and free for any WordPress site. Each block lives in `blocks/<name>/` (`block.json`, `index.js` for the editor, `render.php`, `view.js` for the page, `style.css`, `editor.css`); `anypress-blocks.php` registers every folder. `tests/` holds the Playground check; `bin/build-zip.sh` builds the release zip.

## How blocks are built

- No build step: editor scripts are plain JavaScript on the `wp.*` globals, with an `index.asset.php` listing their dependencies. Front-end behaviour is a small `viewScriptModule` that loads only where the block is used.
- Blocks save their inner blocks only and render their wrapper in `render.php`, so the wrapper markup can change without "Invalid block" errors. Changing what `save()` returns needs a deprecation.
- Styles fall back gracefully: use the theme's presets (`--wp--preset--color--base`, spacing, radius, shadow) with plain fallbacks, so blocks look right on the AnyPress theme and on any other theme. Never hard-code a brand colour.
- Block names (`anypress/<name>`) and attribute names are stable: live sites store them.
- Keep the page cheap: no jQuery, no work on pages without the block, and respect `prefers-reduced-motion`.

## Building and testing

Node 22+: `cd tests && npm ci && npm run check`. It must pass before pushing; CI runs the same check plus `php -l` on PHP 7.4. Add a check to `tests/blocks-check.mjs` for every new block and every behaviour you add, clicked through in a real browser at desktop and phone width.

## Releasing

Bump `Version` and `ANYPRESS_BLOCKS_VERSION` in `anypress-blocks.php`, `Stable tag` in `readme.txt` and add a changelog entry, in the same PR as the change. After merging, run the **Release** workflow (`release.yml`, GitHub `actions_run_trigger`) with the version; it tags `v<version>` and attaches `anypress-blocks.zip` and `SHA256SUMS`. Stores get a new version only when `waas-provisioning-api/templates/anypress-store` pins it (version and checksum) and a new store template version is built, published and made production.

## Building for WordPress

Use the WordPress skills in `.claude/skills/` (list in its README): `wp-block-development` for blocks, `wp-interactivity-api` for front-end behaviour, `wp-plugin-development` for structure and security, `wp-playground` and `blueprint` for tests, `wp-plugin-directory-guidelines` before submitting to wordpress.org, `wp-performance` for speed.

## Rules for every change

- **Beads, every time.** Each piece of work gets a Beads issue before it starts (check for a duplicate first). Put the id in the branch, the PR and the status, and close the issue when the PR merges or the change is live. Run `bd` in the session doing the work; the SessionStart hook in `.claude/settings.json` loads the Dolt login, then `bd dolt push` syncs it. This repository's issues are in DoltHub `chowderr/waas_api` (ids `waas-api-*`; run `bd` from a waas-provisioning-api checkout).
- **Pull requests:** open them ready for review, not as drafts, so CI runs. Merge a PR yourself once CI is green and the work was asked for.
- **No "WPCS" wording.** The old platform is gone. Say "the AnyPress API" or "the API's key and secret login". Don't add the word anywhere.
- **Public docs are for users.** READMEs and `readme.txt` explain how to use the plugin. Internal notes (server and Coolify ids, Beads, deployment steps) go in the obsidian-vault repository under `1. Projects/WaaS/`. Never put how or why AnyPress started in public copy.
- **Verify before claiming.** Check npm, wordpress.org or the official docs before calling a version or spec "the latest", and check a fix on the running system before calling it fixed.
