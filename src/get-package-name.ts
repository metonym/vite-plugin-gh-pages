import fs from "node:fs";
import path from "node:path";

export const getPackageName = (): undefined | string => {
  const pkg_path = path.join(process.cwd(), "package.json");
  if (!fs.existsSync(pkg_path)) return;

  const pkg = JSON.parse(fs.readFileSync(pkg_path, "utf-8"));
  return pkg?.name ?? undefined;
};
