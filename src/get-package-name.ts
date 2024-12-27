import fs from "node:fs";
import path from "node:path";

export const getPackageName = (): string | undefined => {
  try {
    const pkg_path = path.join(process.cwd(), "package.json");
    const content = fs.readFileSync(pkg_path, "utf-8");
    const pkg = JSON.parse(content);

    if (!pkg?.name || typeof pkg.name !== "string") {
      return undefined;
    }

    return pkg.name;
  } catch (error) {
    // Handle file reading and JSON parsing errors.
    return undefined;
  }
};
