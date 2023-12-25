import { describe, expect, test, vi } from "vitest";
import { getPackageName } from "../src/get-package-name";

describe("get-package-name", () => {
  test("no package.json", () => {
    const mockCwd = vi.spyOn(process, "cwd");
    mockCwd.mockReturnValue("/");

    expect(getPackageName()).toBeUndefined();
  });

  test("valid package.json without name", () => {
    const mockCwd = vi.spyOn(process, "cwd");
    mockCwd.mockReturnValue("tests");

    expect(getPackageName()).toBeUndefined();
  });

  test("valid package.json", () => {
    const mockCwd = vi.spyOn(process, "cwd");
    mockCwd.mockReturnValue(".");

    expect(getPackageName()).toBeTruthy();
  });
});
