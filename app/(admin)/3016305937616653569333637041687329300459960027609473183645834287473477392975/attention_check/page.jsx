"use client"

import axios from "axios"
import useSWR from "swr"
import UploadAttetionCheck from "./UploadAttentionCheck"
import { useEffect, useState } from "react"
import { Loading } from "@/components"
import { apiFetcherData } from "@/utils/fetcher"
import CircleLoading from "@/icons/circleloading"

export default function Page() {
  return (
    <>
      <h2 className="font-semibold tracking-tight text-slate-900 dark:text-slate-100 mt-10 border-b pb-1 text-3xl border-neutral-200/70 contrast-more:border-neutral-400 dark:border-primary-100/10 contrast-more:dark:border-neutral-400">
        Attention Check Videos
      </h2>
      <ul className="mt-6 list-disc first:mt-0 ltr:ml-6 rtl:mr-6">
        <li className="my-2">
          <code>LeftClearlyBetter_Type_Volume</code> | <code>LeftSlightlyBetter_Type_Volume</code> | <code>TheyAreEqual_Type_Volume</code> | <code>RightSlightlyBetter_Type_Volume</code> | <code>RightClearlyBetter_Type_Volume</code>
        </li>
        <li className="my-2">
          <code>Reference</code>
        </li>
        <li className="my-2">
          <code>Type = Audio or Text</code>
        </li>
        <li className="my-2">
          <code>Volume = Muted or Unmuted</code>
        </li>
      </ul>

      <h4 className="font-semibold tracking-tight text-slate-900 dark:text-slate-100 mt-8 text-xl">Attention Check structure</h4>
      <div className="nextra-code relative mt-6 first:mt-0">
        <pre
          className="overflow-x-auto subpixel-antialiased text-[.9em] dark:bg-black py-4 ring-1 ring-inset ring-gray-300 dark:ring-neutral-700 contrast-more:ring-gray-900 contrast-more:dark:ring-gray-50 contrast-more:contrast-150 rounded-md"
          tabIndex="0"
          data-word-wrap=""
        >
          <code className="nextra-code" dir="ltr">
            <span>
              <span>/videos/attentioncheck/&lt;1_LeftClearlyBetter_Audio_Unmuted&gt;.mp4</span>
            </span>
            <span>
              <span>/videos/attentioncheck/&lt;1_Reference&gt;.mp4</span>
            </span>
            <span>
              <span>/videos/attentioncheck/&lt;2_LeftSlightlyBetter_Text_Muted&gt;.mp4</span>
            </span>
            <span>
              <span>/videos/attentioncheck/&lt;2_Reference&gt;.mp4</span>
            </span>
            <span>
              <span>/videos/attentioncheck/&lt;3_TheyAreEqual_Text_Unmuted&gt;.mp4</span>
            </span>
            <span>
              <span>/videos/attentioncheck/&lt;3_Reference&gt;.mp4</span>
            </span>
          </code>
        </pre>
      </div>
      <h4 className="font-semibold tracking-tight text-slate-900 dark:text-slate-100 mt-8 text-xl">Upload Attention Check Video</h4>
      <div className="mt-6 mb-32">
        <UploadAttetionCheck />
      </div>
    </>
  )
}
