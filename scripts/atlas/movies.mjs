import { characters } from "./movies/characters.mjs";
import { craft } from "./movies/craft.mjs";
import { franchises } from "./movies/franchises.mjs";
import { genres } from "./movies/genres.mjs";
import { movieNight } from "./movies/movie-night.mjs";
import { stars } from "./movies/stars.mjs";

// Answers within each prompt are ordered from most to least commonly named.
// The generator assigns the crowd-share profile by that order.
export const movies = {
  Genres: genres,
  Characters: characters,
  Stars: stars,
  Franchises: franchises,
  Craft: craft,
  "Movie Night": movieNight,
};
