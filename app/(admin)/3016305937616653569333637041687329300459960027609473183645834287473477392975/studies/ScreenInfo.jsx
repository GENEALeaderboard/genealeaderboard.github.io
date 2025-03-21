import React from "react"
import cn from "clsx"
import ActionList from "@/components/actionlist"

export default function ScreenInfo({ info }) {
  const colors = {
    generic: "border-green-200 bg-green-100",
    video: "border-red-200 bg-red-100",
    check: "border-blue-200 bg-blue-100",
    finish: "border-orange-200 bg-orange-100",
  }
  return (
    <div className={cn("flex gap-1 flex-col border p-2 rounded-lg", colors[info.type])}>
      <div className="">
        PageID: <code className="nextra-code">{info.id}</code>
      </div>
      <div className="">
        Type: <code className="nextra-code">{info.type}</code>
      </div>
      <div className="text-wrap w-full">
        Name: <code className="nextra-code text-wrap">{info.name}</code>
      </div>
      <div className="text-wrap w-full">
        Question: <code className="nextra-code text-wrap">{info.question}</code>
      </div>
      <div className="">
        Video:
        <div className="flex flex-col gap-2">
          {info.video1 && (
            <div className="border border-gray-300 bg-gray-200 p-2 rounded-lg flex gap-1 flex-col">
              <div className="">
                System : <code className="nextra-code">{info.video1.systemname}</code>
              </div>
              <div className="">
                InputID : <code className="nextra-code">{info.video1.inputcode}</code>
              </div>
              <div className="">
                Path : <code className="nextra-code">{info.video1.path}</code>
              </div>
              <div className="flex gap-2">
                <span>URL: </span>
                <a
                  href={info.video1.url}
                  className="w-72 overflow-hidden text-ellipsis whitespace-nowrap text-primary-600 underline decoration-from-font [text-underline-position:from-font]"
                >
                  {info.video1.url}
                </a>
              </div>
            </div>
          )}
          {info.video1 && (
            <div className="border border-gray-300 bg-gray-200 p-2 rounded-lg ">
              <div className="">
                System: <code className="nextra-code">{info.video2.systemname}</code>
              </div>
              <div className="">
                InputID: <code className="nextra-code">{info.video2.inputcode}</code>
              </div>
              <div className="">
                Path: <code className="nextra-code">{info.video2.path}</code>
              </div>
              <div className="flex gap-2 w-full">
                <span>URL: </span>
                <a
                  href={info.video2.url}
                  className="w-72 overflow-hidden text-ellipsis whitespace-nowrap text-primary-600 underline decoration-from-font [text-underline-position:from-font]"
                >
                  {info.video2.url}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="">
        Local actions :
        <ActionList actions={JSON.parse(info.actions)} />
      </div>
    </div>
  )
}
