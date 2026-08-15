// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getDescentMotion, OceanBackdrop } from "./OceanBackdrop";

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt ?? ""} {...props} />
  ),
}));

describe("OceanBackdrop", () => {
  afterEach(cleanup);

  it("keeps deep raster layers out of the initial scene", () => {
    const { container } = render(<OceanBackdrop depthMetres={0} mode="daily" />);

    expect(container.querySelector(".mission-panorama")).toBeInTheDocument();
    expect(container.querySelector(".water-layer-mid")).not.toBeInTheDocument();
    expect(container.querySelector(".water-layer-trench")).not.toBeInTheDocument();
  });

  it("adds deeper layers only after the player reaches them", () => {
    const { container, rerender } = render(
      <OceanBackdrop depthMetres={1_500} mode="daily" />,
    );

    expect(container.querySelector(".water-layer-mid")).toBeInTheDocument();
    expect(container.querySelector(".water-layer-trench")).not.toBeInTheDocument();

    rerender(<OceanBackdrop depthMetres={4_500} mode="daily" />);
    expect(container.querySelector(".water-layer-trench")).toBeInTheDocument();
  });

  it("exposes an in-document depth scale and current depth marker", () => {
    render(<OceanBackdrop depthMetres={640} mode="unlimited" />);

    expect(screen.getByLabelText("Depth scale")).toBeInTheDocument();
    expect(screen.getByText("640m current depth")).toBeInTheDocument();
  });

  it("maps earned depth to the exact scaled camera event and full viewport cues", () => {
    const { container } = render(
      <OceanBackdrop
        depthMetres={600}
        mode="daily"
        descentMetres={600}
        descentEventKey="round-1"
      />,
    );
    const backdrop = container.querySelector<HTMLElement>(".ocean-backdrop");

    expect(backdrop).toHaveAttribute("data-descent", "active");
    expect(getDescentMotion(600)).toEqual({ shift: 231, duration: 1128, intensity: 0.556 });
    expect(backdrop?.style.getPropertyValue("--descent-shift")).toBe("231px");
    expect(backdrop?.style.getPropertyValue("--descent-duration")).toBe("1128ms");
    expect(backdrop?.style.getPropertyValue("--descent-intensity")).toBe("0.556");
    expect(container.querySelector(".ocean-world")).toHaveAttribute("data-descent", "active");
    expect(container.querySelector(".descent-streak-field")).toBeInTheDocument();
    expect(container.querySelector(".descent-velocity-field")).toBeInTheDocument();
    expect(container.querySelectorAll(".descent-velocity").length).toBeGreaterThanOrEqual(16);
    expect(container.querySelector(".descent-pressure-flash")).toBeInTheDocument();
    expect(container.querySelector(".depth-ruler")?.closest(".ocean-world")).toBeNull();
    expect(container.querySelector(".scanlines")?.closest(".ocean-world")).toBeNull();
  });

  it("clamps the motion range and exposes normalized intensity", () => {
    expect(getDescentMotion(100)).toEqual({ shift: 120, duration: 850, intensity: 0 });
    expect(getDescentMotion(1_000)).toEqual({ shift: 320, duration: 1350, intensity: 1 });
    expect(getDescentMotion(20_000)).toEqual({ shift: 320, duration: 1350, intensity: 1 });
  });

  it("does not expose a descent event for zero-depth feedback", () => {
    const { container } = render(
      <OceanBackdrop depthMetres={600} mode="daily" descentMetres={0} />,
    );
    const backdrop = container.querySelector<HTMLElement>(".ocean-backdrop");

    expect(backdrop).toHaveAttribute("data-descent", "idle");
    expect(backdrop?.style.getPropertyValue("--descent-shift")).toBe("");
    expect(container.querySelector(".ocean-world")).toHaveAttribute("data-descent", "idle");
  });
});
