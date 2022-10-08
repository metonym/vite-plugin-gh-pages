import fs from "node:fs";
import path from "node:path";
import gp from "gh-pages";
import type { PublishOptions, publish } from "gh-pages";
import type { Plugin } from "vite";

type CallbackPublishOptions = PublishOptions & { outDir: string };

interface GhPagesOptions extends PublishOptions {
  onBeforePublish?: (publishOptions: CallbackPublishOptions) => void;
  onPublish?: (publishOptions: CallbackPublishOptions) => void;
  onError?: Parameters<typeof publish>[2];
}

const getPackageName = (): undefined | string => {
  const pkg_path = path.join(process.cwd(), "package.json");

  if (fs.existsSync(pkg_path)) return;

  const pkg = JSON.parse(fs.readFileSync(pkg_path, "utf-8"));
  return pkg?.name ?? undefined;
};

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
    closeBundle() {
      fs.writeFileSync(path.join(outDir, ".nojekyll"), "");

      const gpOptions = {
        dotfiles: true,
        branch: "gh-pages",
        ...options,
      };

      options?.onBeforePublish?.({ ...gpOptions, outDir });

      gp.publish(outDir, gpOptions, (error) => {
        if (error) return onError(error);
        onPublish({ ...gpOptions, outDir });
      });
    },
  };
};
