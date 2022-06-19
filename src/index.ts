import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import gp from "gh-pages";
import type { Plugin } from "vite";
import type { PublishOptions, publish } from "gh-pages";

interface GhPagesOptions extends PublishOptions {
  onPublish?: () => void;
  onError?: Parameters<typeof publish>[2];
}

const resolvePkgJson = (): null | { name?: string } => {
  const pkg_path = join(process.cwd(), "package.json");

  if (existsSync(pkg_path)) {
    return JSON.parse(readFileSync(pkg_path, "utf-8"));
  } else {
    return null;
  }
};

export const ghPages = (options?: GhPagesOptions): Plugin => {
  let outDir = "";

  return {
    name: "vite:gh-pages",
    apply: "build",
    enforce: "post",
    config(config) {
      if (config.base === undefined) {
        const pkg = resolvePkgJson();

        if (pkg?.name) {
          config.base = "/" + pkg.name + "/";
        }
      }
    },
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
