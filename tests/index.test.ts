import { afterEach, beforeEach, describe, expect, test, mock, spyOn } from "bun:test";
import gp from "gh-pages";
import * as getPackageNameModule from "../src/get-package-name";
import { ghPages } from "../src/index";

const mockPublish = mock(() => {});

mock.module("gh-pages", () => ({
  default: {
    publish: mockPublish,
  },
}));

// Vite's Plugin type is not part of this package's public API.
type VitePlugin = {
  name?: string;
  config: (
    config: Record<string, any>,
    env: {
      command: string;
      mode: string;
    }
  ) => void;
  configResolved?: (config: { build: { outDir: string } }) => void;
  closeBundle?: () => Promise<void> | void;
};

describe("ghPages plugin", () => {
  const mockConfigEnv = {
    command: "build",
    mode: "production",
  } as const;

  beforeEach(() => {
    mockPublish.mockClear();
    mockPublish.mockImplementation((dir: string, options: any, callback: any) => {
      callback?.(null);
      return Promise.resolve();
    });
  });

  test("should set default base URL if undefined", () => {
    const mockGetPackageName = spyOn(getPackageNameModule, "getPackageName").mockReturnValue("test-package");
    
    const plugin = ghPages();
    const config = {};

    if (typeof plugin.config === "function") {
      plugin.config(config, mockConfigEnv);
    }

    expect(config).toEqual({ base: "/test-package/" });
    expect(mockGetPackageName).toHaveBeenCalled();
    
    mockGetPackageName.mockRestore();
  });

  test("should not override existing base URL", () => {
    const mockGetPackageName = spyOn(getPackageNameModule, "getPackageName").mockReturnValue("test-package");
    
    const plugin = ghPages();
    const config = { base: "/custom-base/" };

    if (typeof plugin.config === "function") {
      plugin.config(config, mockConfigEnv);
    }

    expect(config).toEqual({ base: "/custom-base/" });
    expect(mockGetPackageName).not.toHaveBeenCalled();
    
    mockGetPackageName.mockRestore();
  });

  test("should store outDir from resolved config", () => {
    const plugin = ghPages() as VitePlugin;
    const config = { build: { outDir: "dist" } };

    plugin.configResolved?.(config);
    plugin.closeBundle?.();
    expect(gp.publish).toHaveBeenCalledWith(
      "dist",
      expect.any(Object),
      expect.any(Function)
    );
  });

  test("should call onBeforePublish with correct options", async () => {
    const onBeforePublish = mock();
    const plugin = ghPages({ onBeforePublish }) as VitePlugin;
    const config = { build: { outDir: "dist" } };

    plugin.configResolved?.(config);
    await plugin.closeBundle?.();

    expect(onBeforePublish).toHaveBeenCalledWith({
      dotfiles: true,
      branch: "gh-pages",
      nojekyll: true,
      onBeforePublish: expect.any(Function),
      outDir: "dist",
    });
  });

  test("should call onPublish with correct options on success", async () => {
    const onPublish = mock();
    const plugin = ghPages({ onPublish }) as VitePlugin;
    const config = { build: { outDir: "dist" } };

    plugin.configResolved?.(config);
    await plugin.closeBundle?.();

    expect(onPublish).toHaveBeenCalledWith({
      dotfiles: true,
      branch: "gh-pages",
      nojekyll: true,
      onPublish: expect.any(Function),
      outDir: "dist",
    });
  });

  test("should call onError when publish fails", async () => {
    mockPublish.mockImplementationOnce((dir: string, options: any, callback: any) => {
      callback?.(new Error("Publish failed"));
      return Promise.resolve();
    });

    const onError = mock();
    const plugin = ghPages({ onError }) as VitePlugin;
    const config = { build: { outDir: "dist" } };

    plugin.configResolved?.(config);
    await plugin.closeBundle?.();

    expect(onError).toHaveBeenCalledWith(expect.any(Error));
  });

  test("should use default error handler when onError not provided", async () => {
    const originalConsoleLog = console.log;
    const logCalls: any[] = [];
    console.log = (...args: any[]) => logCalls.push(args);

    mockPublish.mockImplementationOnce((dir: string, options: any, callback: any) => {
      callback?.(new Error("Publish failed"));
      return Promise.resolve();
    });

    const plugin = ghPages() as VitePlugin;
    const config = { build: { outDir: "dist" } };

    plugin.configResolved?.(config);
    await plugin.closeBundle?.();

    console.log = originalConsoleLog;

    expect(logCalls.length).toBe(1);
    expect(logCalls[0][0]).toBeInstanceOf(Error);
  });

  test("should merge custom options with defaults", async () => {
    const customOptions = {
      branch: "custom-branch",
      message: "Custom commit message",
    };

    const plugin = ghPages(customOptions) as VitePlugin;
    const config = { build: { outDir: "dist" } };

    plugin.configResolved?.(config);
    await plugin.closeBundle?.();

    expect(gp.publish).toHaveBeenCalledWith(
      "dist",
      expect.objectContaining({
        dotfiles: true,
        branch: "custom-branch",
        nojekyll: true,
        message: "Custom commit message",
      }),
      expect.any(Function)
    );
  });
});
