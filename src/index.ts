import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import gp from "gh-pages";
import type { Plugin } from "vite";
import type { PublishOptions, publish } from "gh-pages";

interface GhPagesOptions extends PublishOptions {
  onPublish?: (publishOptions: PublishOptions & { outDir: string }) => void;
  onError?: Parameters<typeof publish>[2];
}

const getPackageName = (): undefined | string => {
  const pkg_path = join(process.cwd(), "package.json");

  if (existsSync(pkg_path)) {
    const pkg = JSON.parse(readFileSync(pkg_path, "utf-8"));
    return pkg?.name ?? undefined;
  } else {
    return undefined;
  }
};

export const ghPages = (options?: GhPagesOptions): Plugin => {
  let outDir = "";

  const onError: GhPagesOptions["onError"] =
    options?.onError ??
    ((error) => {
      console.log(error);
    });

  const onPublish: GhPagesOptions["onPublish"] =
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
    closeBundle() {
      writeFileSync(join(outDir, ".nojekyll"), "");

      const gpOptions = {
        dotfiles: true,
        branch: "gh-pages",
        ...options,
      };

      gp.publish(outDir, gpOptions, (error) => {
        if (error) return onError(error);
        onPublish({ ...gpOptions, outDir });
      });
    },
  };
};
