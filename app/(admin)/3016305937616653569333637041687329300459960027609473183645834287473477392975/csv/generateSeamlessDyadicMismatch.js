// TODO: confirm the attention-check filter for Seamless Dyadic Mismatch.
// Currently mirrors generateMismatchSpeech.js (Audio|Text + Unmuted).
import { buildPairMap, normalizeCode } from "./pairsLookup"

export function generateSeamlessDyadicMismatch(studiesCSV, videoOrigins, videoMismatch, studiesID, studyConfig, attentionCheckList, pairs, includeAttentionChecks = true) {
  const pairMap = buildPairMap(pairs)
  if (pairMap.size === 0) {
    throw new Error("No matched/mismatched input-code pairs found. Upload the pairs list before generating the study.")
  }
  let pageList = []
  let attentionSubset = []
  if (includeAttentionChecks) {
    attentionCheckList = attentionCheckList.filter((item) => ["Audio", "Text"].includes(item.type) && item.volume === "Unmuted")
    if (attentionCheckList.length < 4) {
      throw new Error("Not enough unmuted attention check videos: Need at least 2 Audio and 2 Text.")
    }
    attentionSubset = attentionCheckList
  }
  const nCheck = attentionSubset.length

  studiesCSV.forEach((studyData, stdIndex) => {
    const step = Math.floor(Array.from(studyData).length / (nCheck + 1))
    let pageIdx = 0
    let attentionCheckIdx = 0
    const totalPageIdx = studyData.length + nCheck
    studyData.forEach((row, rowIndex) => {
      // CSV columns: [clip, system]. The clip is the MATCHED code; its mismatched
      // partner has a different filename, resolved through the 1:1, system-
      // independent pairs map. The matched clip comes from videoOrigins, the
      // mismatched clip (keyed by the partner code) from videoMismatch.
      const inputcode = normalizeCode(row[0])
      const systemname = String(row[1]).replace(/\s+/g, "")

      const mismatchedCode = pairMap.get(inputcode)
      if (!mismatchedCode) {
        throw new Error(`Matched code '${inputcode}' (line ${rowIndex + 1}) has no mismatched pair. Update the pairs list.`)
      }

      const matchedVideo = Array.from(videoOrigins).find((v) => normalizeCode(v.inputcode) === inputcode && v.systemname === systemname)
      const mismatchedVideo = Array.from(videoMismatch).find((v) => normalizeCode(v.inputcode) === mismatchedCode && v.systemname === systemname)

      let sysA, sysB, videoA, videoB
      if (Math.random() < 0.5) {
        // Matched on the left
        sysA = systemname
        sysB = systemname + "_Mismatched"
        videoA = matchedVideo
        videoB = mismatchedVideo
      } else {
        // Matched on the right
        sysA = systemname + "_Mismatched"
        sysB = systemname
        videoA = mismatchedVideo
        videoB = matchedVideo
      }

      if (!videoA || !videoB) {
        throw new Error(
          `Missing video for system '${systemname}' on line ${rowIndex + 1}: matched '${inputcode}' or mismatched '${mismatchedCode}' not found in the uploaded pools.`
        )
      }

      pageList.push({
        type: "video",
        studyid: studiesID[stdIndex],
        name: `Page ${pageIdx + 1} of ${totalPageIdx}`,
        question: studyConfig.question,
        selected: JSON.stringify({}),
        actions: JSON.stringify([]),
        options: studyConfig.options,
        system1: sysA,
        system2: sysB,
        video1: videoA.id,
        video2: videoB.id,
        expected_vote: "null",
      })
      pageIdx++

      if ((rowIndex + 1) % step === 0 && attentionCheckIdx < nCheck) {
        const item = attentionSubset[attentionCheckIdx]

        pageList.push({
          type: "check",
          studyid: studiesID[stdIndex],
          name: `Page ${pageIdx + 1} of ${totalPageIdx}`,
          question: studyConfig.question,
          selected: JSON.stringify({}),
          actions: JSON.stringify([]),
          options: studyConfig.options,
          system1: "AttentionCheck",
          system2: "AttentionCheck",
          video1: item.videoid1,
          video2: item.videoid2,
          expected_vote: item.expected_vote,
        })
        attentionCheckIdx++
        pageIdx++
      }
    })
  })

  return pageList
}
