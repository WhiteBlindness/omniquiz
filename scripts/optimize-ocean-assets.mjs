import { access, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const oceanDirectory = path.join(projectRoot, "public", "ocean");
const assets = ["bg-sky", "bg-top", "bg-mid", "bg-trench"];

const optimizeAsset = async (name) => {
  const source = path.join(oceanDirectory, `${name}.png`);
  const destination = path.join(oceanDirectory, `${name}.webp`);
  await access(source);
  await sharp(source)
    .webp({ quality: 84, alphaQuality: 100, smartSubsample: true, effort: 6 })
    .toFile(destination);

  const [before, after] = await Promise.all([stat(source), stat(destination)]);
  return Object.freeze({
    name,
    before: before.size,
    after: after.size,
    reduction: Math.round((1 - after.size / before.size) * 100),
  });
};

const results = await Promise.all(assets.map(optimizeAsset));
for (const result of results) {
  console.log(
    `${result.name}: ${result.before} -> ${result.after} bytes (${result.reduction}% smaller)`,
  );
}

const panoramaSource = path.join(oceanDirectory, "rov-mission-panorama-source.png");
const panoramaDestination = path.join(oceanDirectory, "rov-mission-panorama.webp");
await sharp(panoramaSource)
  .webp({ quality: 88, alphaQuality: 100, smartSubsample: true, effort: 6 })
  .toFile(panoramaDestination);

const uiDirectory = path.join(projectRoot, "public", "ui");
const framesSource = path.join(uiDirectory, "mission-frames-transparent.png");
const frameMetadata = await sharp(framesSource).metadata();
if (!frameMetadata.width || !frameMetadata.height) {
  throw new Error("The mission frame atlas has no readable dimensions.");
}

const atlasSplit = Math.floor(frameMetadata.height * 0.62);
const frameRegions = Object.freeze([
  Object.freeze({
    name: "prompt-hull",
    top: 0,
    height: atlasSplit,
  }),
  Object.freeze({
    name: "answer-hull",
    top: atlasSplit,
    height: frameMetadata.height - atlasSplit,
  }),
]);

for (const frame of frameRegions) {
  const region = await sharp(framesSource)
    .extract({ left: 0, top: frame.top, width: frameMetadata.width, height: frame.height })
    .png()
    .toBuffer();
  await sharp(region)
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ lossless: true, alphaQuality: 100, effort: 6 })
    .toFile(path.join(uiDirectory, `${frame.name}.webp`));
}

const generatedAssets = await Promise.all([
  stat(panoramaDestination),
  ...frameRegions.map((frame) => stat(path.join(uiDirectory, `${frame.name}.webp`))),
]);
console.log(
  `mission assets: ${generatedAssets.map((asset) => asset.size).join(", ")} bytes`,
);
