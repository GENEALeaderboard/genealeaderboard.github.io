import { memo } from "react"

const SystemList = memo(function SystemList({ systems }) {
  if (!systems || systems.length <= 0) {
    return <></>
  }

  console.log("systems", systems)
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b py-4 text-left dark:border-neutral-700 ">
          <th className="py-2 pl-6 font-semibold">#ID</th>
          <th className="py-2 pl-6 font-semibold">Type</th>
          <th className="py-2 pl-6 font-semibold">System name</th>
          <th className="py-2 pl-6 font-semibold">Submission</th>
          <th className="py-2 pl-6 font-semibold">Email</th>
          <th className="py-2 pl-6 font-semibold">Description</th>
        </tr>
      </thead>
      <tbody className="align-baseline text-gray-900 dark:text-gray-100">
        {systems &&
          systems.map((system, index) => {
            let systemName = "GENEA"
            let emailSystem = ""
            if (system.submissionid !== 0 && system.submissionid !== null) {
              const submittedDate = new Date(system.createdat).toISOString().split("T")[0]
              systemName = `${system.teamname} (${submittedDate})`
              emailSystem = system.email
            }

            return (
              <tr key={index} className="border-b border-gray-100 dark:border-neutral-700/50 align-middle">
                <td className="py-2 pl-6">{index + 1}</td>
                <td className="py-2 pl-6">{system.type}</td>
                <td className="py-2 pl-6 font-bold">{system.name}</td>
                <td className="py-2 pl-6 h-14">{systemName}</td>
                <td className="py-2 pl-6 h-14">{emailSystem}</td>
                <td className="py-2 pl-6">{system.description}</td>
              </tr>
            )
          })}
      </tbody>
    </table>
  )
})

export default SystemList
