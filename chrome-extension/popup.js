const API_BASE = "https://hire-flow.app"

let selectedStatus = "saved"
let scrapedJob = null

const $ = id => document.getElementById(id)

// Status button toggle
document.querySelectorAll(".status-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".status-btn").forEach(b => b.classList.remove("active"))
    btn.classList.add("active")
    selectedStatus = btn.dataset.status
  })
})

// Disconnect
$("resetToken").addEventListener("click", e => {
  e.preventDefault()
  chrome.storage.local.remove("hireflow_token", () => location.reload())
})

// Connect button
$("connectBtn").addEventListener("click", async () => {
  const token = $("tokenInput").value.trim()
  if (!token) return

  // Verify token
  try {
    const res = await fetch(`${API_BASE}/api/extension/verify`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      showSetupMsg("Invalid token — check your HireFlow settings.", "error")
      return
    }
    chrome.storage.local.set({ hireflow_token: token }, () => location.reload())
  } catch {
    showSetupMsg("Could not connect. Check your internet connection.", "error")
  }
})

function showSetupMsg(text, type) {
  const el = $("setupMsg")
  el.textContent = text
  el.className = `msg ${type}`
}

// Save button
$("saveBtn").addEventListener("click", async () => {
  if (!scrapedJob) return
  const btn = $("saveBtn")
  btn.disabled = true
  btn.textContent = "Saving…"

  const token = await getToken()
  const payload = {
    job_title: $("jobTitle").value.trim(),
    company: $("company").value.trim(),
    location: $("location").value.trim(),
    status: selectedStatus,
    job_description: scrapedJob.job_description || "",
    url: scrapedJob.url || "",
    source: scrapedJob.source || "Extension",
  }

  try {
    const res = await fetch(`${API_BASE}/api/extension/save-job`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    if (!res.ok) {
      showMsg(data.error || "Failed to save. Try again.", "error")
      btn.disabled = false
      btn.textContent = "Save to HireFlow"
    } else {
      showMsg("✓ Saved! Opening your dashboard…", "success")
      btn.textContent = "Saved ✓"
      setTimeout(() => chrome.tabs.create({ url: `${API_BASE}/dashboard` }), 1200)
    }
  } catch {
    showMsg("Network error — check your connection.", "error")
    btn.disabled = false
    btn.textContent = "Save to HireFlow"
  }
})

function showMsg(text, type) {
  const el = $("msg")
  el.textContent = text
  el.className = `msg ${type}`
}

function getToken() {
  return new Promise(resolve => {
    chrome.storage.local.get("hireflow_token", data => resolve(data.hireflow_token))
  })
}

// Init
async function init() {
  const token = await getToken()

  if (!token) {
    $("setupPanel").style.display = "block"
    return
  }

  // Ask content script for job data
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const tab = tabs[0]
    if (!tab?.id) {
      $("notJobPanel").style.display = "block"
      return
    }

    chrome.tabs.sendMessage(tab.id, { type: "SCRAPE_JOB" }, job => {
      if (chrome.runtime.lastError || !job) {
        $("notJobPanel").style.display = "block"
        return
      }

      scrapedJob = job

      // Show source badge
      if (job.source) {
        const badge = $("sourceBadge")
        badge.textContent = job.source
        badge.style.display = "inline-block"
      }

      // Populate fields
      $("jobTitle").value = job.job_title || ""
      $("company").value = job.company || ""
      $("location").value = job.location || ""

      $("mainPanel").style.display = "block"
    })
  })
}

init()
