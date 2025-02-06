"use client"

import { Callout } from "@/nextra"
import { ArrowLeftIcon, ArrowRightIcon } from "@/nextra/icons"
import { File } from "@/nextra/sidebar"
// import { Sidebar } from "@/nextra/sidebar"
import React from "react"
import AdminSidebar from "./AdminSidebar"
import { Loading } from "@/components"

export default function Layout({ children }) {
  // if (status === "loading") {
  //   return (
  //     <div className="flex justify-center w-screen h-screen">
  //       <Loading />
  //     </div>
  //   )
  // }
  return (
    <div className="mx-auto flex max-w-[90rem]">
      <AdminSidebar />
      <nav className="nextra-toc order-last max-xl:hidden w-64 shrink-0 print:hidden"></nav>
      <article className="w-full min-w-0 break-words min-h-[calc(100vh-var(--nextra-navbar-height))] text-slate-700 dark:text-slate-200 pb-8 px-6 pt-4 md:px-12">
        <main className="">{children}</main>
      </article>
    </div>
  )
}
