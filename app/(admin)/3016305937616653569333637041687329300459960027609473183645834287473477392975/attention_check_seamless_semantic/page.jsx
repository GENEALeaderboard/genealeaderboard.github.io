"use client"

import UploadSemanticAttentionCheck from "./UploadSemanticAttentionCheck"

const CATEGORY = "seamless-semantic-mismatch"

export default function Page() {
  return (
    <>
      <h2 className="font-semibold tracking-tight text-slate-900 dark:text-slate-100 mt-10 border-b pb-1 text-3xl border-neutral-200/70">
        Seamless Semantic Mismatch Attention Check Videos
      </h2>
      <p className="mt-3 text-sm text-gray-500">
        Attention checks for the <code>{CATEGORY}</code> pool. Each check is one video shown with two descriptions — a
        <strong> left</strong> one and a <strong>right</strong> one — plus the <strong>expected vote</strong> a careful rater should
        cast: left, right, both, or neither. During the study the rater who votes otherwise fails the check. Upload one check at a
        time.
      </p>

      <h4 className="font-semibold tracking-tight text-slate-900 dark:text-slate-100 mt-8 text-xl">Upload Seamless Semantic Mismatch Attention Check</h4>
      <div className="mt-6 mb-32">
        <UploadSemanticAttentionCheck category={CATEGORY} />
      </div>
    </>
  )
}
