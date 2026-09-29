export const family = (label, aliases, insight) =>
  insight === undefined ? { label, aliases } : { label, aliases, insight };

export const question = (prompt, answers) => ({ prompt, answers });
