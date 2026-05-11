// JsonStore.mjs — crash-safe JSON storage for Bun
// Port of the Python pattern from:
// https://dev.to/constanta/crash-safe-json-at-scale-atomic-writes-recovery-without-a-db-3aic

import { mkdirSync, existsSync, copyFileSync, renameSync, openSync, fsyncSync, closeSync, writeSync, unlinkSync } from "node:fs";
import { dirname, basename, extname } from "node:path";
import { randomBytes } from "node:crypto";

// ---------------------------------------------------------------------------
// WriteOptions
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} WriteOptions
 * @property {boolean} [createDirs=true]   - Create parent directories if missing
 * @property {boolean} [backup=true]       - Write a .bak before replacing main
 * @property {boolean} [ensureAscii=false] - Escape non-ASCII in JSON output
 * @property {number|null} [indent=2]      - JSON indentation (null = compact)
 * @property {boolean} [sortKeys=false]    - Sort object keys in output
 */

/** @returns {WriteOptions} */
export function defaultWriteOptions() {
  return { createDirs: true, backup: true, ensureAscii: false, indent: 2, sortKeys: false };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function bakPath(filePath) {
  const ext = extname(filePath);
  return filePath + ".bak";
}

function tmpPath(filePath) {
  const dir = dirname(filePath);
  const base = basename(filePath);
  const rand = randomBytes(6).toString("hex");
  return `${dir}/${base}.${rand}.tmp`;
}

function sortedJson(obj) {
  return JSON.parse(JSON.stringify(obj, Object.keys(obj).sort()));
}

function serialize(payload, opts) {
  const data = opts.sortKeys && typeof payload === "object" && payload !== null
    ? sortedJson(payload)
    : payload;
  const json = JSON.stringify(data, null, opts.indent ?? undefined);
  if (opts.ensureAscii) {
    return json.replace(/[^\x00-\x7F]/g, c => `\\u${c.codePointAt(0).toString(16).padStart(4, "0")}`);
  }
  return json;
}

// ---------------------------------------------------------------------------
// writeJsonAtomic
// ---------------------------------------------------------------------------

/**
 * Atomically write `payload` to `filePath` using temp-file + fsync + rename.
 * Optionally backs up the existing file to `<filePath>.bak` first.
 *
 * @param {string} filePath
 * @param {unknown} payload
 * @param {object} [opts]
 * @param {(payload: unknown) => void} [opts.validate]  - Throw to abort write
 * @param {WriteOptions} [opts.options]
 */
export function writeJsonAtomic(filePath, payload, { validate, options } = {}) {
  const opts = { ...defaultWriteOptions(), ...options };

  if (opts.createDirs) {
    mkdirSync(dirname(filePath), { recursive: true });
  }

  if (validate) validate(payload);

  // Back up existing file before touching anything
  if (opts.backup && existsSync(filePath)) {
    copyFileSync(filePath, bakPath(filePath));
  }

  const tmp = tmpPath(filePath);
  const json = serialize(payload, opts);

  // Write → flush → fsync → atomic rename
  const fd = openSync(tmp, "w");
  try {
    writeSync(fd, json, 0, "utf8");
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }

  // os.replace() equivalent — atomic on POSIX, best-effort on Windows
  renameSync(tmp, filePath);
}

// ---------------------------------------------------------------------------
// readJson (simple, no recovery)
// ---------------------------------------------------------------------------

/**
 * Read and parse a JSON file. Returns `defaultValue` on any error.
 *
 * @param {string} filePath
 * @param {unknown} [defaultValue]
 * @returns {unknown}
 */
export function readJson(filePath, defaultValue = null) {
  try {
    const text = Bun.file(filePath).toString();          // sync-style via Bun
    return JSON.parse(text);
  } catch {
    return defaultValue;
  }
}

// We need a sync read — Bun.file().text() is async, so use Node's readFileSync
import { readFileSync } from "node:fs";

function readJsonSync(filePath, defaultValue = null) {
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch {
    return defaultValue;
  }
}

// ---------------------------------------------------------------------------
// readJsonWithRecovery
// ---------------------------------------------------------------------------

/**
 * Forensic-safe recovery read:
 *
 *  1. main exists & valid       → return main
 *  2. main broken, .bak valid   → restore main from .bak (backup=false), return payload
 *  3. main broken, no .bak      → return default WITHOUT writing (preserve evidence)
 *  4. main missing, .bak exists → restore main, return payload
 *  5. both missing              → write default only if `writeDefaultIfMissing=true`
 *
 * @param {string} filePath
 * @param {object} [opts]
 * @param {unknown}  [opts.defaultValue]
 * @param {(payload: unknown) => void} [opts.validate]
 * @param {boolean}  [opts.writeDefaultIfMissing=false]
 * @param {boolean}  [opts.restoreMainFromBackup=true]
 * @returns {unknown}
 */
export function readJsonWithRecovery(filePath, {
  defaultValue = null,
  validate = null,
  writeDefaultIfMissing = false,
  restoreMainFromBackup = true,
} = {}) {
  const bak = bakPath(filePath);

  function validated(payload) {
    if (validate) validate(payload);
    return payload;
  }

  function restoreMain(payload) {
    if (!restoreMainFromBackup) return;
    try {
      writeJsonAtomic(filePath, payload, { options: { backup: false } });
    } catch {
      // best-effort — don't mask the original result
    }
  }

  // 1) main exists
  if (existsSync(filePath)) {
    try {
      const payload = readJsonSync(filePath, undefined);
      if (payload === undefined) throw new SyntaxError("empty/unreadable");
      return validated(payload);
    } catch {
      // fall through to .bak
    }

    // 2) main broken, try .bak
    if (existsSync(bak)) {
      try {
        const payload = readJsonSync(bak, undefined);
        if (payload === undefined) throw new SyntaxError("empty/unreadable bak");
        validated(payload);
        restoreMain(payload);
        return payload;
      } catch {
        // .bak also broken — fall through
      }
    }

    // 3) main broken, no usable .bak — forensic-safe: do NOT write
    return defaultValue;
  }

  // 4) main missing, try .bak
  if (existsSync(bak)) {
    try {
      const payload = readJsonSync(bak, undefined);
      if (payload === undefined) throw new SyntaxError("empty/unreadable bak");
      validated(payload);
      restoreMain(payload);
      return payload;
    } catch {
      // .bak broken — fall through
    }
  }

  // 5) both missing
  if (writeDefaultIfMissing) {
    try {
      writeJsonAtomic(filePath, defaultValue, { options: { backup: false } });
    } catch {
      // best-effort
    }
  }

  return defaultValue;
}

// ---------------------------------------------------------------------------
// SettingsManager  (mirrors the Flask SettingsManager from the article)
// ---------------------------------------------------------------------------

const SETTINGS_FILE = "data/store_settings.json";

function defaultSettings() {
  return {
    stores: {},
    _metadata: { created_at: new Date().toISOString() },
  };
}

function validateSettings(payload) {
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    throw new TypeError(`store_settings must be a plain object, got ${typeof payload}`);
  }
}

export class SettingsManager {
  #settings = null;

  reload() {
    const mainExists = existsSync(SETTINGS_FILE);
    const bakExists  = existsSync(bakPath(SETTINGS_FILE));

    this.#settings = readJsonWithRecovery(SETTINGS_FILE, {
      defaultValue: defaultSettings(),
      validate: validateSettings,
      writeDefaultIfMissing: !mainExists && !bakExists,
      restoreMainFromBackup: true,
    });

    if (typeof this.#settings !== "object" || this.#settings === null) {
      this.#settings = defaultSettings();
    }
    return true;
  }

  save() {
    if (!this.#settings._metadata) this.#settings._metadata = {};
    this.#settings._metadata.updated_at = new Date().toISOString();

    writeJsonAtomic(SETTINGS_FILE, this.#settings, {
      validate: validateSettings,
      options: { backup: true, indent: 2 },
    });
    return true;
  }

  get(storeId) {
    return this.#settings?.stores?.[storeId] ?? null;
  }

  set(storeId, data) {
    if (!this.#settings.stores) this.#settings.stores = {};
    this.#settings.stores[storeId] = { ...this.#settings.stores[storeId], ...data };
    this.save();
  }

  getAll() {
    return this.#settings ?? {};
  }
}