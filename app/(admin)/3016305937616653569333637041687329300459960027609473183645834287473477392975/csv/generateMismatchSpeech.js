import { N_ATTENTION_CHECK_PER_STUDY } from "@/config/constants"
import { getRandomSubset } from "@/utils/randomSubset"

export function generateMismatchSpeech(studiesCSV, videos, studiesID, studyConfig, attentionCheckList) {
  const pageList = []
  const attentionSubset = getRandomSubset(attentionCheckList, Math.min(studiesCSV.length, N_ATTENTION_CHECK_PER_STUDY))
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

      console.log("videos", videos)

      const videoFilteredA = Array.from(videos).filter((video) => video.inputcode === inputcode1 && video.systemname === systemname)
      const videoFilteredB = Array.from(videos).filter((video) => video.inputcode === inputcode2 && video.systemname === systemname)
      const videoA = videoFilteredA[0]
      const videoB = videoFilteredB[0]

      if (!videoA || !videoB) {
        console.log("videoA", videoA, "videoB", videoB)
        // setGenState({ type: "error", msg: `Video not found for ${inputcode} ${sysA} ${sysB}` })
        return []
      }

      if (videoA.length === 0 || videoB.length === 0) {
        console.log("videoA", videoA, "videoB", videoB)
        //     setGenState({ type: "error", msg: `Video not found for ${inputcode} ${sysA} ${sysB}` })
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

      console.log("rowIndex", rowIndex, "step", step, "rowIndex + 1) % step ", (rowIndex + 1) % step)

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
