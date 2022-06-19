import { writeFileSync } from "fs";
import { join } from "path";
import gp from "gh-pages";
import type { Plugin } from "vite";
import type { PublishOptions } from "gh-pages";

export const ghPages = (options?: PublishOptions): Plugin => {
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
          if (error) return console.log(error);
          console.log("Published.");
        }
      );
    },
  };
};
