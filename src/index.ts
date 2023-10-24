import gp, { type PublishOptions, type publish } from "gh-pages";
import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";
import { getPackageName } from "./get-package-name";

type CallbackPublishOptions = PublishOptions & { outDir: string };

interface GhPagesOptions extends PublishOptions {
  onBeforePublish?: (publishOptions: CallbackPublishOptions) => void;
  onPublish?: (publishOptions: CallbackPublishOptions) => void;
  onError?: Parameters<typeof publish>[2];
}

export const ghPages = (options?: GhPagesOptions): Plugin => {
  let outDir = "";

  const onError = options?.onError ?? ((error) => console.log(error));

  const onPublish =
    options?.onPublish ??
    (({ outDir, branch }) => {
      console.log(`🎉 Published \`${outDir}\` to branch \`${branch}\`.`);
    });

  return {
    name: "vite:gh-pages",
    apply: "build",
    enforce: "post",
    config(config) {
      if (config.base === undefined) {
        config.base = "/" + getPackageName() + "/";
      }
    },
    configResolved(resolvedConfig) {
      outDir = resolvedConfig.build.outDir;
    },
    async closeBundle() {
      fs.writeFileSync(path.join(outDir, ".nojekyll"), "");

      const gpOptions = {
        dotfiles: true,
        branch: "gh-pages",
        ...options,
      };

      options?.onBeforePublish?.({ ...gpOptions, outDir });

      await gp.publish(outDir, gpOptions, (error) => {
        if (error) return onError(error);
        onPublish({ ...gpOptions, outDir });
      });
    },
  };
};
