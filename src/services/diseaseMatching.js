/**
 * Disease / pest label normalization and catalog lookup for marketplace matching.
 * Aligns CNN class ids (e.g. blast, tungro) with seller picker strings (e.g. Blast (Magnaporthe grisea)).
 */
const rawCatalog = require('../../data/solutions-database.json');

const diseaseCatalog = Array.isArray(rawCatalog) ? rawCatalog : [];

/**
 * Normalize disease/pest labels for comparison (underscores, whitespace, case).
 */
export function normalizeDiseaseForMatch(name) {
  if (name == null || typeof name !== 'string') return '';
  try {
    return name
      .toLowerCase()
      .trim()
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ');
  } catch {
    return '';
  }
}

/** Leading segment before a trailing "(...)" parenthetical, already normalized. */
function parentheticalBase(normalizedFull) {
  if (!normalizedFull || typeof normalizedFull !== 'string') return '';
  return normalizedFull.replace(/\s*\([^)]*\)\s*$/, '').trim();
}

function addNormalizedKeys(keys, value) {
  if (value == null) return;
  const str = typeof value === 'string' ? value : String(value);
  const n = normalizeDiseaseForMatch(str);
  if (!n) return;
  keys.add(n);
  const base = parentheticalBase(n);
  if (base && base !== n) keys.add(base);
}

/**
 * Find catalog row matching a normalized query (model_var, display name, aliases, base name).
 */
function findCatalogEntry(normalizedQuery) {
  if (!normalizedQuery) return null;

  for (const d of diseaseCatalog) {
    if (!d || typeof d !== 'object') continue;

    if (d.model_var != null) {
      const mv = normalizeDiseaseForMatch(String(d.model_var));
      if (mv && mv === normalizedQuery) return d;
    }

    if (d.name != null) {
      const nm = normalizeDiseaseForMatch(String(d.name));
      if (nm && nm === normalizedQuery) return d;
      const base = parentheticalBase(nm);
      if (base && base === normalizedQuery) return d;
    }

    const aliases = Array.isArray(d.aliases) ? d.aliases : [];
    for (const a of aliases) {
      const an = normalizeDiseaseForMatch(String(a));
      if (an && an === normalizedQuery) return d;
    }
  }

  return null;
}

/**
 * All normalized strings that should match marketplace `targetDiseases` for this query.
 */
export function getDiseaseMatchKeySet(rawLabel) {
  const keys = new Set();
  if (rawLabel == null || typeof rawLabel !== 'string') return keys;

  let trimmed;
  try {
    trimmed = rawLabel.trim();
  } catch {
    return keys;
  }
  if (!trimmed) return keys;

  const normalized = normalizeDiseaseForMatch(trimmed);
  if (!normalized) return keys;

  keys.add(normalized);

  let entry;
  try {
    entry = findCatalogEntry(normalized);
  } catch {
    return keys;
  }

  if (!entry) return keys;

  try {
    if (entry.name != null) addNormalizedKeys(keys, entry.name);
    if (entry.model_var != null) addNormalizedKeys(keys, entry.model_var);
    const aliases = Array.isArray(entry.aliases) ? entry.aliases : [];
    for (const a of aliases) addNormalizedKeys(keys, a);
  } catch {
    // keep keys collected so far
  }

  return keys;
}

export function diseaseLabelMatchesKeys(rawLabel, matchKeys) {
  if (!matchKeys || matchKeys.size === 0) return false;
  const n = normalizeDiseaseForMatch(rawLabel);
  if (!n) return false;
  if (matchKeys.has(n)) return true;
  const base = parentheticalBase(n);
  return !!(base && matchKeys.has(base));
}

/**
 * Normalized lower-case variants for storing on product docs (consistent matching).
 */
export function normalizeTargetDiseasesForStorage(tags) {
  const list = Array.isArray(tags) ? tags : [];
  const out = [];
  const seen = new Set();
  for (const t of list) {
    if (t == null) continue;
    let n;
    try {
      n = normalizeDiseaseForMatch(String(t));
    } catch {
      continue;
    }
    if (!n || seen.has(n)) continue;
    seen.add(n);
    out.push(n);
  }
  return out;
}
