import ActionList from "@/components/actionlist"
import CircleLoading from "@/icons/circleloading"

export default function ParticipantList({ loading, participants }) {
  if (loading) {
    return (
      <div className="w-full px-12  justify-center">
        <p className="flex justify-center p-4 gap-2">
          <CircleLoading />
          Loading ...
        </p>
      </div>
    )
  }

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b py-4 text-left dark:border-neutral-700">
          <th className="py-2 font-semibold">ID</th>
          <th className="py-2 font-semibold">Prolific UserID</th>
          <th className="py-2 pl-6 font-semibold">Prolific StudyID</th>
          <th className="px-6 py-2 font-semibold">SessionID</th>
          <th className="px-6 py-2 font-semibold">Completion Code</th>
          <th className="px-6 py-2 font-semibold">Failed Code</th>
          <th className="px-6 py-2 font-semibold">Total Actions</th>
        </tr>
      </thead>
      <tbody className="align-baseline text-gray-900 dark:text-gray-100">
        {participants.map((participant, index) => (
          <tr key={index} className="border-b border-gray-100 dark:border-neutral-700/50">
            <td className="py-2 pl-6">{index + 1}</td>
            <td className="py-2 pl-6">{participant.prolific_userid}</td>
            <td className="py-2 pl-6">{participant.prolific_studyid}</td>
            <td className="py-2 pl-6">{participant.prolific_sessionid}</td>
            <td className="py-2 pl-6">{participant.completion_code}</td>
            <td className="py-2 pl-6">{participant.fail_code}</td>
            <td className="py-2 pl-6 h-24">
              <div className="w-full overflow-y-auto">
                <ActionList actions={JSON.parse(participant.global_actions)} />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
