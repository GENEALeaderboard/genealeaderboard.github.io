// TODO: confirm the attention-check filter for Seamless Semantic Mismatch.
// Currently mirrors generateMismatchSpeech.js (Audio|Text + Unmuted).
export function generateSeamlessSemanticMismatch(studiesCSV, videoOrigins, videoMismatch, studiesID, studyConfig, attentionCheckList, includeAttentionChecks = true) {
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
      const inputcode1 = String(row[0]).replace(/\s+/g, "")
      const systemname = String(row[1]).replace(/\s+/g, "")
      const inputcode2 = String(row[2]).replace(/\s+/g, "")

      let sysA, sysB, videoFilteredA, videoFilteredB, videoA, videoB

      if (Math.random() < 0.5) {
        sysA = systemname
        sysB = systemname + "_Mismatched"
        videoFilteredA = Array.from(videoOrigins).filter((v) => v.inputcode === inputcode1 && v.systemname === systemname)
        videoFilteredB = Array.from(videoMismatch).filter((v) => v.inputcode === inputcode2 && v.systemname === systemname)
        videoA = videoFilteredA[0]
        videoB = videoFilteredB[0]
      } else {
        sysA = systemname + "_Mismatched"
        sysB = systemname
        videoFilteredA = Array.from(videoMismatch).filter((v) => v.inputcode === inputcode1 && v.systemname === systemname)
        videoFilteredB = Array.from(videoOrigins).filter((v) => v.inputcode === inputcode2 && v.systemname === systemname)
        videoA = videoFilteredA[0]
        videoB = videoFilteredB[0]
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
