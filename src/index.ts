import { writeFileSync } from "fs";
import { join } from "path";
import gp from "gh-pages";
import type { Plugin } from "vite";
import type { PublishOptions, publish } from "gh-pages";

interface GhPagesOptions extends PublishOptions {
  onPublish?: () => void;
  onError?: Parameters<typeof publish>[2];
}

export const ghPages = (options?: GhPagesOptions): Plugin => {
  let outDir = "";

  return {
    name: "vite:gh-pages",
    apply: "build",
    configResolved(resolvedConfig) {
      outDir = resolvedConfig.build.outDir;
    },
    closeBundle() {
      writeFileSync(join(outDir, ".nojekyll"), "");
      gp.publish(
        outDir,
        {
          dotfiles: true,
          ...options,
        },
        (error) => {
          if (error) {
            options?.onError?.(error);
            console.log(error);
            return;
          }
          options?.onPublish?.();
          console.log("Published.");
        }
      );
    },
  };
};
