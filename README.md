# vite-plugin-gh-pages

> Vite plugin to publish your app to GitHub Pages.

This plugin uses [gh-pages](https://github.com/tschaub/gh-pages) to publish your app to GitHub Pages when running `vite build`.

## Features

- 🚀 Zero-config deployment to GitHub Pages
- 🎯 Automatic base URL configuration from package name
- ⚡️ Lifecycle hooks for custom deployment logic
- 📄 Preserves dotfiles and adds `.nojekyll` by default
- 🔄 Customizable branch and commit options

## Installation

```bash
# NPM
npm i -D vite-plugin-gh-pages

# pnpm
pnpm i -D vite-plugin-gh-pages

# Bun
bun i -D vite-plugin-gh-pages

# Yarn
yarn add -D vite-plugin-gh-pages
```

## Usage

Vite requires a [public base path](https://vitejs.dev/guide/build.html#public-base-path) for your app to work on GitHub Pages.

For example, if your repository name is "repo-name," `base` should be `/repo-name/`.

```js
// vite.config.js
import { ghPages } from "vite-plugin-gh-pages";

/** @type {import('vite').UserConfig} */
export default {
  base: "/repo-name/",
  plugins: [ghPages()],
};
```

If no value for `base` is specified, the plugin will attempt to infer the value using the value of `package.json#name`.

```js
// package.json
{
  "name": "repo-name", // `base` can be omitted if `name` is specified
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  }
}
```

## Options

Additional plugin options are passed to `gh-pages`. All options from the `gh-pages` package are supported, plus additional lifecycle hooks.

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

</details>

## Lifecycle Hooks

### `onBeforePublish`

Called before publishing to GitHub Pages. Useful for writing additional files to the `outDir`.

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

Called after successful deployment to GitHub Pages.

```js
ghPages({
  /** @type {options: GhPagesOptions & { outDir: string } => void} */
  onPublish: (options) => {
    console.log(`🎉 Successfully deployed to ${options.branch}!`);
  },
});
```

### `onError`

Called if a publishing error occurs.

```js
ghPages({
  /** @type {(error: any) => void} **/
  onError: (error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  },
});
```

## Examples

### Custom Branch and CNAME

```js
ghPages({
  branch: "production",
  onBeforePublish: ({ outDir }) => {
    fs.writeFileSync(path.join(outDir, "CNAME"), "mysite.com");
  },
});
```

### Deployment Progress Tracking

```js
ghPages({
  onBeforePublish: ({ outDir }) => {
    console.log(`📦 Starting deployment from ${outDir}...`);
  },
  onPublish: ({ branch }) => {
    console.log(`🎉 Successfully deployed to ${branch}!`);
  },
  onError: (error) => {
    console.error("❌ Deployment failed:", error);
  },
});
```

## [Changelog](CHANGELOG.md)

## License

[MIT](LICENSE)
