import { expect, test } from "vitest";
import * as API from "../src";

test("API", () => {
  expect(Object.keys(API)).toMatchInlineSnapshot(`
    [
      "ghPages",
    ]
  `);
});
