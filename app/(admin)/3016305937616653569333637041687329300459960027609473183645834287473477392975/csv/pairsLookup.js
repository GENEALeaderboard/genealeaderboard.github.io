// Shared helpers for matched-mismatched input-code pairs, used by the seamless
// dyadic/speech mismatch page generators. Matched and mismatched stimuli no
// longer share a filename: the mismatched code is looked up from the uploaded
// pairs list (GET /api/inputcode-pairs?type=…), which is a strict 1:1
// matched→mismatched map and system-independent.

// Normalizes an input code for comparison: strips whitespace and a trailing file
// extension (e.g. ".mp4"). Must mirror normalizeCode in geneaapi's
// inputCodePairsConfig.js so codes compare equal regardless of extension.
export function normalizeCode(code) {
  return String(code).trim().replace(/\s+/g, "").replace(/\.[^.]+$/, "")
}

// Builds a Map<matchedCode, mismatchedCode> from the pairs API payload
// ([{ matched, mismatched }]). Codes are normalized on both sides. Throws if the
// same matched code appears twice, since the mapping must be strictly 1:1.
export function buildPairMap(pairs) {
  const map = new Map()
  for (const { matched, mismatched } of pairs || []) {
    const m = normalizeCode(matched)
    const mm = normalizeCode(mismatched)
    if (!m || !mm) continue
    if (map.has(m) && map.get(m) !== mm) {
      throw new Error(`Matched code '${m}' is paired with more than one mismatched code — pairs must be 1:1.`)
    }
    map.set(m, mm)
  }
  return map
}
