# vite-plugin-gh-pages

> Vite plugin for GitHub Pages.

This plugin uses [gh-pages](https://github.com/tschaub/gh-pages) to publish your app to GitHub Pages when running `vite build`.

**Steps**

1. Infer the publish directory from the `build.outDir` value
2. Infer the GitHub Pages destination URL from the `package.json#name` if `base` is not set
3. Create a `<outDir>/.nojekyll` file to opt-out of Jekyll mode
4. Use `gh-pages` to publish the `outDir` to GitHub Pages

## Installation

```bash
# Yarn
yarn add -D vite-plugin-gh-pages

# NPM
npm i -D vite-plugin-gh-pages

# pnpm
pnpm i -D vite-plugin-gh-pages
```

## Usage

Vite requires a [public base path](https://vitejs.dev/guide/build.html#public-base-path) for your app to work on GitHub Pages.

For example, if your repository name is "repo-name," `base` should be `/repo-name/`.

```js
// vite.config.js
import { defineConfig } from "vite";
import { ghPages } from "vite-plugin-gh-pages";

export default defineConfig({
  base: "/repo-name/",
  plugins: [ghPages()],
});
```

If no `base` value is provided, the plugin will attempt to infer the value using the value of `package.json#name`.

## Options

Pass additional options to `gh-pages`.

```js
ghPages({
  branch: "docs",
});
```

### Signature

```ts
interface GhPagesOptions {
  /**
   * Specify the branch to push to.
   * @default "gh-pages"
   */
  branch?: string;

  /**
   * Destination folder in the publish branch.
   * @default "."
   */
  dest?: string;

  /**
   * Add files, never remove existing ones.
   * @default false
   */
  add?: boolean;

  /**
   * Callback called before `git add`.
   * @default null;
   */
  beforeAdd?: null | Function;

  /**
   * `true` by default for `.nojekyll` to be included.
   * @default true
   */
  dotfiles?: boolean;

  /**
   * Path to your Git executable.
   * @default "git"
   */
  git?: string;

  /**
   * Commit message for all commits.
   * @default "Updates"
   */
  message?: string;

  /**
   * Use `remove` instead.
   * @deprecate
   */
  only?: string;

  /**
   * Push branch to remote.
   * Set to `false` to commit without pushing.
   * @default true
   */
  push?: boolean;

  /**
   * Force push new commit without parent history.
   * @default true
   */
  history?: boolean;

  /**
   * Name of the remote to push to.
   * @default "origin"
   */
  remote?: string;

  /**
   * Removes files that match the given pattern.
   * @default "."
   */
  remove?: string;

  /**
   * URL for the remote origin of the git repository.
   * @default [current remote URL]
   */
  repo?: string;

  /**
   * Avoid showing repository URLs or other information in errors.
   * @default false
   */
  silent?: boolean;

  /**
   * Select files to be published that match the given pattern.
   * @default "**\/*"
   */
  src?: string | string[];

  /**
   * Create a tag after committing changes on the target branch.
   * @default ""
   */
  tag?: string;

  /**
   * Git user metadata.
   * Required for Git to commit.
   * @default null
   */
  user?: null | {
    name: string;
    email: string;
  };
}
```

## `onBeforePublish` / `onPublish` / `onError` callbacks

### `onBeforePublish`

`onBeforePublish` is an optional callback invoked before publishing.

This is useful for writing additional files to the `outDir`.

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
        fs.writeFileSync(CNAME, "...");
      },
    }),
  ],
};
```

### `onPublish`

`onPublish` is invoked if `gh-pages` has successfully published the folder.

`onError` will be called if an error occurred.

```js
ghPages({
  /** @type {options: GhPagesOptions & { outDir: string } => void} */
  onPublish: (options) => {
    // ...
  },

  /** @type {(error: any) => void} **/
  onError: (error) => {
    // ...
  },
});
```

## [Changelog](CHANGELOG.md)

## License

[MIT](LICENSE)
