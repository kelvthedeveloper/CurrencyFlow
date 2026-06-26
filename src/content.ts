import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

console.log("CurrencyFlow Content Script Loaded")

// Currency symbol mappings
const currencySymbols: Record<string, string> = {
  "$": "USD",
  "€": "EUR",
  "£": "GBP",
  "₵": "GHS",
  "₦": "NGN",
  "C$": "CAD",
  "A$": "AUD",
  "¥": "JPY",
  "CN¥": "CNY"
}

// Regex to find prices
const priceRegex = /(\$|€|£|₵|₦|C\$|A\$|¥|CN¥)\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g

async function getSettings() {
  const result = await chrome.storage.local.get([
    "preferredCurrency",
    "exchangeRates"
  ])
  return {
    preferredCurrency: result.preferredCurrency || "USD",
    exchangeRates: result.exchangeRates || {}
  }
}

function convertPrice(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  exchangeRates: Record<string, number>
) {
  if (!exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) {
    return null
  }
  const inUSD = amount / exchangeRates[fromCurrency]
  return inUSD * exchangeRates[toCurrency]
}

function detectCurrency(symbol: string): string | null {
  return currencySymbols[symbol] || null
}

async function convertAllPrices() {
  const { preferredCurrency, exchangeRates } = await getSettings()

  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null
  )

  const textNodes: Text[] = []
  while (walker.nextNode()) {
    const node = walker.currentNode as Text
    if (priceRegex.test(node.nodeValue || "")) {
      textNodes.push(node)
    }
    priceRegex.lastIndex = 0 // Reset regex
  }

  textNodes.forEach((node) => {
    let html = node.nodeValue || ""
    let match: RegExpExecArray | null
    const newFragments: (string | HTMLElement)[] = []
    let lastIndex = 0

    priceRegex.lastIndex = 0
    while ((match = priceRegex.exec(html)) !== null) {
      const [fullMatch, symbol, amountStr] = match
      const fromCurrency = detectCurrency(symbol)
      const amount = parseFloat(amountStr.replace(/,/g, ""))

      if (fromCurrency && !isNaN(amount)) {
        const converted = convertPrice(
          amount,
          fromCurrency,
          preferredCurrency,
          exchangeRates
        )

        if (converted !== null) {
          // Add text before match
          if (match.index > lastIndex) {
            newFragments.push(html.slice(lastIndex, match.index))
          }

          // Create a span with both original and converted price
          const wrapper = document.createElement("span")
          wrapper.className = "currencyflow-wrapper"
          wrapper.innerHTML = `
            <span class="currencyflow-original">${fullMatch}</span>
            <span class="currencyflow-converted" style="margin-left: 8px; color: #2563eb; font-weight: 600; font-size: 0.95em;">
              ~${preferredCurrency} ${converted.toFixed(2)}
            </span>
          `
          newFragments.push(wrapper)
          lastIndex = match.index + fullMatch.length
        }
      }
    }

    // Add remaining text
    if (lastIndex < html.length) {
      newFragments.push(html.slice(lastIndex))
    }

    // Replace the text node
    if (newFragments.length > 0) {
      const parent = node.parentNode
      if (parent) {
        newFragments.forEach((fragment) => {
          if (typeof fragment === "string") {
            parent.insertBefore(document.createTextNode(fragment), node)
          } else {
            parent.insertBefore(fragment, node)
          }
        })
        parent.removeChild(node)
      }
    }
  })
}

// Run conversion when page loads and when DOM changes
document.addEventListener("DOMContentLoaded", convertAllPrices)

// Watch for dynamic content
const observer = new MutationObserver(convertAllPrices)
observer.observe(document.body, { childList: true, subtree: true })

// Also run immediately in case DOMContentLoaded already fired
convertAllPrices()
