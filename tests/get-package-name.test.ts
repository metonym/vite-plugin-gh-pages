import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { getPackageName } from "../src/get-package-name";

vi.mock("node:fs");
vi.mock("node:path");

describe("getPackageName", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test("returns undefined when package.json does not exist", () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(false);

    expect(getPackageName()).toBeUndefined();
  });

  test("returns undefined when package.json exists but has no name", () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    vi.spyOn(fs, "readFileSync").mockReturnValue(JSON.stringify({}));
    vi.spyOn(path, "resolve").mockReturnValue("/fake/path/package.json");

    expect(getPackageName()).toBeUndefined();
  });

  test("returns package name when package.json exists and has name", () => {
    const mockPackage = { name: "test-package" };
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    vi.spyOn(fs, "readFileSync").mockReturnValue(JSON.stringify(mockPackage));
    vi.spyOn(path, "resolve").mockReturnValue("/fake/path/package.json");

    expect(getPackageName()).toBe("test-package");
  });

  test("returns undefined when package.json contains invalid JSON", () => {
    vi.spyOn(fs, "readFileSync").mockReturnValue("{ invalid json }");
    vi.spyOn(path, "join").mockReturnValue("/fake/path/package.json");

    expect(getPackageName()).toBeUndefined();
  });
});
