import { describe, expect, it } from "vitest";
import { assignPresetToPage, presetForPage, type LayoutPresetState } from "./layout-presets";

describe("catalogue layout preset assignments", () => {
  it("assigns a page exclusively to the edited preset", () => {
    const state: LayoutPresetState = {
      presets: [
        { id: "standard", name: "Standard", styles: {}, pageNumbers: [1, 2] },
        { id: "custom", name: "Custom", styles: {}, pageNumbers: [3] },
      ],
    };

    const result = assignPresetToPage(state, "custom", 2);

    expect(result.presets[0].pageNumbers).toEqual([1]);
    expect(result.presets[1].pageNumbers).toEqual([3, 2]);
    expect(presetForPage(result, 2)?.id).toBe("custom");
  });

  it("does not duplicate an existing assignment", () => {
    const state: LayoutPresetState = {
      presets: [{ id: "standard", name: "Standard", styles: {}, pageNumbers: [1] }],
    };

    expect(assignPresetToPage(state, "standard", 1).presets[0].pageNumbers).toEqual([1]);
  });
});
