"use client"

import React, { useEffect, useState } from "react"
import Study from "./User"
import cn from "clsx"
import ActionList from "@/components/actionlist"
import axios from "axios"

export default function Page() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchUsers() {
    const res = await axios.get("/api/studies")
    console.log(res)
    if (res.data.success) {
      console.log("res.data.studies", res.data.studies)
      const users = res.data.studies.map((study) => ({
        prolific_userid: study.prolific_userid,
        prolific_studyid: study.prolific_studyid,
        prolific_sessionid: study.prolific_sessionid,
        completion_code: study.completion_code,
        total_actions: study.total_actions,
      }))

      setUsers(users)
    } else {
      console.error(res.error)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <div>
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        Prolific Participants
      </h1>
      <p className="mt-6 leading-7 first:mt-0">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.
      </p>
      <h2 className="font-semibold tracking-tight text-slate-900 dark:text-slate-100 mt-10 border-b pb-1 text-3xl border-neutral-200/70 contrast-more:border-neutral-400 dark:border-primary-100/10 contrast-more:dark:border-neutral-400">
        All Prolific participants screen
      </h2>

      <div className={cn("-mx-6 mb-4 mt-6  px-6 pb-4 ")}>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b py-4 text-left dark:border-neutral-700">
              <th className="py-2 font-semibold">ID</th>
              <th className="py-2 font-semibold">Prolific UserID</th>
              <th className="py-2 pl-6 font-semibold">Prolific StudyID</th>
              <th className="px-6 py-2 font-semibold">SessionID</th>
              <th className="px-6 py-2 font-semibold">Completion Code</th>
              <th className="px-6 py-2 font-semibold">Total Actions</th>
            </tr>
          </thead>
          <tbody className="align-baseline text-gray-900 dark:text-gray-100">
            {users.map((user, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 dark:border-neutral-700/50"
              >
                <td className="py-2 pl-6">{index + 1}</td>
                <td className="py-2 pl-6">{user.prolific_userid}</td>
                <td className="py-2 pl-6">{user.prolific_studyid}</td>
                <td className="py-2 pl-6">{user.prolific_sessionid}</td>
                <td className="py-2 pl-6">{user.completion_code}</td>
                <td className="py-2 pl-6 h-24">
                  <div className="w-full overflow-y-auto">
                    <ActionList actions={user.total_actions} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
