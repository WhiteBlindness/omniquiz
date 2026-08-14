// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { OceanBackdrop } from "./OceanBackdrop";

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

  it("maps earned depth to a bounded camera event and streak cue", () => {
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
    expect(backdrop?.style.getPropertyValue("--descent-shift")).toBe("70px");
    expect(backdrop?.style.getPropertyValue("--descent-duration")).toBe("587ms");
    expect(container.querySelector(".ocean-world")).toHaveAttribute("data-descent", "active");
    expect(container.querySelector(".descent-streak-field")).toBeInTheDocument();
    expect(container.querySelector(".depth-ruler")?.closest(".ocean-world")).toBeNull();
    expect(container.querySelector(".scanlines")?.closest(".ocean-world")).toBeNull();
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
