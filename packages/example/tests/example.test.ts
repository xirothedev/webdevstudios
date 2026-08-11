import { describe, expect, it } from "bun:test";

import { greet } from "../index";

describe("greet", () => {
  it("greets through the entry point", () => {
    expect(greet("world")).toBe("Hello, world!");
  });
});
