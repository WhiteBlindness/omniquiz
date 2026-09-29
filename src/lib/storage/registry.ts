/**
 * Every browser-storage key OMNIQUIZ writes, with the plain-language purpose
 * shown on the Cookie Policy page. `registry.test.ts` fails if the source
 * uses an `omniquiz-` key that is not listed here.
 */
export type StorageEntry = Readonly<{ key: string; purpose: string }>;

export const STORAGE_REGISTRY: readonly StorageEntry[] = Object.freeze([
  {
    key: "omniquiz-theme-v1",
    purpose: "Remembers whether you chose the dark or light theme.",
  },
  {
    key: "omniquiz-preferences-v1",
    purpose: "Remembers whether you muted sound effects.",
  },
  {
    key: "omniquiz-progress-v3",
    purpose:
      "Keeps your current or just-finished run so a refresh does not lose it: the prompts you were given, the answers you typed and the results shown to you.",
  },
  {
    key: "omniquiz-stats-v2",
    purpose:
      "Your run count, rounds played, recognised answers, best and last score and daily streak for the core game.",
  },
  {
    key: "omniquiz-stats-v2:<pack>",
    purpose:
      "The same statistics kept separately for each themed pack, for example omniquiz-stats-v2:movies.",
  },
  {
    key: "omniquiz-storage-consent-v1",
    purpose: "Remembers that you dismissed the storage notice.",
  },
]);
