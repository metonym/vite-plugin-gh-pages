import path from "node:path";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getPackageName } from "../src/get-package-name";

describe("get-package-name", () => {
  const mockCwd = vi.spyOn(process, "cwd");

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("no package.json", () => {
    mockCwd.mockReturnValue("/");
    expect(getPackageName()).toBeUndefined();
  });

  test("valid package.json without name", () => {
    mockCwd.mockReturnValue(path.join(process.cwd(), "tests"));
    expect(getPackageName()).toBeUndefined();
  });

  test("valid package.json", () => {
    expect(getPackageName()).toBeTruthy();
  });
});
