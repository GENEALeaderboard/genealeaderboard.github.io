import { UPLOAD_API_ENDPOINT } from "@/config/constants"
import { buildPairMap, normalizeCode } from "./pairsLookup"

const VIDEO_TYPE = "seamless-semantic-origin"

// The four real votes a semantic attention check can expect. Rows authored with
// the current upload page store one of these in `expected_vote`; older rows
// stored the sentinel "TextChoice" and encoded the answer purely by which side
// held `correct_text`.
const SEMANTIC_VOTES = new Set(["LeftClearlyBetter", "RightClearlyBetter", "BothExpressed", "NeitherExpressed"])

// Turns one stored attentioncheck row into the {leftText, rightText, expectedVote}
// shown on a check page. The left/right texts are randomly swapped to avoid a
// fixed layout; a Left/Right expected vote is flipped to follow the swap, while
// Both/Neither are position-independent.
function resolveSemanticCheck(item) {
  const swap = Math.random() < 0.5

  if (SEMANTIC_VOTES.has(item.expected_vote)) {
    // New model: correct_text = authored left, distractor_text = authored right.
    let expectedVote = item.expected_vote
    if (swap && expectedVote === "LeftClearlyBetter") expectedVote = "RightClearlyBetter"
    else if (swap && expectedVote === "RightClearlyBetter") expectedVote = "LeftClearlyBetter"
    return {
      leftText: swap ? item.distractor_text : item.correct_text,
      rightText: swap ? item.correct_text : item.distractor_text,
      expectedVote,
    }
  }

  // Legacy model: correct_text is the right answer, distractor_text is the decoy;
  // the expected vote is whichever side the correct description lands on.
  return {
    leftText: swap ? item.distractor_text : item.correct_text,
    rightText: swap ? item.correct_text : item.distractor_text,
    expectedVote: swap ? "RightClearlyBetter" : "LeftClearlyBetter",
  }
}

// The correct-text descriptions are system-independent (one per input code) and
// uploaded on the Input Codes page, so they live in a shared `_texts` folder in
// R2 keyed by input code. Read through the upload worker (correct CORS headers)
// rather than hitting the public R2 URL directly. Results are cached per input
// code so a code shared across systems is only fetched once.
const correctTextCache = new Map()

async function fetchCorrectText(inputcode) {
  if (correctTextCache.has(inputcode)) return correctTextCache.get(inputcode)

  const key = `videos/${VIDEO_TYPE}/_texts/${inputcode}.txt`
  const res = await fetch(`${UPLOAD_API_ENDPOINT}/api/text?key=${encodeURIComponent(key)}`, { credentials: "include" })
  const json = await res.json().catch(() => null)
  if (!res.ok || !json || !json.success || !json.data || typeof json.data.text !== "string") {
    throw new Error(`Missing text description for input code '${inputcode}'. Upload its .txt on the Input Codes page.`)
  }
  const text = json.data.text.trim()
  const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 0)
  if (lines.length !== 1) {
    throw new Error(
      `Text description for input code '${inputcode}' must be a single line but contains ${lines.length} line(s). ` +
      `Found:\n${text}\n\nPlease re-upload a corrected .txt file with exactly one line of text.`
    )
  }
  correctTextCache.set(inputcode, lines[0])
  return lines[0]
}

// Semantic mismatch: one video per page, shown with two text descriptions — the
// correct one (the clip's own .txt) and a distractor. The distractor is the text
// description of the clip's paired code, from the matched-mismatched pairs list
// (uploaded on the Descriptions & pairs page). The rater picks which description
// matches; `expected_vote` marks the correct side.
//
// CSV columns: [model, clip_name (inputcode)]. The mismatched/distractor clip is
// resolved from the pairs map, not the CSV.
export async function generateSeamlessSemanticMismatch(studiesCSV, videoSemantic, studiesID, studyConfig, attentionCheckList, pairs, includeAttentionChecks = true) {
  const pairMap = buildPairMap(pairs)
  if (pairMap.size === 0) {
    throw new Error("No matched/mismatched pairs found. Upload the pairs list on the Descriptions & pairs page before generating the study.")
  }

  // Index videos once by `systemname|inputcode` so the per-row lookup below is a
  // Map hit instead of a linear scan of the whole pool on every row.
  const videoByKey = new Map()
  for (const v of Array.from(videoSemantic)) {
    videoByKey.set(`${v.systemname}|${normalizeCode(v.inputcode)}`, v)
  }

  // Warm the correct-text cache for every code we'll need — the clip's own code
  // plus its paired (distractor) code — in one parallel batch. Without this the
  // loop awaits each `.txt` fetch serially, so generation cost was one R2
  // round-trip per unique code, in series. Fetch concurrently up front; the
  // in-loop fetchCorrectText calls then hit the cache instantly.
  const codesToPrefetch = new Set()
  for (let stdIndex = 0; stdIndex < studiesCSV.length; stdIndex++) {
    for (const row of Array.from(studiesCSV[stdIndex])) {
      const code = normalizeCode(row[1])
      codesToPrefetch.add(code)
      const paired = pairMap.get(code)
      if (paired) codesToPrefetch.add(paired)
    }
  }
  await Promise.all(Array.from(codesToPrefetch).map((code) => fetchCorrectText(code)))

  const pageList = []
  let attentionSubset = []
  if (includeAttentionChecks) {
    const total = Array.isArray(attentionCheckList) ? attentionCheckList.length : 0
    // Text-based semantic checks carry their two descriptions in correct_text
    // (left) and distractor_text (right) columns.
    attentionSubset = (attentionCheckList || []).filter((item) => item.correct_text && item.distractor_text)
    if (attentionSubset.length < 1) {
      throw new Error(
        total > 0
          ? `Found ${total} attention-check row(s), but none have both descriptions. The attentioncheck.correct_text/distractor_text columns are likely missing from D1 — apply the migration and re-upload the checks.`
          : "No semantic attention checks found for this study. Upload at least one (video + two descriptions + expected vote)."
      )
    }
  }
  const nCheck = attentionSubset.length

  for (let stdIndex = 0; stdIndex < studiesCSV.length; stdIndex++) {
    const studyData = Array.from(studiesCSV[stdIndex])
    const step = Math.floor(studyData.length / (nCheck + 1))
    let pageIdx = 0
    let attentionCheckIdx = 0
    const totalPageIdx = studyData.length + nCheck

    for (let rowIndex = 0; rowIndex < studyData.length; rowIndex++) {
      const row = studyData[rowIndex]
      const systemname = String(row[0]).replace(/\s+/g, "")
      const inputcode = normalizeCode(row[1])

      const mismatchedCode = pairMap.get(inputcode)
      if (!mismatchedCode) {
        throw new Error(`Clip '${inputcode}' (line ${rowIndex + 1}) has no mismatched pair. Update the pairs list.`)
      }

      const video = videoByKey.get(`${systemname}|${inputcode}`)
      if (!video) {
        throw new Error(`No video found for system ${systemname}, segment ${inputcode} (line ${rowIndex + 1}).`)
      }

      // Correct = the clip's own description; distractor = the paired clip's description.
      const correctText = await fetchCorrectText(inputcode)
      const mismatchedText = await fetchCorrectText(mismatchedCode)

      // Randomize which side holds the correct description.
      const correctOnLeft = Math.random() < 0.5
      const leftText = correctOnLeft ? correctText : mismatchedText
      const rightText = correctOnLeft ? mismatchedText : correctText

      pageList.push({
        type: "video",
        studyid: studiesID[stdIndex],
        name: `Page ${pageIdx + 1} of ${totalPageIdx}`,
        question: studyConfig.question,
        selected: JSON.stringify({}),
        actions: JSON.stringify([]),
        // The two descriptions ride along in `options` (parsed by the study app).
        options: JSON.stringify({ kind: "semantic-choice", leftText, rightText }),
        system1: correctOnLeft ? systemname : `${systemname}_Mismatched`,
        system2: correctOnLeft ? `${systemname}_Mismatched` : systemname,
        // Single video shown on both slots so fetchStudy resolves it to the same object.
        video1: video.id,
        video2: video.id,
        expected_vote: correctOnLeft ? "LeftClearlyBetter" : "RightClearlyBetter",
      })
      pageIdx++

      if (step > 0 && (rowIndex + 1) % step === 0 && attentionCheckIdx < nCheck) {
        const item = attentionSubset[attentionCheckIdx]
        const { leftText: checkLeft, rightText: checkRight, expectedVote: checkVote } = resolveSemanticCheck(item)
        pageList.push({
          type: "check",
          studyid: studiesID[stdIndex],
          name: `Page ${pageIdx + 1} of ${totalPageIdx}`,
          question: studyConfig.question,
          selected: JSON.stringify({}),
          actions: JSON.stringify([]),
          // Same one-video + two-description shape as a task page.
          options: JSON.stringify({
            kind: "semantic-choice",
            leftText: checkLeft,
            rightText: checkRight,
          }),
          system1: "AttentionCheck",
          system2: "AttentionCheck",
          // One video is shown; both slots point to it so fetchStudy resolves it.
          video1: item.videoid1,
          video2: item.videoid1,
          expected_vote: checkVote,
        })
        attentionCheckIdx++
        pageIdx++
      }
    }
  }

  return pageList
}
