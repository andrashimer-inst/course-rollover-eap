# InstUI site docs (local copy)

Plain-text copy of the documentation on https://instructure.design/, downloaded on 2026-10-14 from
https://instructure.design/markdowns/documentation.zip (the site's own download for AI tools).
One markdown file per component and per guide. `index.md` lists them all with a one-line summary.

- The site documents InstUI **11.7.9**. This repo is pinned to **11.7.8**, because 11.7.9 has a broken
  package on npm. Props and tokens are almost always the same; if something fails to compile, check
  the installed package types.
- Don't edit these files. To refresh them, download the zip again and replace the folder.
- Start with `index.md`, then open the component or guide you need.

- **Mostly legacy.** This site documents the legacy components and the 11.7.9 release. For anything about
  look, variants, or usage, Figma wins (`docs/components.md`). For what exists in the installed package and
  which parts are legacy, see `docs/compare.md`.
