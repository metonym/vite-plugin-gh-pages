import { writeFileSync } from "fs";
import { join } from "path";
import ghPages from "gh-pages";
import type { Plugin } from "vite";
import type { PublishOptions } from "gh-pages";

type PluginGhPages = (config: PublishOptions) => Plugin;

export const pluginGhPages: PluginGhPages = (options = {}) => {
  let outDir = "";

  return {
    name: "vite:gh-pages",
    apply: "build",
    configResolved(resolvedConfig) {
      outDir = resolvedConfig.build.outDir;
    },
    closeBundle() {
      writeFileSync(join(outDir, ".nojekyll"), "");

      ghPages.publish(
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
