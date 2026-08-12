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
});
