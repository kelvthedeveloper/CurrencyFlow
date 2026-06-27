import { useState, useEffect } from "react"

import "./style.css"

function IndexPopup() {
  const [preferredCurrency, setPreferredCurrency] = useState("USD")
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({})
  const [isEnabled, setIsEnabled] = useState(true)
  const [aiEnabled, setAiEnabled] = useState(false)

  const currencies = [
    "USD", "EUR", "GBP", "GHS", "NGN", "CAD", "AUD", "JPY", "CNY"
  ]

  useEffect(() => {
    const loadSettings = async () => {
      const result = await chrome.storage.local.get([
        "preferredCurrency",
        "exchangeRates",
        "isEnabled",
        "aiEnabled"
      ])
      if (result.preferredCurrency) {
        setPreferredCurrency(result.preferredCurrency)
      }
      if (result.exchangeRates) {
        setExchangeRates(result.exchangeRates)
      }
      if (typeof result.isEnabled !== "undefined") {
        setIsEnabled(result.isEnabled)
      }
      if (typeof result.aiEnabled !== "undefined") {
        setAiEnabled(result.aiEnabled)
      }
    }
    loadSettings()
  }, [])

  const handleCurrencyChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const currency = e.target.value
    setPreferredCurrency(currency)
    await chrome.storage.local.set({ preferredCurrency: currency })
  }

  const handleToggle = async (key: "isEnabled" | "aiEnabled", value: boolean) => {
    if (key === "isEnabled") {
      setIsEnabled(value)
    } else {
      setAiEnabled(value)
    }
    await chrome.storage.local.set({ [key]: value })
  }

  return (
    <div className="min-w-[360px] p-6 bg-white rounded-lg shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xl">💱</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">CurrencyFlow</h1>
          <p className="text-xs text-gray-500">AI-Powered Currency Converter</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Toggle Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-lg">{isEnabled ? "🟢" : "🔴"}</span>
              <span className="text-sm font-medium text-gray-800">
                Currency Converter
              </span>
            </div>
            <button
              onClick={() => handleToggle("isEnabled", !isEnabled)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                isEnabled ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  isEnabled ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-lg">{aiEnabled ? "🤖" : "⚙️"}</span>
              <div>
                <span className="text-sm font-medium text-gray-800">
                  AI Financial Explanations
                </span>
                <p className="text-xs text-gray-500">Adds real-world context to prices</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle("aiEnabled", !aiEnabled)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                aiEnabled ? "bg-purple-500" : "bg-gray-300"
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  aiEnabled ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Currency Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Currency
          </label>
          <select
            value={preferredCurrency}
            onChange={handleCurrencyChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {currencies.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </div>

        {/* Live Rates */}
        <div className="pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Live Rates (vs USD)</div>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {Object.entries(exchangeRates).slice(0, 8).map(([currency, rate]) => (
              <div
                key={currency}
                className="flex justify-between items-center px-3 py-2 bg-gray-50 rounded"
              >
                <span className="font-medium">{currency}</span>
                <span className="text-sm text-gray-600">
                  {rate.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Live rates active
          </div>
        </div>
      </div>
    </div>
  )
}

export default IndexPopup
