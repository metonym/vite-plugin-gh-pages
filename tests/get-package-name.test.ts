import { describe, expect, test } from "bun:test";
import fs from "node:fs";
import path from "node:path";

describe("getPackageName", () => {
  test("returns undefined when package.json does not exist", () => {
    const originalExistsSync = fs.existsSync;
    const originalJoin = path.join;
    
    fs.existsSync = () => false;
    path.join = () => "/fake/path/package.json";
    
    delete require.cache[require.resolve("../src/get-package-name")];
    const { getPackageName } = require("../src/get-package-name");
    
    const result = getPackageName();
    
    fs.existsSync = originalExistsSync;
    path.join = originalJoin;
    
    expect(result).toBeUndefined();
  });

  test("returns undefined when package.json exists but has no name", () => {
    const originalExistsSync = fs.existsSync;
    const originalReadFileSync = fs.readFileSync;
    const originalJoin = path.join;
    
    fs.existsSync = () => true;
    fs.readFileSync = () => JSON.stringify({});
    path.join = () => "/fake/path/package.json";
    
    delete require.cache[require.resolve("../src/get-package-name")];
    const { getPackageName } = require("../src/get-package-name");
    
    const result = getPackageName();
    
    fs.existsSync = originalExistsSync;
    fs.readFileSync = originalReadFileSync;
    path.join = originalJoin;
    
    expect(result).toBeUndefined();
  });

  test("returns package name when package.json exists and has name", () => {
    const mockPackage = { name: "test-package" };
    const originalExistsSync = fs.existsSync;
    const originalReadFileSync = fs.readFileSync;
    const originalJoin = path.join;
    
    fs.existsSync = () => true;
    fs.readFileSync = () => JSON.stringify(mockPackage);
    path.join = () => "/fake/path/package.json";
    
    delete require.cache[require.resolve("../src/get-package-name")];
    const { getPackageName } = require("../src/get-package-name");
    
    const result = getPackageName();
    
    fs.existsSync = originalExistsSync;
    fs.readFileSync = originalReadFileSync;
    path.join = originalJoin;
    
    expect(result).toBe("test-package");
  });

  test("returns undefined when package.json contains invalid JSON", () => {
    const originalExistsSync = fs.existsSync;
    const originalReadFileSync = fs.readFileSync;
    const originalJoin = path.join;
    
    fs.existsSync = () => true;
    fs.readFileSync = () => "{ invalid json }";
    path.join = () => "/fake/path/package.json";
    
    delete require.cache[require.resolve("../src/get-package-name")];
    const { getPackageName } = require("../src/get-package-name");
    
    const result = getPackageName();
    
    fs.existsSync = originalExistsSync;
    fs.readFileSync = originalReadFileSync;
    path.join = originalJoin;
    
    expect(result).toBeUndefined();
  });
});
