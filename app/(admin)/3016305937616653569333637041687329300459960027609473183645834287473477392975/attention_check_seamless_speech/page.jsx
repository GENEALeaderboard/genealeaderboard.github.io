"use client"

import UploadAttetionCheck from "../attention_check/UploadAttentionCheck"
import UploadPairedAttentionCheck from "../attention_check/UploadPairedAttentionCheck"

const CATEGORY = "seamless-speech-mismatch"
const DISTRACTOR_POOLS = [
  { value: `${CATEGORY}/matched`, label: "Matched pool" },
  { value: `${CATEGORY}/mismatched`, label: "Mismatched pool" },
]

export default function Page() {
  return (
    <>
      <h2 className="font-semibold tracking-tight text-slate-900 dark:text-slate-100 mt-10 border-b pb-1 text-3xl border-neutral-200/70">
        Seamless Speech Mismatch Attention Check Videos
      </h2>
      <p className="mt-3 text-sm text-gray-500">
        Attention checks for the <code>{CATEGORY}</code> pool. File naming convention is the same as origin.
      </p>
      <ul className="mt-6 list-disc first:mt-0 ltr:ml-6 rtl:mr-6">
        <li className="my-2"><code>LeftClearlyBetter_Type_Volume</code> | <code>LeftSlightlyBetter_Type_Volume</code> | <code>TheyAreEqual_Type_Volume</code> | <code>RightSlightlyBetter_Type_Volume</code> | <code>RightClearlyBetter_Type_Volume</code></li>
        <li className="my-2"><code>Reference</code></li>
        <li className="my-2"><code>Type = Audio or Text</code></li>
        <li className="my-2"><code>Volume = Muted or Unmuted</code></li>
      </ul>

      <h4 className="font-semibold tracking-tight text-slate-900 dark:text-slate-100 mt-8 text-xl">Upload Seamless Speech Mismatch Attention Check Video</h4>
      <div className="mt-6">
        <UploadAttetionCheck category={CATEGORY} />
      </div>

      <h4 className="font-semibold tracking-tight text-slate-900 dark:text-slate-100 mt-12 border-b pb-1 text-xl border-neutral-200/70">
        Add a single check against an existing video
      </h4>
      <p className="mt-3 text-sm text-gray-500">
        Upload one AC video, set the expected vote, and choose the real clip it is compared against by giving that clip&apos;s
        systemname + inputcode, and which pool (matched or mismatched) it lives in. The distractor must already exist in the chosen
        pool.
      </p>
      <div className="mt-6 mb-32">
        <UploadPairedAttentionCheck category={CATEGORY} pools={DISTRACTOR_POOLS} defaultType="Text" defaultVolume="Unmuted" />
      </div>
    </>
  )
}
