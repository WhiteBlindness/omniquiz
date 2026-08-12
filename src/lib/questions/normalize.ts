export const normalizeAnswer = (answer: string): string =>
  answer
    .normalize("NFKD")
    .replace(/\p{Mark}/gu, "")
    .toLocaleLowerCase("en-US")
    .replace(/[^\p{Letter}\p{Number}]/gu, "");
