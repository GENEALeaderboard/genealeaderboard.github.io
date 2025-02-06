import React from "react"
import { Loading } from "@/components"
import { Status } from "./Status"
import ScreenInfo from "./ScreenInfo"
import ActionList from "@/components/actionlist"

export default function Study({ loading, studies }) {
  if (loading) {
    return (
      <div className="flex w-full p-32 justify-center">
        <Loading />
      </div>
    )
  }

  return (
    <table className="table-auto border-collapse text-sm">
      <thead>
        <tr className="border-b py-4 text-left dark:border-neutral-700">
          <th className="p-2 font-semibold">ID</th>
          <th className="p-2 font-semibold">Status</th>
          <th className="p-2 font-semibold">Status</th>
          <th className="p-2 font-semibold">Global Actions</th>
        </tr>
      </thead>
      <tbody className="align-baseline text-gray-900 dark:text-gray-100">
        {studies.map((study, index) => (
          <tr
            key={index}
            className="border-b border-gray-100 dark:border-neutral-700/50"
          >
            <td className="p-2">{index + 1}</td>
            <td className="p-2">
              <Status type={study.status} />
            </td>
            <td className="p-2 h-24 flex-grow w-full">
              <div className="overflow-y-auto nextra-code flex-grow pr-2 relative mt-6 first:mt-0 flex flex-col gap-2 h-96">
                {study.pages.map((page, index) => (
                  <ScreenInfo info={page} key={index} />
                ))}
              </div>
            </td>
            <td className="p-2 h-24">
              <div className="min-w-72 max-h-96 overflow-x-auto">
                {study.global_actions && study.global_actions.length > 0 && (
                  <ActionList actions={study.global_actions} />
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
