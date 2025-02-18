import { memo } from "react"

const AttentionCheckList = memo(function AttentionCheckList({ attentionCheckList }) {
  if (!attentionCheckList || attentionCheckList.length <= 0) {
    return <></>
  }

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b py-4 text-left dark:border-neutral-700 ">
          <th className="py-2 pl-6 font-semibold">#ID</th>
          <th className="py-2 pl-6 font-semibold">URL1</th>
          <th className="py-2 pl-6 font-semibold">Video ID 1</th>
          <th className="py-2 pl-6 font-semibold">URL2</th>
          <th className="py-2 pl-6 font-semibold">Video ID 2</th>
          <th className="py-2 pl-6 font-semibold">Expected Vote</th>
          <th className="py-2 pl-6 font-semibold">Created At</th>
        </tr>
      </thead>
      <tbody className="align-baseline text-gray-900 dark:text-gray-100">
        {attentionCheckList &&
          attentionCheckList.map((attetionCheck, index) => {
            return (
              <tr key={index} className="border-b border-gray-100 dark:border-neutral-700/50 align-middle">
                <td className="py-2 pl-6">{index + 1}</td>
                <td className="py-2 pl-6">
                  <div className="w-72 overflow-hidden text-ellipsis truncate">
                    <code className="">{attetionCheck.url1}</code>
                  </div>
                </td>
                <td className="py-2 pl-6 min-w-24">{attetionCheck.videoid1}</td>
                <td className="py-2 pl-6 h-14">
                  <div className="w-72 overflow-hidden text-ellipsis truncate">
                    <code className="">{attetionCheck.url2}</code>
                  </div>
                </td>
                <td className="py-2 pl-6 h-14 min-w-24">{attetionCheck.videoid2}</td>
                <td className="py-2 pl-6 h-14">{attetionCheck.expected_vote}</td>
                <td className="py-2 pl-6">
                  <div className="truncate overflow-hidden text-ellipsis">{attetionCheck.createdat}</div>
                </td>
              </tr>
            )
          })}
      </tbody>
    </table>
  )
})

export default AttentionCheckList
