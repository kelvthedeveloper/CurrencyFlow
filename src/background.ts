export {}

console.log("CurrencyFlow Background Script Loaded")

chrome.runtime.onInstalled.addListener(() => {
  console.log("CurrencyFlow Extension Installed")
  // Initialize default settings
  chrome.storage.local.set({
    preferredCurrency: "USD",
    exchangeRates: {},
    lastUpdated: null
  })
  // Fetch initial exchange rates
  fetchExchangeRates()
})

// Fetch exchange rates periodically (every 1 hour)
chrome.alarms.create("updateRates", { periodInMinutes: 60 })

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "updateRates") {
    fetchExchangeRates()
  }
})

async function fetchExchangeRates() {
  try {
    // We'll use a free exchange rate API (https://api.exchangerate-api.com)
    const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD")
    if (!response.ok) throw new Error("Failed to fetch rates")
    const data = await response.json()

    await chrome.storage.local.set({
      exchangeRates: data.rates,
      lastUpdated: new Date().toISOString()
    })

    console.log("Exchange rates updated:", data.rates)
  } catch (error) {
    console.error("Error fetching exchange rates:", error)
  }
}
