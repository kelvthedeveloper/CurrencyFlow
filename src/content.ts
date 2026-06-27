import type { PlasmoCSConfig } from "plasmo"
import { getAIExplanation } from "./ai"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true
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

// Regex to find prices - more robust pattern
const priceRegex = /(\$|€|£|₵|₦|C\$|A\$|¥|CN¥)\s*(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)/g

// Keep track of processed elements to avoid duplicates
const processedElements = new WeakSet<Node>()

let settings = {
  isEnabled: true,
  aiEnabled: false,
  preferredCurrency: "USD",
  exchangeRates: {} as Record<string, number>
}

async function loadSettings() {
  const result = await chrome.storage.local.get([
    "isEnabled",
    "aiEnabled",
    "preferredCurrency",
    "exchangeRates"
  ])
  settings = {
    isEnabled: result.isEnabled !== false,
    aiEnabled: result.aiEnabled || false,
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

function createTooltip(): HTMLDivElement {
  const tooltip = document.createElement("div")
  tooltip.className = "currencyflow-tooltip"
  tooltip.style.cssText = `
    position: fixed;
    background: #1f2937;
    color: white;
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 13px;
    max-width: 300px;
    z-index: 1000000;
    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s;
  `
  document.body.appendChild(tooltip)
  return tooltip
}

const tooltip = createTooltip()

function showTooltip(element: HTMLElement, content: string) {
  tooltip.textContent = content
  const rect = element.getBoundingClientRect()
  tooltip.style.left = `${rect.left}px`
  tooltip.style.top = `${rect.bottom + 8}px`
  tooltip.style.opacity = "1"
}

function hideTooltip() {
  tooltip.style.opacity = "0"
}

function processTextNode(textNode: Text) {
  if (processedElements.has(textNode)) return
  if (!settings.isEnabled) return

  const html = textNode.nodeValue || ""
  if (!priceRegex.test(html)) return
  priceRegex.lastIndex = 0

  const newFragments: (string | HTMLElement)[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null = null

  while ((match = priceRegex.exec(html)) !== null) {
    const [fullMatch, symbol, amountStr] = match
    const fromCurrency = detectCurrency(symbol)
    const amount = parseFloat(amountStr.replace(/,/g, ""))

    if (fromCurrency && !isNaN(amount)) {
      const converted = convertPrice(
        amount,
        fromCurrency,
        settings.preferredCurrency,
        settings.exchangeRates
      )

      if (converted !== null) {
        if (match.index > lastIndex) {
          newFragments.push(html.slice(lastIndex, match.index))
        }

        const wrapper = document.createElement("span")
        wrapper.className = "currencyflow-wrapper"
        wrapper.style.cssText = "cursor: pointer; position: relative;"
        
        wrapper.innerHTML = `
          <span class="currencyflow-converted" style="color: #2563eb; font-weight: 600; background: rgba(37, 99, 235, 0.08); padding: 2px 6px; border-radius: 4px;">
            ${settings.preferredCurrency} ${converted.toFixed(2)}
          </span>
        `

        // Add hover for AI explanations
        if (settings.aiEnabled) {
          wrapper.addEventListener("mouseenter", async () => {
            const explanation = await getAIExplanation({
              originalAmount: amount,
              originalCurrency: fromCurrency,
              convertedAmount: converted,
              convertedCurrency: settings.preferredCurrency
            })
            showTooltip(wrapper, explanation)
          })
          wrapper.addEventListener("mouseleave", hideTooltip)
        }

        newFragments.push(wrapper)
        lastIndex = match.index + fullMatch.length
      }
    }
  }

  if (newFragments.length > 0) {
    if (lastIndex < html.length) {
      newFragments.push(html.slice(lastIndex))
    }

    const parent = textNode.parentNode
    if (parent) {
      const replacementNodes: Node[] = []
      newFragments.forEach(fragment => {
        if (typeof fragment === "string") {
          replacementNodes.push(document.createTextNode(fragment))
        } else {
          replacementNodes.push(fragment)
          processedElements.add(fragment)
        }
      })
      
      replacementNodes.forEach(node => parent.insertBefore(node, textNode))
      parent.removeChild(textNode)
    }
  }
}

function processNode(node: Node) {
  if (node.nodeType === Node.TEXT_NODE) {
    processTextNode(node as Text)
  } else {
    const walker = document.createTreeWalker(
      node as Node,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (n) => {
          const parent = n.parentElement
          if (
            parent &&
            (parent.tagName === "SCRIPT" ||
              parent.tagName === "STYLE" ||
              parent.tagName === "TEXTAREA" ||
              parent.tagName === "INPUT" ||
              parent.closest(".currencyflow-wrapper"))
          ) {
            return NodeFilter.FILTER_REJECT
          }
          return NodeFilter.FILTER_ACCEPT
        }
      }
    )
    
    let textNode: Node | null
    while ((textNode = walker.nextNode())) {
      processTextNode(textNode as Text)
    }
  }
}

function convertAllPrices() {
  if (!settings.isEnabled) {
    // Restore original prices if disabled
    document.querySelectorAll(".currencyflow-wrapper").forEach(wrapper => {
      // For now, we just leave it, but we could restore if we stored original
    })
    return
  }
  processNode(document.body)
}

// Listen for storage changes to update in real-time
chrome.storage.onChanged.addListener(async (changes) => {
  await loadSettings()
  convertAllPrices()
})

// Run conversion when page loads
document.addEventListener("DOMContentLoaded", async () => {
  await loadSettings()
  convertAllPrices()
})

// Watch for dynamic content changes
const observer = new MutationObserver(async (mutations) => {
  await loadSettings()
  // Debounce to avoid too many calls
  clearTimeout((window as any).currencyflowTimeout)
  ;(window as any).currencyflowTimeout = setTimeout(() => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        processNode(node)
      })
    })
  }, 100)
})
observer.observe(document.body, { childList: true, subtree: true })

// Also run immediately
loadSettings().then(() => convertAllPrices())
