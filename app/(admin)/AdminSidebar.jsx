"use client"
import React, { createContext, useEffect, useRef, useState } from "react"
import AISystem from "@/icons/aisystem"
import ComputerSetting from "@/icons/computersetting"
import HomeIcon from "@/icons/home"
import StorageIcon from "@/icons/storage"
import VideoUploadIcon from "@/icons/videoupload"
import { ActiveAnchorProvider } from "@/contexts/active-anchor"
import { useMenu } from "@/contexts/menu"
import { ArrowRightIcon } from "@/nextra/icons"
import { useMounted } from "@/utils/hooks/use-mounted"
import Link from "next/link"
import CSVUploadIcon from "@/icons/csvupload"
import UserStudy from "@/icons/userstudy"
import VideoIcon from "@/icons/video"
import Participation from "@/icons/participation"
import Mismatch from "@/icons/mismatch"
import AttentionCheck from "@/icons/attetioncheck"

export const OnFocusItemContext = createContext(null)
OnFocusItemContext.displayName = "OnFocusItem"

const ADMIN_BASE = "/3016305937616653569333637041687329300459960027609473183645834287473477392975"

const LINK_CLASS =
  "gap-2 flex rounded px-2 py-1.5 text-sm transition-colors cursor-pointer [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none] contrast-more:border text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-neutral-400 dark:hover:bg-primary-100/5 dark:hover:text-gray-50 contrast-more:text-gray-900 contrast-more:dark:text-gray-50 contrast-more:border-transparent contrast-more:hover:border-gray-900 contrast-more:dark:hover:border-gray-50"

// Top-level (always visible) links.
const TOP_LINKS = [
  { href: "/getting-started", label: "Back", Icon: (props) => <ArrowRightIcon {...props} className={`${props.className || ""} ltr:rotate-180`} /> },
  { href: `${ADMIN_BASE}/home`, label: "Home", Icon: HomeIcon },
  { href: `${ADMIN_BASE}/storage`, label: "Storage", Icon: StorageIcon },
]

// Collapsible sections. Each entry: { key, title, items: [{href, label, Icon}] }
const SECTIONS = [
  {
    key: "beat2",
    title: "[BEAT2] All studies",
    items: [
      { href: `${ADMIN_BASE}/input`, label: "Input Codes", Icon: ComputerSetting },
      { href: `${ADMIN_BASE}/systems`, label: "Systems", Icon: AISystem },
      { href: `${ADMIN_BASE}/studies`, label: "Studies", Icon: UserStudy },
      { href: `${ADMIN_BASE}/videos`, label: "Videos", Icon: VideoIcon },
      { href: `${ADMIN_BASE}/participants`, label: "Prolific Participants", Icon: Participation },
      { href: `${ADMIN_BASE}/attention_check`, label: "Upload Attention Check", Icon: AttentionCheck },
      { href: `${ADMIN_BASE}/upload_origin`, label: "Upload Origin Videos", Icon: VideoUploadIcon },
      { href: `${ADMIN_BASE}/upload_mismatch`, label: "Upload Mismatched", Icon: Mismatch },
      { href: `${ADMIN_BASE}/csv`, label: "Upload CSV Studies", Icon: CSVUploadIcon },
    ],
  },
  {
    key: "seamless",
    title: "[SI] Realism",
    items: [
      { href: `${ADMIN_BASE}/input_seamless`, label: "Seamless Input Codes", Icon: ComputerSetting },
      { href: `${ADMIN_BASE}/systems_seamless`, label: "Seamless Systems", Icon: AISystem },
      { href: `${ADMIN_BASE}/attention_check_seamless`, label: "Upload Seamless Attention Check", Icon: AttentionCheck },
      { href: `${ADMIN_BASE}/upload_seamless`, label: "Upload Seamless Videos", Icon: VideoUploadIcon },
      { href: `${ADMIN_BASE}/csv_seamless`, label: "Upload Seamless CSV Studies", Icon: CSVUploadIcon },
    ],
  },
  {
    key: "speech-mismatch",
    title: "[SI] Speech Mismatch",
    items: [
      { href: `${ADMIN_BASE}/input_seamless_speech`, label: "Speech Mismatch Input Codes", Icon: ComputerSetting },
      { href: `${ADMIN_BASE}/attention_check_seamless_speech`, label: "Upload Speech Mismatch Attention Check", Icon: AttentionCheck },
      { href: `${ADMIN_BASE}/upload_seamless_speech`, label: "Upload Speech Mismatch Videos", Icon: VideoUploadIcon },
      { href: `${ADMIN_BASE}/csv_seamless_speech`, label: "Upload Speech Mismatch CSV", Icon: CSVUploadIcon },
    ],
  },
  {
    key: "dyadic-mismatch",
    title: "[SI] Dyadic Mismatch",
    items: [
      { href: `${ADMIN_BASE}/input_seamless_dyadic`, label: "Dyadic Mismatch Input Codes", Icon: ComputerSetting },
      { href: `${ADMIN_BASE}/attention_check_seamless_dyadic`, label: "Upload Dyadic Mismatch Attention Check", Icon: AttentionCheck },
      { href: `${ADMIN_BASE}/upload_seamless_dyadic`, label: "Upload Dyadic Mismatch Videos", Icon: VideoUploadIcon },
      { href: `${ADMIN_BASE}/csv_seamless_dyadic`, label: "Upload Dyadic Mismatch CSV", Icon: CSVUploadIcon },
    ],
  },
  {
    key: "semantic-mismatch",
    title: "[SI] Semantic Mismatch",
    items: [
      { href: `${ADMIN_BASE}/input_seamless_semantic`, label: "Semantic Mismatch Input Codes", Icon: ComputerSetting },
      { href: `${ADMIN_BASE}/attention_check_seamless_semantic`, label: "Upload Semantic Mismatch Attention Check", Icon: AttentionCheck },
      { href: `${ADMIN_BASE}/upload_seamless_semantic`, label: "Upload Semantic Mismatch Videos", Icon: VideoUploadIcon },
      { href: `${ADMIN_BASE}/csv_seamless_semantic`, label: "Upload Semantic Mismatch CSV", Icon: CSVUploadIcon },
    ],
  },
]

function SidebarSection({ title, items, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <>
      <li className="mt-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between gap-2 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-gray-50"
          aria-expanded={open}
        >
          <span>{title}</span>
          <ArrowRightIcon
            className={`h-3 shrink-0 transition-transform ${open ? "rotate-90" : ""}`}
          />
        </button>
      </li>
      {open &&
        items.map((it) => (
          <li key={it.href} className="flex flex-col gap-1">
            <Link className={LINK_CLASS} href={it.href}>
              {it.Icon ? <it.Icon className="w-5" /> : null}
              <span>{it.label}</span>
            </Link>
          </li>
        ))}
    </>
  )
}

export default function AdminSidebar() {
  const { menu } = useMenu()
  const sidebarRef = useRef(null)
  const containerRef = useRef(null)
  useMounted()

  useEffect(() => {
    if (menu) {
      document.body.classList.add("overflow-hidden", "md:overflow-auto")
    } else {
      document.body.classList.remove("overflow-hidden", "md:overflow-auto")
    }
  }, [menu])

  return (
    <ActiveAnchorProvider>
      <aside className="nextra-sidebar-container flex flex-col md:top-16 md:shrink-0 motion-reduce:transform-none transform-gpu transition-all ease-in-out print:hidden md:w-64 md:sticky md:self-start max-md:[transform:translate3d(0,-100%,0)]">
        <div ref={containerRef} className="overflow-y-auto overflow-x-hidden p-4 grow md:h-[calc(100vh-var(--nextra-navbar-height)-var(--nextra-menu-height))] nextra-scrollbar">
          <div className="transform-gpu overflow-hidden transition-all ease-in-out motion-reduce:transition-none">
            <div className="transition-opacity duration-500 ease-in-out motion-reduce:transition-none opacity-100">
              <ul ref={sidebarRef} className="flex flex-col gap-1 nextra-menu-desktop max-md:hidden">
                {TOP_LINKS.map((it) => (
                  <li key={it.href} className="flex flex-col gap-1">
                    <Link className={LINK_CLASS} href={it.href}>
                      {it.Icon ? <it.Icon className="w-5" /> : null}
                      <span>{it.label}</span>
                    </Link>
                  </li>
                ))}
                {SECTIONS.map((s) => (
                  <SidebarSection key={s.key} title={s.title} items={s.items} />
                ))}
              </ul>
            </div>
          </div>
        </div>
      </aside>
    </ActiveAnchorProvider>
  )
}
