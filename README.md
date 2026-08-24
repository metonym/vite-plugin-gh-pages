# vite-plugin-gh-pages

Vite plugin that publishes your build to GitHub Pages via [gh-pages](https://github.com/tschaub/gh-pages) when you run `vite build`.

Dotfiles are included. A `.nojekyll` file is written so GitHub does not run Jekyll on the site. Any `gh-pages` option can be passed through.

## Installation

```bash
npm i -D vite-plugin-gh-pages
pnpm i -D vite-plugin-gh-pages
bun i -D vite-plugin-gh-pages
yarn add -D vite-plugin-gh-pages
```

## Usage

GitHub Pages serves the site at `https://<user>.github.io/<repo>/`, so Vite needs a matching [public base path](https://vitejs.dev/guide/build.html#public-base-path). For a repo named `repo-name`, that is `/repo-name/`.

```js
// vite.config.js
import { ghPages } from "vite-plugin-gh-pages";

/** @type {import('vite').UserConfig} */
export default {
  base: "/repo-name/",
  plugins: [ghPages()],
};
```

If you omit `base`, the plugin reads `package.json#name` and sets `base` to `/<name>/`.

```js
// package.json
{
  "name": "repo-name",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  }
}
```

## Options

```js
ghPages({
  branch: "docs",
  message: "Custom deploy message",
});
```

<details><summary>API</summary>

```ts
interface GhPagesOptions {
  /**
   * Branch to push to.
   * @default "gh-pages"
   */
  branch?: string;

  /**
   * Folder on the publish branch.
   * @default "."
   */
  dest?: string;

  /**
   * Add files without removing existing ones.
   * @default false
   */
  add?: boolean;

  /**
   * Called before `git add`.
   * @default null
   */
  beforeAdd?: null | Function;

  /**
   * Include files that start with `.`. Needed for `.nojekyll`.
   * @default true
   */
  dotfiles?: boolean;

  /**
   * Path to the Git executable.
   * @default "git"
   */
  git?: string;

  /**
   * Commit message.
   * @default "Updates"
   */
  message?: string;

  /**
   * Use `remove` instead.
   * @deprecate
   */
  only?: string;

  /**
   * Push the branch to the remote. Set to `false` to commit only.
   * @default true
   */
  push?: boolean;

  /**
   * Force a new commit with no parent history.
   * @default true
   */
  history?: boolean;

  /**
   * Remote to push to.
   * @default "origin"
   */
  remote?: string;

  /**
   * Remove files matching this pattern.
   * @default "."
   */
  remove?: string;

  /**
   * Remote origin URL.
   * @default [current remote URL]
   */
  repo?: string;

  /**
   * Hide repository URLs and similar details in errors.
   * @default false
   */
  silent?: boolean;

  /**
   * Files to publish.
   * @default "**\/*"
   */
  src?: string | string[];

  /**
   * Create this tag after committing on the target branch.
   * @default ""
   */
  tag?: string;

  /**
   * Git user. Required for Git to commit.
   * @default null
   */
  user?: null | {
    name: string;
    email: string;
  };

  /**
   * Runs before publish. `outDir` is Vite's build output directory.
   */
  onBeforePublish?: (publishOptions: CallbackPublishOptions) => void;

  /**
   * Runs after a successful publish.
   */
  onPublish?: (publishOptions: CallbackPublishOptions) => void;

  /**
   * Runs if `gh-pages` fails. Default logs the error.
   */
  onError?: Parameters<typeof publish>[2];
}
```

</details>

## Hooks

### `onBeforePublish`

Runs before publish. `outDir` is Vite's build output directory.

```js
import fs from "node:fs";
import path from "node:path";
import { ghPages } from "vite-plugin-gh-pages";

/** @type {import('vite').UserConfig} */
export default {
  plugins: [
    ghPages({
      /** @type {options: GhPagesOptions & { outDir: string } => void} */
      onBeforePublish: (options) => {
        const CNAME = path.join(options.outDir, "CNAME");
        fs.writeFileSync(CNAME, "example.com");
      },
    }),
  ],
};
```

### `onPublish`

Runs after a successful publish.

```js
ghPages({
  /** @type {options: GhPagesOptions & { outDir: string } => void} */
  onPublish: (options) => {
    console.log(`Published to ${options.branch}`);
  },
});
```

### `onError`

Runs if `gh-pages` fails. Default logs the error.

```js
ghPages({
  /** @type {(error: any) => void} **/
  onError: (error) => {
    console.error("Publish failed:", error);
    process.exit(1);
  },
});
```

## [Changelog](CHANGELOG.md)

## License

[MIT](LICENSE)
