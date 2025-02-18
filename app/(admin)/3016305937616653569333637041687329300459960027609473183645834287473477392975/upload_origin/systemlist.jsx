import { Description, Field, Label, Select } from "@headlessui/react"
import { Fragment, useState } from "react"
import { clsx as cn } from "clsx"
import { ArrowLeftIcon, ArrowRightIcon } from "@/nextra/icons"
import { Callout } from "@/nextra"

export default function SystemList({ systemList, selectedIndex, setSelectedIndex }) {
  if (!systemList) {
    return <Callout type="error">Not found any submitted system</Callout>
  }
  return (
    <div className="relative items-center align-middle flex-grow">
      <Select
        name="status"
        onChange={(e) => setSelectedIndex(e.target.value)}
        className={cn(
          "w-full appearance-none rounded-md border border-[#666666]  px-4 py-2 text-base text-gray-900 placeholder-gray-500 focus:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 dark:border-[#888888] dark:bg-transparent dark:text-white dark:focus:border-white sm:text-sm"
        )}
      >
        {({ focus, hover }) => (
          <>
            {systemList.map((sys, index) => (
              <option
                key={index}
                className="text-gray-800 dark:text-gray-100 relative cursor-pointer whitespace-nowrap py-1.5 transition-colors ltr:pl-3 ltr:pr-9 rtl:pr-3 rtl:pl-9"
                value={index}
              >
                {sys.name}
              </option>
            ))}
          </>
        )}
      </Select>
      <ArrowLeftIcon className="pointer-events-none absolute top-2.5 right-2.5 size-5  ltr:rotate-90" aria-hidden="true" />
    </div>
  )
}
