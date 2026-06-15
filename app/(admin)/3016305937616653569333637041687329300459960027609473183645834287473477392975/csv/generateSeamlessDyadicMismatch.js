// TODO: confirm the attention-check filter for Seamless Dyadic Mismatch.
// Currently mirrors generateMismatchSpeech.js (Audio|Text + Unmuted).
export function generateSeamlessDyadicMismatch(studiesCSV, videoOrigins, videoMismatch, studiesID, studyConfig, attentionCheckList, includeAttentionChecks = true) {
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
      // CSV columns: [clip, system]. Matched and mismatched videos share the same
      // filename (one per input code), so a single code resolves both sides — the
      // matched clip from videoOrigins, the mismatched clip from videoMismatch.
      const inputcode = String(row[0]).replace(/\s+/g, "")
      const systemname = String(row[1]).replace(/\s+/g, "")

      const matchedVideo = Array.from(videoOrigins).find((v) => v.inputcode === inputcode && v.systemname === systemname)
      const mismatchedVideo = Array.from(videoMismatch).find((v) => v.inputcode === inputcode && v.systemname === systemname)

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
        console.log("videoA", videoA, "videoB", videoB)
        return []
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
