// Scrape job details from the current page
function scrapeJob() {
  const host = window.location.hostname

  if (host.includes("linkedin.com")) return scrapeLinkedIn()
  if (host.includes("indeed.com")) return scrapeIndeed()
  if (host.includes("reed.co.uk")) return scrapeReed()
  if (host.includes("glassdoor.com") || host.includes("glassdoor.co.uk")) return scrapeGlassdoor()
  if (host.includes("totaljobs.com")) return scrapeTotaljobs()
  if (host.includes("cv-library.co.uk")) return scrapeCVLibrary()
  return scrapeGeneric()
}

function text(selector) {
  return document.querySelector(selector)?.innerText?.trim() || ""
}

function scrapeLinkedIn() {
  return {
    job_title: text(".job-details-jobs-unified-top-card__job-title h1") || text(".t-24.t-bold"),
    company: text(".job-details-jobs-unified-top-card__company-name") || text(".topcard__org-name-link"),
    location: text(".job-details-jobs-unified-top-card__bullet") || text(".topcard__flavor--bullet"),
    job_description: text(".jobs-description__content") || text(".description__text"),
    url: window.location.href,
    source: "LinkedIn",
  }
}

function scrapeIndeed() {
  return {
    job_title: text('[data-testid="jobsearch-JobInfoHeader-title"]') || text(".jobsearch-JobInfoHeader-title"),
    company: text('[data-testid="inlineHeader-companyName"] a') || text(".jobsearch-InlineCompanyRating-companyName"),
    location: text('[data-testid="job-location"]') || text(".jobsearch-JobInfoHeader-subtitle span:last-child"),
    job_description: text("#jobDescriptionText"),
    url: window.location.href,
    source: "Indeed",
  }
}

function scrapeReed() {
  return {
    job_title: text("h1.job-header__title") || text("h1"),
    company: text(".job-header__recruiter-details a") || text(".employer-name"),
    location: text('[data-qa="job-location"]') || text(".job-header__location"),
    job_description: text('[data-qa="job-description"]') || text(".description"),
    url: window.location.href,
    source: "Reed",
  }
}

function scrapeGlassdoor() {
  return {
    job_title: text('[data-test="job-title"]') || text(".job-title"),
    company: text('[data-test="employer-name"]') || text(".employer-name"),
    location: text('[data-test="location"]') || text(".location"),
    job_description: text(".JobDetails_jobDescription__uW_fK") || text("#JobDescriptionContainer"),
    url: window.location.href,
    source: "Glassdoor",
  }
}

function scrapeTotaljobs() {
  return {
    job_title: text("h1.job-header__title") || text("h1"),
    company: text(".job-header__company-name"),
    location: text(".job-header__location"),
    job_description: text(".job-description"),
    url: window.location.href,
    source: "Totaljobs",
  }
}

function scrapeCVLibrary() {
  return {
    job_title: text("h1.job-header__title") || text("h1"),
    company: text(".job-info__recruiter"),
    location: text(".job-info__location"),
    job_description: text(".job-description__text"),
    url: window.location.href,
    source: "CV-Library",
  }
}

function scrapeGeneric() {
  return {
    job_title: document.title.split("|")[0].split("-")[0].trim(),
    company: "",
    location: "",
    job_description: "",
    url: window.location.href,
    source: "Other",
  }
}

// Listen for message from popup
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "SCRAPE_JOB") {
    sendResponse(scrapeJob())
  }
})
