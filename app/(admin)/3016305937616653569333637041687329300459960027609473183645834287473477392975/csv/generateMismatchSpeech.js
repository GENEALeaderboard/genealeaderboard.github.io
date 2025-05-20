import { N_ATTENTION_CHECK_PER_STUDY } from "@/config/constants"
import { getRandomSubset } from "@/utils/randomSubset"

// Utility to shuffle an array in-place
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

export function generateMismatchSpeech(studiesCSV, videoOrigins, videoMismatch, studiesID, studyConfig, attentionCheckList) {
  let pageList = []
  // Assuming ObjectList is your original array
  const audioUnmuted = attentionCheckList.filter(item => item.type === "Audio" && item.volume === "Unmuted");
  const textUnmuted = attentionCheckList.filter(item => item.type === "Text" && item.volume === "Unmuted");

  if (audioUnmuted.length < 2 || textUnmuted.length < 2) {
    throw new Error("Not enough unmuted attention check videos: Need at least 2 Audio and 2 Text.");
  }

  attentionCheckList = [
    ...shuffleArray(audioUnmuted).slice(0, 2),
    ...shuffleArray(textUnmuted).slice(0, 2),
  ]

  const attentionSubset = getRandomSubset(attentionCheckList, Math.min(studiesCSV.length, N_ATTENTION_CHECK_PER_STUDY))
  const nCheck = attentionSubset.length

  console.log("nCheck", nCheck, attentionsubset)
  studiesCSV.forEach((studyData, stdIndex) => {
    const step = Math.floor(Array.from(studyData).length / (nCheck + 1))
    let pageIdx = 0
    let attentionCheckIdx = 0
    const totalPageIdx = studyData.length + nCheck
    studyData.forEach((row, rowIndex) => {
      const inputcode1 = String(row[0]).replace(/\s+/g, "")
      const systemname = String(row[1]).replace(/\s+/g, "")
      const inputcode2 = String(row[2]).replace(/\s+/g, "")

      const videoFilteredA = Array.from(videoOrigins).filter((video) => video.inputcode === inputcode1 && video.systemname === systemname)
      const videoFilteredB = Array.from(videoMismatch).filter((video) => video.inputcode === inputcode2 && video.systemname === systemname)
      const videoA = videoFilteredA[0]
      const videoB = videoFilteredB[0]

      if (!videoA || !videoB) {
        console.log("videoA", videoA, "videoB", videoB)
        return []
      }

      if (videoA.length === 0 || videoB.length === 0) {
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
        system1: systemname,
        system2: systemname,
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
