# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.1](https://github.com/metonym/vite-plugin-gh-pages/releases/tag/v0.4.1) - 2022-10-18

- `getPackageJson` should return `undefined` if `package.json` does not exist

## [0.4.0](https://github.com/metonym/vite-plugin-gh-pages/releases/tag/v0.4.0) - 2022-10-08

- Add `onBeforePublish` callback

## [0.3.0](https://github.com/metonym/vite-plugin-gh-pages/releases/tag/v0.3.0) - 2022-06-19

- Infer Vite `config.base` from the `package.json#name`
- Print the `outDir` and branch name in the default `onPublish` callback
- Set `enforce: "post"` to invoke plugin after vite build plugins
- `onPublish` / `onError` callbacks should override the default messages

## [0.2.0](https://github.com/metonym/vite-plugin-gh-pages/releases/tag/v0.2.0) - 2022-06-19

- Add optional `onPublish`, `onError` callbacks after `gh-pages` has been invoked
- Rename `vite` plugin to "vite:gh-pages" to follow the plugin naming convention

## [0.1.0](https://github.com/metonym/vite-plugin-gh-pages/releases/tag/v0.1.0) - 2022-02-06

- Initial release
