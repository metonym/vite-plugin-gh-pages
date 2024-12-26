import gp from "gh-pages";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getPackageName } from "../src/get-package-name";
import { ghPages } from "../src/index";

vi.mock("gh-pages", () => ({
  default: {
    publish: vi.fn(),
  },
}));

vi.mock("../src/get-package-name", () => ({
  getPackageName: vi.fn(() => "test-package"),
}));

// Stub Vite plugin return type since it's not intended as a public API.
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
  const mockConsoleLog = vi.spyOn(console, "log");

  const mockConfigEnv = {
    command: "build",
    mode: "production",
  } as const;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(gp.publish).mockImplementation((dir, options, callback) => {
      callback?.(null);
      return Promise.resolve();
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should set default base URL if undefined", () => {
    const plugin = ghPages();
    const config = {};

    if (typeof plugin.config === "function") {
      plugin.config(config, mockConfigEnv);
    }

    expect(config).toEqual({ base: "/test-package/" });
    expect(getPackageName).toHaveBeenCalled();
  });

  it("should not override existing base URL", () => {
    const plugin = ghPages();
    const config = { base: "/custom-base/" };

    if (typeof plugin.config === "function") {
      plugin.config(config, mockConfigEnv);
    }

    expect(config).toEqual({ base: "/custom-base/" });
    expect(getPackageName).not.toHaveBeenCalled();
  });

  it("should store outDir from resolved config", () => {
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

  it("should call onBeforePublish with correct options", async () => {
    const onBeforePublish = vi.fn();
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

  it("should call onPublish with correct options on success", async () => {
    const onPublish = vi.fn();
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

  it("should call onError when publish fails", async () => {
    // Mock publish to simulate an error
    vi.mocked(gp.publish).mockImplementationOnce((dir, options, callback) => {
      callback?.(new Error("Publish failed"));
      return Promise.resolve();
    });

    const onError = vi.fn();
    const plugin = ghPages({ onError }) as VitePlugin;
    const config = { build: { outDir: "dist" } };

    plugin.configResolved?.(config);
    await plugin.closeBundle?.();

    expect(onError).toHaveBeenCalledWith(expect.any(Error));
  });

  it("should use default error handler when onError not provided", async () => {
    vi.mocked(gp.publish).mockImplementationOnce((dir, options, callback) => {
      callback?.(new Error("Publish failed"));
      return Promise.resolve();
    });

    const plugin = ghPages() as VitePlugin;
    const config = { build: { outDir: "dist" } };

    plugin.configResolved?.(config);
    await plugin.closeBundle?.();

    expect(mockConsoleLog).toHaveBeenCalledWith(expect.any(Error));
  });

  it("should merge custom options with defaults", async () => {
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
