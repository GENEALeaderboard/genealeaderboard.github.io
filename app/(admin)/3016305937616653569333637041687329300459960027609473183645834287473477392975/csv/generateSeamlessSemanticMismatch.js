import { UPLOAD_API_ENDPOINT } from "@/config/constants"

const VIDEO_TYPE = "seamless-semantic-origin"

// The correct text description for a video lives in a .txt next to it in R2,
// at a deterministic key. We read it through the upload worker (which sets the
// right CORS headers) rather than hitting the public R2 URL directly.
async function fetchCorrectText(systemname, inputcode) {
  const key = `videos/${VIDEO_TYPE}/${systemname}/${inputcode}.txt`
  const res = await fetch(`${UPLOAD_API_ENDPOINT}/api/text?key=${encodeURIComponent(key)}`, { credentials: "include" })
  const json = await res.json().catch(() => null)
  if (!res.ok || !json || !json.success || !json.data || typeof json.data.text !== "string") {
    throw new Error(`Missing text description (${key}). Upload a .txt for system ${systemname}, segment ${inputcode}.`)
  }
  return json.data.text.trim()
}

// Semantic mismatch: one video per page, shown with two text descriptions — the
// correct one (from the video's .txt) and the mismatched one (from the CSV). The
// rater picks which description matches; `expected_vote` marks the correct side.
//
// CSV columns: [model, clip_name (inputcode), mismatched_text].
export async function generateSeamlessSemanticMismatch(studiesCSV, videoSemantic, studiesID, studyConfig, attentionCheckList, includeAttentionChecks = true) {
  const pageList = []
  let attentionSubset = []
  if (includeAttentionChecks) {
    // Text-based semantic checks carry their own expected + distractor descriptions.
    attentionCheckList = attentionCheckList.filter((item) => item.correct_text && item.distractor_text)
    if (attentionCheckList.length < 1) {
      throw new Error("No semantic attention checks found. Upload at least one (video + expected text + distractor text).")
    }
    attentionSubset = attentionCheckList
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
      const inputcode = String(row[1]).replace(/\s+/g, "")
      const mismatchedText = String(row[2] ?? "").trim()

      const video = Array.from(videoSemantic).find((v) => v.inputcode === inputcode && v.systemname === systemname)
      if (!video) {
        throw new Error(`No video found for system ${systemname}, segment ${inputcode} (line ${rowIndex + 1}).`)
      }

      const correctText = await fetchCorrectText(systemname, inputcode)

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
        // Expected (correct) description vs the authored distractor, random side.
        const correctOnLeftCheck = Math.random() < 0.5
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
            leftText: correctOnLeftCheck ? item.correct_text : item.distractor_text,
            rightText: correctOnLeftCheck ? item.distractor_text : item.correct_text,
          }),
          system1: "AttentionCheck",
          system2: "AttentionCheck",
          // One video is shown; both slots point to it so fetchStudy resolves it.
          video1: item.videoid1,
          video2: item.videoid1,
          expected_vote: correctOnLeftCheck ? "LeftClearlyBetter" : "RightClearlyBetter",
        })
        attentionCheckIdx++
        pageIdx++
      }
    }
  }

  return pageList
}
