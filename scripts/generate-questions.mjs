import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const OUTPUT_PATH = resolve(dirname(fileURLToPath(import.meta.url)), "../src/data/questions.json");
const CATEGORIES = ["General", "Science", "Geography", "History"];
const SHARE_PROFILES = [
  [34, 19, 14, 10, 8, 7.5, 6, 1.5],
  [31, 21, 16, 11, 8, 6.5, 5, 1.5],
  [38, 18, 12, 9, 8, 7, 6.5, 1.5],
  [30, 20, 15, 10, 9, 8, 6.5, 1.5],
];

const WORD_FORMS = new Map([
  ["baking", "bake"],
  ["checking", "check"],
  ["hiking", "hike"],
  ["listening", "listen"],
  ["moving", "move"],
  ["reading", "read"],
  ["scrolling", "scroll"],
  ["stretching", "stretch"],
  ["swimming", "swim"],
  ["tidying", "tidy"],
  ["writing", "write"],
]);

const normalize = (value) =>
  value.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]/g, "");

const aliasCandidates = (label) => {
  const withoutArticle = label.replace(/^(?:a|an|the)\s+/i, "");
  const withoutFillers = label
    .split(/\s+/)
    .filter((word) => !/^(?:a|an|the|their|my|of|on|to|for|up|outside)$/i.test(word))
    .join(" ");
  const words = withoutFillers.split(/\s+/).filter(Boolean);
  const firstWord = words[0]?.toLowerCase();
  const verb = firstWord ? WORD_FORMS.get(firstWord) : undefined;
  const verbPhrase = verb ? [verb, ...words.slice(1)].join(" ") : undefined;
  const conciseNoun = words.length > 1 ? words.at(-1) : undefined;

  return [withoutArticle, withoutFillers, verbPhrase, conciseNoun].filter(Boolean);
};

const aliasesFor = (label, reserved) => {
  const labelKey = normalize(label);
  const aliases = [];
  for (const candidate of aliasCandidates(label)) {
    const key = normalize(candidate);
    if (!key || key === labelKey || reserved.has(key)) continue;
    reserved.add(key);
    aliases.push(candidate);
  }

  if (aliases.length === 0) {
    aliases.push(`${label} choice`);
  }
  return aliases;
};

const question = (prompt, labels) => ({ prompt, labels });

const sources = {
  General: [
    question("Name a small ritual that makes a morning feel started.", ["Coffee", "A shower", "Stretching", "Checking the phone", "Breakfast", "A walk outside", "Music", "Journaling"]),
    question("What is something people keep in a junk drawer?", ["Batteries", "Rubber bands", "Takeout menus", "Loose keys", "A screwdriver", "Old receipts", "Buttons", "A tape measure"]),
    question("Name a food you reach for when you want comfort.", ["Mac and cheese", "Soup", "Pizza", "Ice cream", "Toast", "Chocolate", "Noodles", "Mashed potatoes"]),
    question("What belongs in a beach bag?", ["Sunscreen", "A towel", "Water", "Sunglasses", "A book", "Snacks", "Flip-flops", "A hat"]),
    question("Name something people do while waiting in a queue.", ["Scroll on the phone", "Chat", "People-watch", "Read", "Listen to music", "Check the time", "Look around", "Play a game"]),
    question("What is a smell that instantly feels nostalgic?", ["Fresh bread", "Rain", "Sunscreen", "Cut grass", "Grandparent's house", "Chlorine", "Wood smoke", "Crayons"]),
    question("Name a tiny luxury that improves an ordinary day.", ["A hot coffee", "Clean sheets", "A long bath", "A pastry", "Fresh flowers", "A quiet hour", "Good headphones", "A window seat"]),
    question("What could you find under a sofa?", ["Coins", "Dust", "A lost remote", "A sock", "Crumbs", "A toy", "A book", "A hair tie"]),
    question("Name a rainy-day reset.", ["A nap", "A movie", "Baking", "Reading", "A hot drink", "A long shower", "Tidying up", "Board games"]),
    question("What is something people collect?", ["Stamps", "Books", "Coins", "Postcards", "Vinyl records", "Magnets", "Sneakers", "Sea glass"]),
    question("What might a guest bring to a casual gathering?", ["Wine", "Dessert", "Flowers", "Chips", "A board game", "Fruit", "Bread", "A playlist"]),
    question("Name an item often found on a desk.", ["A notebook", "A pen", "A laptop", "A mug", "Sticky notes", "A lamp", "Headphones", "A plant"]),
    question("What is a sound people notice at night?", ["Rain", "Traffic", "A fan", "Crickets", "A dog barking", "Footsteps", "The refrigerator", "Wind"]),
    question("Name a way to celebrate good news.", ["Call a friend", "Go out for dinner", "Open champagne", "Post online", "Buy a treat", "Hug someone", "Take a trip", "Dance"]),
    question("What is something people do before bed?", ["Brush their teeth", "Read", "Set an alarm", "Check messages", "Wash their face", "Drink water", "Stretch", "Lock the door"]),
  ],
  Science: [
    question("Name something that glows in the dark.", ["Stars", "A firefly", "The moon", "Neon paint", "Lava", "A glow stick", "Deep-sea creatures", "Aurora"]),
    question("What might you see through a microscope?", ["Cells", "Bacteria", "Pollen", "A hair", "A drop of pond water", "Salt crystals", "Skin", "A leaf"]),
    question("Name a force you notice in daily life.", ["Gravity", "Friction", "Wind", "Magnetism", "Buoyancy", "Tension", "Air resistance", "Push"]),
    question("Name something that changes state.", ["Water", "Ice cream", "Wax", "Chocolate", "Metal", "Clouds", "Dry ice", "Butter"]),
    question("What might you find in a coral reef?", ["Parrotfish", "Sea anemones", "Clownfish", "Crabs", "Sea turtles", "Sponges", "Sharks", "Algae"]),
    question("Name a material that conducts heat.", ["Copper", "Aluminum", "Steel", "Water", "Silver", "Iron", "Brass", "Graphite"]),
    question("What might a field scientist carry?", ["A notebook", "Sample jars", "A camera", "Binoculars", "A GPS", "Gloves", "A first-aid kit", "A hand lens"]),
    question("Name something found in a garden ecosystem.", ["Worms", "Bees", "Soil", "Mushrooms", "Birds", "Roots", "Spiders", "Compost"]),
    question("What helps protect living things from the Sun?", ["Sunscreen", "Shade", "Melanin", "A hat", "Clouds", "Leaves", "Sunglasses", "The ozone layer"]),
    question("Name a source of renewable energy.", ["Sunlight", "Wind", "Moving water", "Geothermal heat", "Tides", "Biomass", "Ocean waves", "Solar panels"]),
    question("What might you measure in a laboratory?", ["Temperature", "Mass", "pH", "Time", "Pressure", "Volume", "Light", "Distance"]),
    question("Name something that survives an extreme environment.", ["Tardigrades", "Cacti", "Deep-sea bacteria", "Penguins", "Camel plants", "Fungi", "Brine shrimp", "Archaea"]),
    question("What can make the sky change color?", ["Sunset", "Clouds", "Dust", "Aurora", "Smoke", "Rain", "A rainbow", "Pollution"]),
    question("What does the human body do in response to exercise?", ["Sweat", "Breathe faster", "Heart beats faster", "Warm up", "Make more energy", "Use oxygen", "Release adrenaline", "Drink more water"]),
    question("Name a space object people recognize.", ["The Moon", "A comet", "Mars", "Saturn", "The Sun", "An asteroid", "A black hole", "A galaxy"]),
  ],
  Geography: [
    question("Name a place people go to escape hot weather.", ["The mountains", "The beach", "A forest", "An air-conditioned mall", "A lake", "The Arctic", "A swimming pool", "A cave"]),
    question("What landscape might you cross on a long train journey?", ["Fields", "Mountains", "Desert", "Forest", "Coastline", "Prairie", "Suburbs", "Tundra"]),
    question("Name something you might see at a harbor.", ["Boats", "Cranes", "Lighthouses", "Gulls", "Containers", "Ferries", "Ropes", "A fish market"]),
    question("What can make a city feel like a capital?", ["Government buildings", "A grand avenue", "Museums", "Embassies", "A palace", "Monuments", "Busy transit", "A national library"]),
    question("What kind of map might you keep?", ["A road map", "A subway map", "A hiking map", "A world map", "A treasure map", "A weather map", "A city map", "A star map"]),
    question("Where might you spend a rainy afternoon while traveling?", ["A museum", "A cafe", "A library", "A market", "A cinema", "A gallery", "A covered plaza", "A train station"]),
    question("Name a geographical feature you would photograph.", ["A waterfall", "A mountain", "A canyon", "A glacier", "A volcano", "A river", "A desert", "A coastline"]),
    question("What might you pack for a mountain trail?", ["Water", "A map", "A jacket", "Trail snacks", "A first-aid kit", "Hiking boots", "A headlamp", "Sunglasses"]),
    question("Name a place where you might hear many languages.", ["An airport", "A city market", "A university", "A train station", "A border town", "A hostel", "A port", "A festival"]),
    question("Name a landmark found beside water.", ["A lighthouse", "A pier", "A bridge", "A harbor wall", "A beach promenade", "A canal lock", "A ferry terminal", "A sea fort"]),
    question("What route might you take for a weekend away?", ["A coastal road", "A forest trail", "A rail line", "A mountain pass", "A river route", "A country lane", "A bike path", "A ferry crossing"]),
    question("Name a landscape shaped by ice.", ["A glacier", "A fjord", "A moraine", "An iceberg", "A U-shaped valley", "A frozen lake", "Permafrost", "A snowfield"]),
    question("Where might you watch the sunrise?", ["A hilltop", "A beach", "A rooftop", "A desert", "A harbor", "A lookout", "A train window", "A lake shore"]),
    question("Name a sign that you have crossed a border.", ["A checkpoint", "A welcome sign", "A new road marker", "A passport stamp", "A flag", "A change in language", "A customs booth", "A border fence"]),
    question("What might you find at a local market while traveling?", ["Spices", "Fruit", "Handicrafts", "Street food", "Flowers", "Textiles", "Fresh fish", "Postcards"]),
  ],
  History: [
    question("Name an object that belongs in a museum.", ["A sword", "A painting", "A fossil", "A letter", "A coin", "A statue", "A photograph", "A suit of armor"]),
    question("What can make an old city memorable?", ["A fortress", "Narrow streets", "A cathedral", "Ruins", "A market square", "Old bridges", "City walls", "A palace"]),
    question("Why do people write things down for future generations?", ["To record events", "To preserve stories", "To make laws", "To share knowledge", "To keep accounts", "To remember people", "To teach", "To leave a warning"]),
    question("What might an explorer pack?", ["A compass", "A map", "Rope", "Food", "A journal", "Warm clothing", "A camera", "A lantern"]),
    question("Name a symbol of a revolution.", ["A flag", "A raised fist", "A barricade", "A pamphlet", "A torch", "A broken chain", "A marching crowd", "A red star"]),
    question("What would you find in a medieval market?", ["Spices", "Cloth", "Bread", "Blacksmiths", "Horses", "Pottery", "Ale", "Travelers"]),
    question("Name a historical era you would visit.", ["Ancient Rome", "The Renaissance", "The Viking Age", "The Jazz Age", "The Victorian era", "The Space Race", "The Silk Road era", "The 1960s"]),
    question("What survives from an ancient civilization?", ["Ruins", "Pottery", "Writing", "Roads", "Myths", "Tools", "Jewelry", "Buildings"]),
    question("Name a monument people visit to remember history.", ["A memorial", "A statue", "A battlefield", "A tomb", "A monument arch", "A museum", "A historic house", "A wall"]),
    question("What might appear in a family archive?", ["Photographs", "Letters", "Birth records", "A diary", "A recipe", "Postcards", "A military medal", "Newspaper clippings"]),
    question("Name a job in a historic town.", ["A blacksmith", "A merchant", "A printer", "A baker", "A guide", "A farmer", "A shipwright", "A scribe"]),
    question("Why might a kingdom be remembered?", ["Its rulers", "A great battle", "Its art", "Its inventions", "A law code", "Its buildings", "Its trade", "A rebellion"]),
    question("What might you see in a portrait from the early twentieth century?", ["Formal clothing", "A studio backdrop", "A hat", "A uniform", "A family group", "A serious pose", "A pocket watch", "A painted photograph"]),
    question("Name an object in a space-race exhibit.", ["A rocket", "A spacesuit", "A capsule", "A moon rock", "A mission patch", "A launch plan", "A satellite", "A control panel"]),
    question("Name an ingredient that might survive in an old recipe.", ["Salt", "Honey", "Onions", "Wheat", "Beans", "Apples", "Cinnamon", "Vinegar"]),
  ],
};

const insightFor = (label, index) => {
  const cues = [
    "The surface crowd reaches for this first.",
    "A familiar current carries this answer.",
    "This choice travels through the middle of the school.",
    "A measured answer with a clear signal.",
    "The atlas marks this as a rarer route.",
    "Only a few explorers sent this one down.",
    "A sly side channel in the crowd map.",
    "A tiny crew knew to look this deep.",
  ];
  return `${cues[index]} ${label} is logged in the atlas.`;
};

const buildQuestionBank = () =>
  CATEGORIES.flatMap((category) =>
    sources[category].map((source, index) => {
      const reserved = new Set(source.labels.map(normalize));
      const shares = SHARE_PROFILES[index % SHARE_PROFILES.length];
      return {
        id: `${category.toLowerCase()}-${String(index + 1).padStart(3, "0")}`,
        category,
        prompt: source.prompt,
        answers: source.labels.map((label, answerIndex) => ({
          label,
          aliases: aliasesFor(label, reserved),
          share: shares[answerIndex],
          insight: insightFor(label, answerIndex),
        })),
      };
    }),
  );

const validateQuestionBank = (records) => {
  if (!Array.isArray(records) || records.length < 30) {
    throw new Error("crowd atlas needs at least 30 prompts");
  }
  const ids = new Set();
  const prompts = new Set();
  for (const record of records) {
    if (ids.has(record.id)) throw new Error(`duplicate id ${record.id}`);
    ids.add(record.id);
    const promptKey = record.prompt.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (prompts.has(promptKey)) throw new Error(`duplicate prompt ${record.prompt}`);
    prompts.add(promptKey);
    if (record.answers.length < 8) throw new Error(`not enough answers for ${record.id}`);
    const share = record.answers.reduce((total, answer) => total + answer.share, 0);
    if (share !== 100) throw new Error(`shares for ${record.id} total ${share}`);
  }
  return records;
};

export const writeQuestionBank = (outputPath = OUTPUT_PATH) => {
  const records = validateQuestionBank(buildQuestionBank());
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(records, null, 2)}\n`, "utf8");
  return records;
};

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  writeQuestionBank();
  console.log(`Generated crowd atlas at ${OUTPUT_PATH}`);
}
