"use client"

import { useState } from "react"

const TAB_LABELS = ["Overview", "Users", "Employers", "Affiliates"] as const
type Tab = typeof TAB_LABELS[number]

export function AdminTabs({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState<Tab>("Overview")
  return (
    <div>
      <div className="flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1 w-fit mb-8">
        {TAB_LABELS.map(tab => (
          <button key={tab} onClick={() => setActive(tab)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${active === tab ? "bg-white/12 text-white" : "text-white/40 hover:text-white"}`}>
            {tab}
          </button>
        ))}
      </div>
      <AdminTabContext.Provider value={active}>
        {children}
      </AdminTabContext.Provider>
    </div>
  )
}

import { createContext, useContext } from "react"
const AdminTabContext = createContext<Tab>("Overview")

export function AdminTabPanel({ tab, children }: { tab: Tab; children: React.ReactNode }) {
  const active = useContext(AdminTabContext)
  if (active !== tab) return null
  return <div className="space-y-8">{children}</div>
}
