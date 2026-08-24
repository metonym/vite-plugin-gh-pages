import { beforeEach, describe, expect, test, mock, spyOn } from "bun:test";
import type { PublishOptions } from "gh-pages";
import gp from "gh-pages";
import type { ConfigEnv, ResolvedConfig, UserConfig } from "vite";
import * as getPackageNameModule from "../src/get-package-name";
import { ghPages } from "../src/index";

type PublishCallback = (err: Error | null) => void;

function invokeHook<Args extends unknown[], Result>(
  hook: ((...args: Args) => Result) | { handler: (...args: Args) => Result } | undefined,
  ...args: Args
): Result | undefined {
  const fn = typeof hook === "function" ? hook : hook?.handler;
  if (!fn) return undefined;
  return (fn as (this: void, ...args: Args) => Result)(...args);
}

const mockPublish = mock(
  (_dir: string, _options: PublishOptions, callback?: PublishCallback) => {
    callback?.(null);
    return Promise.resolve();
  },
);

mock.module("gh-pages", () => ({
  default: {
    publish: mockPublish,
  },
}));

describe("ghPages plugin", () => {
  const mockConfigEnv: ConfigEnv = {
    command: "build",
    mode: "production",
  };

  beforeEach(() => {
    mockPublish.mockClear();
    mockPublish.mockImplementation(
      (_dir: string, _options: PublishOptions, callback?: PublishCallback) => {
        callback?.(null);
        return Promise.resolve();
      },
    );
  });

  test("should set default base URL if undefined", () => {
    const mockGetPackageName = spyOn(getPackageNameModule, "getPackageName").mockReturnValue("test-package");

    const plugin = ghPages();
    const config: UserConfig = {};

    invokeHook(plugin.config, config, mockConfigEnv);

    expect(config).toEqual({ base: "/test-package/" });
    expect(mockGetPackageName).toHaveBeenCalled();

    mockGetPackageName.mockRestore();
  });

  test("should not override existing base URL", () => {
    const mockGetPackageName = spyOn(getPackageNameModule, "getPackageName").mockReturnValue("test-package");

    const plugin = ghPages();
    const config: UserConfig = { base: "/custom-base/" };

    invokeHook(plugin.config, config, mockConfigEnv);

    expect(config).toEqual({ base: "/custom-base/" });
    expect(mockGetPackageName).not.toHaveBeenCalled();

    mockGetPackageName.mockRestore();
  });

  test("should store outDir from resolved config", () => {
    const plugin = ghPages();
    const config = { build: { outDir: "dist" } } as ResolvedConfig;

    invokeHook(plugin.configResolved, config);
    invokeHook(plugin.closeBundle);
    expect(gp.publish).toHaveBeenCalledWith(
      "dist",
      expect.any(Object),
      expect.any(Function)
    );
  });

  test("should call onBeforePublish with correct options", async () => {
    const onBeforePublish = mock();
    const plugin = ghPages({ onBeforePublish });
    const config = { build: { outDir: "dist" } } as ResolvedConfig;

    invokeHook(plugin.configResolved, config);
    await invokeHook(plugin.closeBundle);

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
    const plugin = ghPages({ onPublish });
    const config = { build: { outDir: "dist" } } as ResolvedConfig;

    invokeHook(plugin.configResolved, config);
    await invokeHook(plugin.closeBundle);

    expect(onPublish).toHaveBeenCalledWith({
      dotfiles: true,
      branch: "gh-pages",
      nojekyll: true,
      onPublish: expect.any(Function),
      outDir: "dist",
    });
  });

  test("should call onError when publish fails", async () => {
    mockPublish.mockImplementationOnce(
      (_dir: string, _options: PublishOptions, callback?: PublishCallback) => {
        callback?.(new Error("Publish failed"));
        return Promise.resolve();
      },
    );

    const onError = mock();
    const plugin = ghPages({ onError });
    const config = { build: { outDir: "dist" } } as ResolvedConfig;

    invokeHook(plugin.configResolved, config);
    await invokeHook(plugin.closeBundle);

    expect(onError).toHaveBeenCalledWith(expect.any(Error));
  });

  test("should use default error handler when onError not provided", async () => {
    const originalConsoleLog = console.log;
    const logCalls: unknown[][] = [];
    console.log = (...args: unknown[]) => logCalls.push(args);

    mockPublish.mockImplementationOnce(
      (_dir: string, _options: PublishOptions, callback?: PublishCallback) => {
        callback?.(new Error("Publish failed"));
        return Promise.resolve();
      },
    );

    const plugin = ghPages();
    const config = { build: { outDir: "dist" } } as ResolvedConfig;

    invokeHook(plugin.configResolved, config);
    await invokeHook(plugin.closeBundle);

    console.log = originalConsoleLog;

    expect(logCalls.length).toBe(1);
    expect(logCalls[0][0]).toBeInstanceOf(Error);
  });

  test("should merge custom options with defaults", async () => {
    const customOptions = {
      branch: "custom-branch",
      message: "Custom commit message",
    };

    const plugin = ghPages(customOptions);
    const config = { build: { outDir: "dist" } } as ResolvedConfig;

    invokeHook(plugin.configResolved, config);
    await invokeHook(plugin.closeBundle);

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
