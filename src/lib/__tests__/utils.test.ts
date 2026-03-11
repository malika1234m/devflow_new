import { describe, it, expect } from "vitest";
import { slugify, formatDate, getInitials, cn } from "@/lib/utils";

describe("slugify", () => {
  it("lowercases and replaces spaces with hyphens", () => {
    expect(slugify("My Workspace")).toBe("my-workspace");
  });

  it("removes special characters", () => {
    expect(slugify("Acme Corp!!! 2025")).toBe("acme-corp-2025");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("---hello---")).toBe("hello");
  });

  it("collapses multiple spaces into one hyphen", () => {
    expect(slugify("hello   world")).toBe("hello-world");
  });

  it("handles empty string", () => {
    expect(slugify("")).toBe("");
  });
});

describe("getInitials", () => {
  it("returns first two uppercase letters of each word", () => {
    expect(getInitials("John Doe")).toBe("JD");
  });

  it("returns first letter for a single word", () => {
    expect(getInitials("Alice")).toBe("A");
  });

  it("handles three-word names", () => {
    expect(getInitials("John Michael Doe")).toBe("JM");
  });
});

describe("formatDate", () => {
  it("formats a date object correctly", () => {
    const date = new Date("2025-01-15T00:00:00Z");
    const result = formatDate(date);
    expect(result).toContain("Jan");
    expect(result).toContain("15");
    expect(result).toContain("2025");
  });

  it("formats a date string correctly", () => {
    const result = formatDate("2025-06-01");
    expect(result).toContain("Jun");
    expect(result).toContain("2025");
  });
});

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "active")).toBe("base active");
  });

  it("resolves tailwind conflicts (last wins)", () => {
    const result = cn("px-2", "px-4");
    expect(result).toBe("px-4");
  });
});
