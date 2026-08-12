import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const OUTPUT_PATH = resolve(dirname(fileURLToPath(import.meta.url)), "../src/data/questions.json");
const EXPECTED_QUESTION_COUNT = 300;
const QUESTIONS_PER_CATEGORY = 75;
const CATEGORIES = ["General", "Science", "Geography", "History"];
const DIFFICULTIES = ["easy", "medium", "hard"];
const TIER_ORDER = ["plankton", "tooclever", "schooler", "rare", "deepcut", "krillion"];
const RARITY_RULES = Object.freeze({
  plankton: Object.freeze({ tier: "plankton", score: 10, depth: 0.08 }),
  tooclever: Object.freeze({ tier: "tooclever", score: 15, depth: 0.18 }),
  schooler: Object.freeze({ tier: "schooler", score: 30, depth: 0.36 }),
  rare: Object.freeze({ tier: "rare", score: 60, depth: 0.6 }),
  deepcut: Object.freeze({ tier: "deepcut", score: 85, depth: 0.82 }),
  krillion: Object.freeze({ tier: "krillion", score: 100, depth: 0.97 }),
});

const rows = (entries) => entries.map(([prompt, canonicalAnswer, acceptedAliases]) => ({
  prompt,
  canonicalAnswer,
  acceptedAliases,
}));

const factsByCategory = {
  General: rows([
    ["Which Brazilian metropolis is the country's largest city by population?", "São Paulo", ["Sao Paulo city", "Brazilian city of Sao Paulo"]],
    ["What is the largest ocean on Earth?", "Pacific Ocean", ["Pacific", "Pacific waters"]],
    ["How many squares are on a standard chessboard?", "64", ["sixty-four", "64 squares"]],
    ["Which three colors are the primary colors of light in an RGB display?", "red, green, and blue", ["RGB", "light primaries"]],
    ["Which language has the greatest number of native speakers?", "Mandarin Chinese", ["Mandarin", "Chinese language"]],
    ["Who painted the Mona Lisa?", "Leonardo da Vinci", ["Leonardo Vinci", "Da Vinci"]],
    ["Which musical instrument traditionally has 88 keys?", "piano", ["the piano", "pianoforte"]],
    ["What is the name of Japan's currency?", "Japanese yen", ["yen", "Japanese currency"]],
    ["Which insects are responsible for making honey?", "honey bees", ["bees", "Apis mellifera"]],
    ["What is the SI base unit of temperature?", "kelvin", ["K", "kelvin scale"]],
    ["How many rings appear on the Olympic flag?", "five", ["5", "five rings"]],
    ["Who wrote Pride and Prejudice?", "Jane Austen", ["Austen", "English novelist Jane Austen"]],
    ["How many days are in a leap year?", "366", ["three hundred sixty-six", "366 days"]],
    ["Which metal is liquid at ordinary room temperature?", "mercury", ["Hg", "quicksilver"]],
    ["Which board game features properties, railroads, and houses?", "Monopoly", ["the Monopoly game", "property trading game"]],
    ["What is the largest mammal living today?", "blue whale", ["whale", "blue whale species"]],
    ["How many planets are in the Solar System?", "eight", ["8", "eight planets"]],
    ["Which fairy-tale character leaves behind a glass slipper?", "Cinderella", ["Cinderella story", "Ella"]],
    ["What is the full name of the currency commonly called the pound in the United Kingdom?", "pound sterling", ["British pound", "pound"]],
    ["What geometric shape has three sides?", "triangle", ["triangular shape", "three-sided polygon"]],
    ["Which land animal is usually considered the fastest runner?", "cheetah", ["the cheetah", "Acinonyx jubatus"]],
    ["What is the first month of the Gregorian calendar?", "January", ["Jan", "first month"]],
    ["Which instrument measures atmospheric pressure?", "barometer", ["barometer instrument", "pressure gauge"]],
    ["Which composer wrote the Ninth Symphony?", "Ludwig van Beethoven", ["Beethoven", "Ludwig Beethoven"]],
    ["Which animal is traditionally called the ship of the desert?", "camel", ["dromedary", "camel animal"]],
    ["What form of writing used picture symbols in ancient Egypt?", "Egyptian hieroglyphs", ["hieroglyphs", "hieroglyphic writing"]],
    ["Which planet is the largest in our Solar System?", "Jupiter", ["the planet Jupiter", "Jupiter planet"]],
    ["Who is credited with inventing the World Wide Web?", "Tim Berners-Lee", ["Tim Berners Lee", "Berners-Lee"]],
    ["Which Greek goddess was associated with wisdom?", "Athena", ["Athena goddess", "Greek wisdom goddess"]],
    ["What unit is commonly used to measure the area of a room?", "square metre", ["square meter", "m²"]],
    ["Which sport is played at Wimbledon?", "tennis", ["the sport tennis", "lawn tennis"]],
    ["Which leaf is a national symbol on Canada's flag?", "Canadian maple leaf", ["maple leaf", "Canada maple leaf"]],
    ["What is the first element on the periodic table?", "hydrogen", ["H", "hydrogen element"]],
    ["Who wrote The Hobbit?", "J. R. R. Tolkien", ["JRR Tolkien", "Tolkien"]],
    ["Which brass instrument is played with a slide?", "trombone", ["the trombone", "slide brass instrument"]],
    ["Which ridged pasta is shaped like a short, wide tube?", "rigatoni", ["rigatoni pasta", "ridged tube pasta"]],
    ["What color results from mixing red and white paint?", "pink", ["pink color", "light red"]],
    ["Which country is strongly associated with the tango?", "Argentina", ["Argentine Republic", "tango country"]],
    ["What is the highest number on a standard six-sided die?", "six", ["6", "six spots"]],
    ["What is the Japanese art of folding paper called?", "origami", ["Japanese origami", "paper folding"]],
    ["Which mythical bird is said to rise from its ashes?", "phoenix", ["the phoenix", "firebird"]],
    ["What three-letter signal is internationally associated with distress?", "SOS", ["S.O.S.", "distress signal"]],
    ["What is the hardest naturally occurring mineral?", "diamond", ["diamond mineral", "hardest natural mineral"]],
    ["What collective noun is traditionally used for a group of owls?", "parliament", ["parliament of owls", "owl group"]],
    ["What is the fear of spiders called?", "arachnophobia", ["fear of spiders", "spider phobia"]],
    ["What was the name of the warrior class in feudal Japan?", "samurai", ["Japanese samurai", "warrior class"]],
    ["Who was the first human to orbit Earth?", "Yuri Gagarin", ["Gagarin", "Yuri Gagarin cosmonaut"]],
    ["What does the abbreviation CPU stand for?", "central processing unit", ["CPU", "processor"]],
    ["Which gas do plants absorb from the atmosphere for photosynthesis?", "carbon dioxide", ["CO2", "carbonic gas"]],
    ["What is the largest internal organ in the human body?", "liver", ["human liver", "hepatic organ"]],
    ["Who created Sherlock Holmes?", "Arthur Conan Doyle", ["Conan Doyle", "Arthur Doyle"]],
    ["Which Scandinavian country is especially known for its fjords?", "Norway", ["Kingdom of Norway", "Norwegian country"]],
    ["Which gemstone is the traditional birthstone for April?", "diamond gemstone", ["April diamond", "diamond birthstone"]],
    ["How many strings does a standard violin have?", "four", ["4", "four strings"]],
    ["What word describes a period of one hundred years?", "century", ["one hundred years", "100-year period"]],
    ["What traditional Japanese wrestling sport is performed in a circular ring?", "sumo wrestling", ["sumo", "Japanese wrestling"]],
    ["Who painted The Starry Night?", "Vincent van Gogh", ["Van Gogh", "Vincent Gogh"]],
    ["What is the metric distance equal to one thousand metres?", "kilometre", ["kilometer", "km"]],
    ["What food is made by fermenting milk with live cultures?", "yogurt", ["yoghurt", "fermented milk"]],
    ["Which ocean current helps warm western Europe?", "Gulf Stream", ["Gulf Stream current", "Atlantic warm current"]],
    ["What number is represented by the Roman numeral X?", "ten", ["10", "Roman X"]],
    ["What traditional Scottish garment is worn like a skirt?", "kilt", ["Scottish kilt", "Highland kilt"]],
    ["What fruit is the principal ingredient in guacamole?", "avocado", ["avocado fruit", "guacamole fruit"]],
    ["Which bird is famous for mimicking human speech?", "parrot", ["parrot bird", "talking parrot"]],
    ["Which award honors achievement in Broadway theatre?", "Tony Award", ["Tony", "Broadway award"]],
    ["What is the capital city of Australia?", "Canberra", ["Canberra city", "Australian capital"]],
    ["What is the world's smallest independent country by area?", "Vatican City", ["Vatican", "Vatican City State"]],
    ["Which metal is widely used for electrical wiring?", "copper", ["Cu", "copper metal"]],
    ["How many items are in a dozen?", "twelve", ["12", "a dozen"]],
    ["What is the art of beautiful decorative handwriting called?", "calligraphy", ["calligraphy writing", "decorative handwriting"]],
    ["Which reed instrument is a common member of a concert band?", "clarinet", ["the clarinet", "reed instrument"]],
    ["Which planet is nicknamed the Red Planet?", "Mars", ["Mars planet", "red planet"]],
    ["What material is the writing core of a modern pencil made from?", "graphite", ["graphite carbon", "pencil lead"]],
    ["What type of story usually ends with a moral?", "fable", ["a fable", "moral tale"]],
    ["What Spanish dance is known for stamping, clapping, and guitar music?", "flamenco", ["Spanish flamenco", "flamenco dance"]],
  ]),
  Science: rows([
    ["What organelle is often called the powerhouse of a cell?", "mitochondrion", ["mitochondria", "mitochondrion organelle"]],
    ["What SI unit measures force?", "newton", ["N", "newton unit"]],
    ["What is the chemical formula for water?", "H2O", ["water", "water molecule"]],
    ["Which planet is closest to the Sun?", "Mercury", ["Mercury planet", "first planet"]],
    ["Which gas makes up the largest portion of Earth's atmosphere?", "nitrogen", ["N2", "nitrogen gas"]],
    ["What shape does a DNA molecule famously have?", "double helix", ["DNA helix", "double-helical DNA"]],
    ["What is the approximate speed of light in a vacuum?", "299,792,458 meters per second", ["299792458 m/s", "speed of light"]],
    ["What number represents neutral pH?", "seven", ["7", "pH seven"]],
    ["Which organ pumps blood around the human body?", "heart", ["human heart", "cardiac organ"]],
    ["Which green pigment allows plants to absorb light?", "chlorophyll", ["green chlorophyll", "plant pigment"]],
    ["What is the largest bone in the human body?", "femur", ["thigh bone", "femur bone"]],
    ["Which blood type is commonly described as the universal red-cell donor?", "O negative blood", ["O negative", "universal donor"]],
    ["What is the scientific study of fungi called?", "mycology", ["fungal biology", "study of fungi"]],
    ["What is the outermost solid layer of Earth called?", "crust", ["Earth crust", "outer crust"]],
    ["Which gas is commonly used to make balloons float?", "helium", ["He", "helium gas"]],
    ["What SI unit measures electric current?", "ampere", ["amp", "A"]],
    ["Which acid is present in the human stomach?", "hydrochloric acid", ["HCl", "stomach acid"]],
    ["What is the smallest unit that can carry out all basic life processes?", "cell", ["living cell", "basic life unit"]],
    ["What force attracts masses toward one another?", "gravity", ["gravity force", "gravitation"]],
    ["What term describes a change in genetic material?", "mutation", ["gene mutation", "genetic mutation"]],
    ["What is the approximate speed of sound in dry air at room temperature?", "343 meters per second", ["343 m/s", "speed of sound"]],
    ["Which vitamin can human skin produce in sunlight?", "vitamin D", ["vitamin D3", "D vitamin"]],
    ["What is the scientific study of earthquakes called?", "seismology", ["earthquake science", "seismic study"]],
    ["Which gas is released by plants during photosynthesis?", "oxygen", ["O2", "oxygen gas"]],
    ["At what temperature does water boil at sea level in the Celsius scale?", "100 degrees Celsius", ["100 C", "one hundred degrees Celsius"]],
    ["What renewable energy comes from moving air?", "wind energy", ["wind power"]],
    ["Which blood cells carry most oxygen through the body?", "red blood cells", ["erythrocytes", "red cells"]],
    ["Which subatomic particle has a negative electric charge?", "electron", ["the electron", "negative particle"]],
    ["What chemical element has the symbol Au?", "gold", ["Au", "gold element"]],
    ["What process changes a liquid into a gas?", "evaporation", ["vaporization", "evaporating"]],
    ["Which element is represented by the symbol H?", "hydrogen", ["H element", "hydrogen gas"]],
    ["Which organ is the main control center of the human nervous system?", "brain", ["human brain", "brain organ"]],
    ["What is the name for a region with no matter through which sound cannot travel?", "vacuum", ["empty space", "a vacuum"]],
    ["What is Earth's natural satellite?", "Moon", ["the moon", "Luna"]],
    ["What form of energy does a moving object possess?", "kinetic energy", ["kinetic", "motion energy"]],
    ["What structure packages genetic information in many cells?", "chromosome", ["chromosomes", "genetic structure"]],
    ["What is the scientific study of plants called?", "botany", ["plant science", "study of plants"]],
    ["Which metal is liquid at room temperature?", "mercury", ["Hg", "quicksilver"]],
    ["What is a disease-causing organism or agent called?", "pathogen", ["infectious agent", "pathogenic organism"]],
    ["What process lets green plants make sugars from light?", "photosynthesis", ["plant food-making", "photosynthetic process"]],
    ["What SI unit measures frequency?", "hertz", ["Hz", "cycles per second"]],
    ["Which gas do humans need for aerobic respiration?", "oxygen", ["O2", "oxygen gas"]],
    ["What astronomical object is usually described as an icy body with a tail?", "comet", ["comet body", "icy space object"]],
    ["Which hormone helps regulate blood sugar?", "insulin", ["insulin hormone", "blood-sugar hormone"]],
    ["What is the outermost layer of human skin called?", "epidermis", ["skin epidermis", "outer skin layer"]],
    ["What is the boundary around a black hole beyond which light cannot escape?", "event horizon", ["black-hole boundary", "event horizon boundary"]],
    ["What molecule stores hereditary instructions in most living organisms?", "DNA", ["deoxyribonucleic acid", "DNA molecule"]],
    ["What shape best describes Earth's slightly flattened sphere?", "oblate spheroid", ["oblate sphere", "flattened sphere"]],
    ["What is the hardest substance in the human body?", "tooth enamel", ["dental enamel", "enamel"]],
    ["What process changes a solid directly into a gas?", "sublimation", ["subliming", "solid-to-gas transition"]],
    ["What SI unit measures electrical resistance?", "ohm", ["Ω", "ohms"]],
    ["Which pigment gives many plants their green color?", "chlorophyll", ["chlorophyll pigment", "green plant pigment"]],
    ["What mode of heat transfer occurs through direct contact?", "conduction", ["thermal conduction", "heat conduction"]],
    ["What branch of biology studies inheritance?", "genetics", ["genetic science", "inheritance science"]],
    ["Which subatomic particle has no electric charge?", "neutron", ["the neutron", "neutral particle"]],
    ["What does a seismograph primarily record?", "seismic waves", ["earthquake vibrations", "seismic vibrations"]],
    ["What liquid component makes up much of the volume of blood?", "plasma", ["blood plasma", "liquid blood component"]],
    ["What is a huge system of stars, gas, and dust called?", "galaxy", ["star galaxy", "galactic system"]],
    ["Which naturalist is most associated with evolution by natural selection?", "Charles Darwin", ["Darwin", "Charles Darwin naturalist"]],
    ["What scale is used to describe how acidic or basic a solution is?", "pH scale", ["pH", "acidity scale"]],
    ["What tiny blood vessels connect arteries and veins?", "capillaries", ["capillary vessels", "tiny blood vessels"]],
    ["What is the common name for sodium chloride?", "sodium chloride", ["table salt", "NaCl"]],
    ["What transparent structure focuses incoming light in the eye?", "crystalline lens", ["eye lens", "crystalline eye lens"]],
    ["What is an organism that makes its own food called?", "autotroph", ["producer organism", "self-feeding organism"]],
    ["Which planet has the most prominent visible ring system?", "Saturn", ["Saturn planet", "ringed planet"]],
    ["What is the lowest theoretically possible temperature?", "absolute zero", ["0 kelvin", "absolute zero temperature"]],
    ["What is the scientific study of fossils called?", "paleontology", ["fossil science", "study of fossils"]],
    ["What is the SI base unit of mass?", "kilogram", ["kg", "kilogram unit"]],
    ["What phenomenon bends light as it passes between materials?", "refraction", ["light refraction", "bending of light"]],
    ["What process produces two genetically similar daughter cells?", "mitosis", ["cell division", "mitotic division"]],
    ["What protein is abundant in hair and nails?", "keratin", ["hair keratin", "structural protein"]],
    ["What movement in Earth's mantle helps drive tectonic plates?", "mantle convection", ["convection currents", "mantle currents"]],
    ["What is the closest star to the Sun?", "Proxima Centauri", ["Proxima", "Alpha Centauri C"]],
    ["What unit is used to express sound intensity levels?", "decibels", ["dB", "decibel scale"]],
    ["Which insect is a familiar example of complete metamorphosis?", "butterfly", ["butterfly insect", "metamorphosis insect"]],
  ]),
  Geography: rows([
    ["Which country has the greatest land area?", "Russia", ["Russian Federation", "Russia country"]],
    ["What is the capital of Portugal?", "Lisbon", ["Lisboa", "Lisbon city"]],
    ["Which river flows north through Egypt to the Mediterranean?", "Nile", ["Nile River", "River Nile"]],
    ["What is the largest continent by land area?", "Asia", ["Asian continent", "Asia continent"]],
    ["Which ocean lies between Africa, Asia, and Australia?", "Indian Ocean", ["Indian Ocean waters", "Indian"]],
    ["What desert stretches across much of North Africa?", "Sahara Desert", ["Sahara", "Sahara desert"]],
    ["What is the world's highest mountain above sea level?", "Mount Everest", ["Everest", "Sagarmatha"]],
    ["Which country is often described as being shaped like a boot?", "Italy", ["Italian peninsula", "Italy country"]],
    ["What is the capital of Japan?", "Tokyo", ["Tokyo city", "Japanese capital"]],
    ["Which river is the longest major river in South America?", "Amazon River", ["Amazon", "River Amazon"]],
    ["Which city occupies territory on both Europe and Asia?", "Istanbul", ["Istanbul city", "Turkish transcontinental city"]],
    ["Which country contains the Great Barrier Reef?", "Australia", ["Australian mainland", "Australia country"]],
    ["What imaginary line circles Earth halfway between the poles?", "Equator", ["the Equator", "equatorial line"]],
    ["Which country is often counted as having the most islands?", "Sweden", ["Kingdom of Sweden", "Swedish country"]],
    ["What is the capital of Kenya?", "Nairobi", ["Nairobi city", "Kenyan capital"]],
    ["Which sea lies between southern Europe and northern Africa?", "Mediterranean Sea", ["Mediterranean", "Mediterranean waters"]],
    ["Which country is home to Mount Fuji?", "Japan", ["Japanese archipelago", "Japan country"]],
    ["What is the world's largest desert by total area?", "Antarctic Desert", ["Antarctica", "polar desert"]],
    ["What is the capital of Canada?", "Ottawa", ["Ottawa city", "Canadian capital"]],
    ["In which country is the Taj Mahal located?", "India", ["Indian subcontinent", "India country"]],
    ["Which small country is landlocked in the Pyrenees between France and Spain?", "Andorra", ["Principality of Andorra", "Andorra country"]],
    ["What is the capital of Iceland?", "Reykjavik", ["Reykjavik city", "Icelandic capital"]],
    ["Which waterfall lies on the border of Zambia and Zimbabwe?", "Victoria Falls", ["Mosi-oa-Tunya", "Victoria waterfall"]],
    ["Which country is renowned for its long, deeply cut fjords?", "Norway", ["Kingdom of Norway", "Norwegian country"]],
    ["Which river flows through London?", "Thames", ["River Thames", "Thames River"]],
    ["What is the capital of Egypt?", "Cairo", ["Cairo city", "Egyptian capital"]],
    ["What peninsula contains most of Saudi Arabia?", "Arabian Peninsula", ["Arabia", "Arabian peninsula"]],
    ["What is the world's largest island that is not a continent?", "Greenland", ["Greenland island", "Kalaallit Nunaat"]],
    ["Which canal connects the Mediterranean Sea with the Red Sea?", "Suez Canal", ["Suez", "Suez waterway"]],
    ["What is the capital of Brazil?", "Brasília", ["federal capital of Brazil", "Brasilia capital"]],
    ["Which mountain range traditionally marks part of the boundary between Europe and Asia?", "Ural Mountains", ["Urals", "Ural range"]],
    ["In which country is Machu Picchu located?", "Peru", ["Peruvian Andes", "Peru country"]],
    ["Which Great Lake has the largest surface area?", "Lake Superior", ["Superior", "Lake Superior freshwater"]],
    ["What is the capital of South Korea?", "Seoul", ["Seoul city", "South Korean capital"]],
    ["Which desert spans parts of northern China and southern Mongolia?", "Gobi Desert", ["Gobi", "Gobi region"]],
    ["Which South American country forms a long strip along the Pacific coast?", "Chile", ["Chilean country", "long Pacific country"]],
    ["Which river flows through Paris?", "Seine", ["River Seine", "Seine River"]],
    ["What is the capital of Greece?", "Athens", ["Athens city", "Greek capital"]],
    ["Which island country off West Africa was formerly called Cabo Verde?", "Cape Verde", ["Cabo Verde", "Cape Verde islands"]],
    ["Which strait separates Spain from Morocco?", "Strait of Gibraltar", ["Gibraltar Strait", "Mediterranean Atlantic passage"]],
    ["Which Italian city is famous for canals and gondolas?", "Venice", ["Venice city", "Italian canal city"]],
    ["What is the capital of Morocco?", "Rabat", ["Rabat city", "Moroccan capital"]],
    ["Which continent contains the greatest number of sovereign countries?", "Africa", ["African continent", "Africa continent"]],
    ["Which country contains the Serengeti ecosystem?", "Tanzania", ["United Republic of Tanzania", "Tanzania country"]],
    ["Which high-altitude lake lies between Peru and Bolivia?", "Lake Titicaca", ["Titicaca", "Andean lake"]],
    ["What is the capital of New Zealand?", "Wellington", ["Wellington city", "New Zealand capital"]],
    ["Which waterfalls sit on the border between the United States and Canada?", "Niagara Falls", ["Niagara", "Niagara waterfall"]],
    ["In which country can the ancient city of Petra be visited?", "Jordan", ["Jordan country", "Hashemite Kingdom"]],
    ["Which major European river flows through Germany and the Netherlands?", "Rhine", ["Rhine River", "River Rhine"]],
    ["What is the capital of Thailand?", "Bangkok", ["Bangkok city", "Thai capital"]],
    ["Which island country lies southeast of India?", "Sri Lanka", ["Ceylon", "Sri Lankan island"]],
    ["What mountain range runs through western North America?", "Rocky Mountains", ["Rockies", "Rocky Mountain range"]],
    ["What is the capital of Argentina?", "Buenos Aires", ["Buenos Aires city", "Argentine capital"]],
    ["Which sea lies along the eastern coast of Italy?", "Adriatic Sea", ["Adriatic", "Adriatic waters"]],
    ["Which country has the Andes and the Pacific coast at the Equator?", "Ecuador", ["Ecuador country", "Equatorial South American country"]],
    ["What is the capital of Turkey?", "Ankara", ["Ankara city", "Turkish capital"]],
    ["Which continent surrounds the South Pole?", "Antarctica", ["Antarctic continent", "the Antarctic"]],
    ["Which country contains the Acropolis of Athens?", "Greece", ["Greek country", "Hellenic Republic"]],
    ["Which river runs through the city of Rome?", "Tiber", ["Tiber River", "River Tiber"]],
    ["What is the capital of Norway?", "Oslo", ["Oslo city", "Norwegian capital"]],
    ["Which peninsula is the largest in the world by area?", "Arabian Peninsula", ["Arabia", "Arabian landmass"]],
    ["Which country administers the Galápagos Islands?", "Ecuador", ["Galapagos country", "Ecuadorian Republic"]],
    ["Which city is commonly nicknamed the Big Apple?", "New York City", ["New York", "NYC"]],
    ["What is the capital of Vietnam?", "Hanoi", ["Hanoi city", "Vietnamese capital"]],
    ["Which Venezuelan waterfall is the world's highest uninterrupted waterfall?", "Angel Falls", ["Kerepakupai Merú", "Angel waterfall"]],
    ["Which country is crossed by the Trans-Siberian Railway?", "Russia", ["Trans-Siberian country", "Russian railway country"]],
    ["Which strait separates eastern Russia from Alaska?", "Bering Strait", ["Bering", "Bering passage"]],
    ["What is the capital of Ireland?", "Dublin", ["Dublin city", "Irish capital"]],
    ["Which ocean surrounds the North Pole?", "Arctic Ocean", ["Arctic", "Arctic waters"]],
    ["Which country contains Mount Kilimanjaro?", "Tanzania", ["Kilimanjaro country", "Tanzanian Republic"]],
    ["What is the capital of the Netherlands?", "Amsterdam", ["Amsterdam city", "Dutch capital"]],
    ["Which country is famous for its spring tulip fields?", "Netherlands", ["Holland", "Dutch country"]],
    ["Which river forms part of the border between Texas and Mexico?", "Rio Grande", ["Rio Grande River", "Río Grande"]],
    ["What is the capital of Hungary?", "Budapest", ["Budapest city", "Hungarian capital"]],
    ["Which country displays a cedar tree on its national flag?", "Lebanon", ["Lebanese Republic", "cedar country"]],
  ]),
  History: rows([
    ["Who was the first president of the United States?", "George Washington", ["Washington", "first US president"]],
    ["Which ancient civilization built the pyramids at Giza?", "Egypt", ["ancient Egypt", "Egyptian civilization"]],
    ["In what year was Magna Carta first sealed?", "1215", ["year 1215", "thirteen fifteen"]],
    ["In what year did World War II end?", "1945", ["year 1945", "nineteen forty-five"]],
    ["Which Roman city was buried by Mount Vesuvius?", "Pompeii", ["Pompeii city", "Roman Pompeii"]],
    ["Who was the first person to walk on the Moon?", "Neil Armstrong", ["Armstrong", "Neil Armstrong astronaut"]],
    ["In which country did the Renaissance begin?", "Italy", ["Italian Renaissance", "Italian birthplace of the Renaissance"]],
    ["Which ancient Greek city-state was home to the Acropolis?", "Athens", ["Athens polis", "ancient Athens"]],
    ["What trade network connected China with the Mediterranean world?", "Silk Road", ["Silk Route", "Eurasian trade route"]],
    ["Who was the first emperor of a unified China?", "Qin Shi Huang", ["Qin emperor", "Shi Huangdi"]],
    ["What year is traditionally used for the fall of the Western Roman Empire?", "476 CE", ["476", "year 476"]],
    ["In what year did the French Revolution begin?", "1789", ["year 1789", "seventeen eighty-nine"]],
    ["In what year did the Berlin Wall fall?", "1989", ["year 1989", "nineteen eighty-nine"]],
    ["Who is credited with developing the movable-type printing press in Europe?", "Johannes Gutenberg", ["Gutenberg", "Johann Gutenberg"]],
    ["In what year did the Titanic sink?", "1912", ["year 1912", "nineteen twelve"]],
    ["Which ancient Greek philosopher taught Plato?", "Socrates", ["Socrates philosopher", "the philosopher Socrates"]],
    ["In what year was the Battle of Hastings fought?", "1066", ["year 1066", "ten sixty-six"]],
    ["What was the capital of the Inca Empire?", "Cusco", ["Cuzco", "Inca capital"]],
    ["During which century did the Black Death reach Europe?", "fourteenth century", ["14th century", "the fourteenth century"]],
    ["In what year did the United States adopt its Declaration of Independence?", "1776", ["year 1776", "seventeen seventy-six"]],
    ["Which Egyptian ruler was allied with Julius Caesar and Mark Antony?", "Cleopatra VII", ["Cleopatra", "Cleopatra the Seventh"]],
    ["What was Istanbul called for much of its Byzantine history?", "Constantinople", ["Constantinople city", "Byzantine capital"]],
    ["Which two superpowers were the principal rivals in the Cold War?", "United States and Soviet Union", ["USA and USSR", "US and USSR"]],
    ["Where were the ancient Olympic Games held?", "Greece", ["ancient Greece", "Greek city-states"]],
    ["Which ancient city is associated with Hammurabi's famous law code?", "Babylon", ["Babylonian kingdom", "ancient Babylon"]],
    ["Which navigator's 1492 voyage reached the Caribbean from Europe?", "Christopher Columbus", ["Columbus", "Christopher Colon"]],
    ["Who became a leading figure in the Haitian Revolution?", "Toussaint Louverture", ["Toussaint", "Louverture"]],
    ["In what year did the Great Fire of London occur?", "1666", ["year 1666", "sixteen sixty-six"]],
    ["In what year did India become independent from British rule?", "1947", ["year 1947", "nineteen forty-seven"]],
    ["In which modern country is the ancient site of Troy located?", "Turkey", ["Anatolia", "modern Turkey"]],
    ["Who founded the largest contiguous empire in history?", "Genghis Khan", ["Chinggis Khan", "Temujin"]],
    ["Which scientist was the first person to win Nobel Prizes in two sciences?", "Marie Curie", ["Curie", "Madame Curie"]],
    ["In what year did the Spanish Armada campaign against England take place?", "1588", ["year 1588", "fifteen eighty-eight"]],
    ["What was the capital of the Byzantine Empire?", "Constantinople", ["Constantinople metropolis", "Byzantine imperial capital"]],
    ["What war was fought between Athens and Sparta?", "Peloponnesian War", ["Peloponnesian conflict", "Athens-Sparta war"]],
    ["Where did Robert E. Lee surrender to Ulysses S. Grant?", "Appomattox Court House", ["Appomattox", "Appomattox surrender"]],
    ["Where were the first modern Olympic Games held in 1896?", "Athens", ["1896 Athens Games", "modern Athens Olympics"]],
    ["Which mission carried the first humans to the Moon's surface?", "Apollo 11", ["Apollo Eleven", "lunar mission Apollo 11"]],
    ["Who became South Africa's first Black president?", "Nelson Mandela", ["Mandela", "Nelson Mandela president"]],
    ["The Maya civilization developed in what broad region?", "Mesoamerica", ["Mesoamerican region", "central Mexico and Central America"]],
    ["Which treaty formally ended World War I with Germany?", "Treaty of Versailles", ["Versailles Treaty", "Paris Peace Treaty"]],
    ["What writing system did ancient Egyptians use for monumental inscriptions?", "hieroglyphs", ["Egyptian hieroglyphs", "hieroglyphic script"]],
    ["Who led the Norman conquest of England in 1066?", "William the Conqueror", ["William I", "Norman William"]],
    ["In which country did the Industrial Revolution first accelerate?", "Britain", ["Great Britain", "United Kingdom"]],
    ["What movement campaigned for women's right to vote?", "women's suffrage", ["suffrage movement", "female suffrage"]],
    ["Which civilization developed one of the earliest writing systems called cuneiform?", "Sumer", ["Sumerian civilization", "Mesopotamian Sumer"]],
    ["What was the capital of the Aztec Empire?", "Tenochtitlan", ["Aztec capital", "Mexico City predecessor"]],
    ["Which French military leader was defeated at Waterloo?", "Napoleon Bonaparte", ["Napoleon", "Bonaparte"]],
    ["Which ruler is associated with the Terracotta Army?", "Qin Shi Huang", ["Terracotta Emperor", "Qin Shi Huangdi"]],
    ["What name is commonly given to the influenza pandemic that began in 1918?", "Spanish flu", ["1918 influenza", "influenza pandemic"]],
    ["Which Roman numeral represents one hundred?", "C", ["Roman numeral C", "one hundred"]],
    ["Which ruler is often identified as the first pharaoh of a unified ancient Egypt?", "Narmer", ["Menes", "King Narmer"]],
    ["Which battle in 490 BCE saw Athens defeat a Persian force?", "Battle of Marathon", ["Marathon", "Marathon battle"]],
    ["What international organization was founded in 1945 to promote cooperation between nations?", "United Nations", ["UN", "United Nations Organization"]],
    ["What name is given to the Allied landings in Normandy on June 6, 1944?", "D-Day", ["Normandy landings", "June 6 landings"]],
    ["What 1962 confrontation brought the United States and Soviet Union close to nuclear war?", "Cuban Missile Crisis", ["1962 missile crisis", "Cuba crisis"]],
    ["What was the first spacecraft to reach the Moon's surface?", "Luna 2", ["Lunik 2", "Luna Two"]],
    ["What language was widely used in the administration of ancient Rome?", "Latin", ["Latin language", "Roman Latin"]],
    ["What disease caused the medieval epidemic known as the Black Death?", "bubonic plague", ["Black Death disease", "Yersinia pestis plague"]],
    ["Who was the first woman to serve as prime minister of the United Kingdom?", "Margaret Thatcher", ["Thatcher", "Iron Lady"]],
    ["What political transformation began in Japan in 1868?", "Meiji Restoration", ["Meiji era restoration", "Japanese Meiji Restoration"]],
    ["What barrier divided East and West Berlin during the Cold War?", "Berlin Wall", ["Wall of Berlin", "East-West barrier"]],
    ["Which artifact helped scholars decipher Egyptian hieroglyphs?", "Rosetta Stone", ["Rosetta", "Rosetta artifact"]],
    ["Which West African empire was ruled by the famous emperor Mansa Musa?", "Mali Empire", ["Mali", "Mali Empire kingdom"]],
    ["Which Norse explorer is often credited with reaching North America before Columbus?", "Leif Erikson", ["Leif Eriksson", "Norse explorer Leif"]],
    ["Which 1917 Russian uprising helped bring down the monarchy?", "February Revolution", ["1917 February Revolution", "Russian February Revolution"]],
    ["Which ancient city fought Rome in the Punic Wars?", "Carthage", ["ancient Carthage", "Punic city"]],
    ["Who led the expedition that began the first circumnavigation of Earth?", "Ferdinand Magellan", ["Magellan", "Fernão de Magalhães"]],
    ["What 1054 event divided the medieval Christian church into eastern and western branches?", "Great Schism of 1054", ["East-West Schism", "1054 schism"]],
    ["In what year was the United States Constitution signed?", "1787", ["year 1787", "seventeen eighty-seven"]],
    ["What name is given to the era associated with Queen Victoria's reign?", "Victorian era", ["Victorian age", "Queen Victoria era"]],
    ["What civil code was established under Napoleon Bonaparte?", "Napoleonic Code", ["Code Napoleon", "French Civil Code"]],
    ["Which Cuban writer and activist became a symbol of independence?", "José Martí", ["Jose Marti", "Cuban independence leader"]],
    ["At what sanctuary were the ancient Olympic Games celebrated?", "Olympia", ["ancient Olympia", "Olympia sanctuary"]],
    ["What was the name of the first artificial satellite launched into orbit?", "Sputnik 1", ["Sputnik", "Sputnik One satellite"]],
  ]),
};

const normalizeForComparison = (value) => value
  .normalize("NFKD")
  .replace(/\p{Mark}/gu, "")
  .toLocaleLowerCase("en-US")
  .replace(/[^\p{Letter}\p{Number}]/gu, "");

const fail = (message) => {
  throw new Error(`Question generator validation failed: ${message}`);
};

export const validateQuestionBank = (records) => {
  if (!Array.isArray(records) || records.length !== EXPECTED_QUESTION_COUNT) {
    fail(`expected exactly ${EXPECTED_QUESTION_COUNT} records`);
  }

  const ids = new Set();
  const prompts = new Set();
  const categoryCounts = new Map(CATEGORIES.map((category) => [category, 0]));

  records.forEach((record, index) => {
    if (!record || typeof record !== "object") fail(`record ${index + 1} is not an object`);
    const { id, category, prompt, canonicalAnswer, acceptedAliases, difficulty, rarity } = record;
    if (!CATEGORIES.includes(category)) fail(`record ${index + 1} has an invalid category`);
    if (!/^\w+-\d{3}$/.test(id) || !id.startsWith(`${category.toLowerCase()}-`)) {
      fail(`record ${index + 1} has an unstable id`);
    }
    if (ids.has(id)) fail(`duplicate id ${id}`);
    ids.add(id);
    if (typeof prompt !== "string") fail(`record ${id} has an empty prompt`);
    const normalizedPrompt = normalizeForComparison(prompt);
    if (!normalizedPrompt) fail(`record ${index + 1} has an empty prompt`);
    if (prompts.has(normalizedPrompt)) fail(`duplicate prompt ${prompt}`);
    prompts.add(normalizedPrompt);
    if (typeof canonicalAnswer !== "string" || !normalizeForComparison(canonicalAnswer)) {
      fail(`record ${id} has an invalid canonical answer`);
    }
    if (!Array.isArray(acceptedAliases) || acceptedAliases.length === 0) {
      fail(`record ${id} must have at least one accepted alias`);
    }
    const aliases = new Set();
    acceptedAliases.forEach((alias) => {
      if (typeof alias !== "string") fail(`record ${id} has an invalid alias`);
      const normalizedAlias = normalizeForComparison(alias);
      if (!normalizedAlias) fail(`record ${id} has an invalid alias`);
      if (aliases.has(normalizedAlias)) fail(`record ${id} has duplicate aliases`);
      aliases.add(normalizedAlias);
    });
    if (!DIFFICULTIES.includes(difficulty)) fail(`record ${id} has an invalid difficulty`);
    if (!rarity || typeof rarity !== "object" || !TIER_ORDER.includes(rarity.tier)) {
      fail(`record ${id} has an invalid rarity tier`);
    }
    const expectedRarity = RARITY_RULES[rarity.tier];
    if (rarity.score !== expectedRarity.score || rarity.depth !== expectedRarity.depth) {
      fail(`record ${id} has mismatched rarity metadata`);
    }
    categoryCounts.set(category, categoryCounts.get(category) + 1);
  });

  for (const category of CATEGORIES) {
    if (categoryCounts.get(category) !== QUESTIONS_PER_CATEGORY) {
      fail(`${category} must contain exactly ${QUESTIONS_PER_CATEGORY} records`);
    }
  }
  return records;
};

export const buildQuestionBank = () => CATEGORIES.flatMap((category, categoryIndex) => {
  const facts = factsByCategory[category];
  if (facts.length !== QUESTIONS_PER_CATEGORY) {
    fail(`${category} source has ${facts.length} facts`);
  }
  return facts.map((fact, index) => {
    const tier = TIER_ORDER[(index + categoryIndex) % TIER_ORDER.length];
    const difficulty = DIFFICULTIES[(index + categoryIndex) % DIFFICULTIES.length];
    return {
      id: `${category.toLowerCase()}-${String(index + 1).padStart(3, "0")}`,
      category,
      prompt: fact.prompt,
      canonicalAnswer: fact.canonicalAnswer,
      acceptedAliases: [...fact.acceptedAliases],
      difficulty,
      rarity: { ...RARITY_RULES[tier] },
    };
  });
});

export const writeQuestionBank = (outputPath = OUTPUT_PATH) => {
  const questionBank = validateQuestionBank(buildQuestionBank());
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(questionBank, null, 2)}\n`, "utf8");
  return questionBank;
};

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  writeQuestionBank();
  console.log(`Generated ${EXPECTED_QUESTION_COUNT} questions at ${OUTPUT_PATH}`);
}
