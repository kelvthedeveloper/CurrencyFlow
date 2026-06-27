# 💱 CurrencyFlow

> **An AI-powered browser extension that converts currencies instantly while you browse the web.**

CurrencyFlow is a modern browser extension that automatically detects prices on websites and converts them into your preferred local currency in real time. Designed for online shoppers, freelancers, travelers, and remote workers, it eliminates the need to manually switch tabs or search for exchange rates.

Unlike traditional currency converters, CurrencyFlow enhances the browsing experience with AI-powered financial insights, historical trends, shopping intelligence, and contextual explanations that help users make informed purchasing decisions.

Built as a portfolio project, CurrencyFlow demonstrates browser extension development, AI integration, external API consumption, performance optimization, and modern frontend engineering.

---

# 📖 Table of Contents

* Overview
* Vision
* Features
* Technology Stack
* Architecture
* Project Structure
* Getting Started
* Environment Variables
* Roadmap
* Screenshots
* Deployment
* Contributing
* License

---

# Overview

Whether you're shopping online, working on freelance platforms, or comparing international prices, CurrencyFlow automatically detects prices on webpages and displays their equivalent value in your preferred currency.

No more switching tabs to search for exchange rates.

---

# Vision

Build the smartest currency companion for the web.

Users should instantly understand:

* How much something costs
* Whether it's a good deal
* Historical price trends
* Exchange rate movements
* Purchasing impact

---

# Core Features

## 💵 Automatic Currency Detection

Supports:

* USD
* EUR
* GBP
* GHS
* NGN
* CAD
* AUD
* JPY
* CNY
* and many more.

---

## 🔄 Real-Time Currency Conversion

* Live exchange rates
* Multiple currencies
* Automatic updates
* Offline cache

---

## 🤖 AI Financial Assistant

Explain prices using real-world context.

Example:

> "$450 is approximately GH₵5,900 and is equivalent to about three months of a typical home internet subscription."

---

## 📈 Exchange Rate Trends

* 7-day history
* 30-day history
* 90-day history
* One-year trends

---

## 🛍 Shopping Intelligence

AI can identify:

* Better buying opportunities
* Exchange rate changes
* Estimated savings
* Price fluctuations

---

## 💰 Budget Assistant

Users can define spending limits.

CurrencyFlow warns when purchases exceed the user's budget.

---

## 🌍 Multi-Currency Support

Track multiple preferred currencies simultaneously.

---

## ⚙ Browser Extension

Compatible with:

* Chrome
* Microsoft Edge
* Brave
* Opera

(Firefox planned.)

---

# Technology Stack

## Frontend

* React
* TypeScript
* Tailwind CSS

## Extension Framework

* Plasmo

## APIs

* Exchange Rate API
* AI API (OpenAI / Anthropic)

## Storage

* Chrome Storage API

## Deployment

* Chrome Web Store

---

# Architecture

```text
src/
├── background/
├── content/
├── popup/
├── options/
├── ai/
├── api/
├── hooks/
├── utils/
└── components/
```

---

# Getting Started

```bash
git clone https://github.com/kelvthedeveloper/currencyflow.git

cd currencyflow

npm install

npm run dev
```

---

# Environment Variables

```env
EXCHANGE_RATE_API_KEY=

OPENAI_API_KEY=
```

---

# Roadmap

## Version 1.0

* Currency detection
* Live conversion
* Browser extension
* Popup interface

## Version 2.0

* AI financial explanations
* Historical charts
* Smart notifications

## Version 3.0

* Shopping insights
* Budget tracking
* Firefox support
* Mobile companion app

---

# Future Enhancements

* Cryptocurrency support
* OCR for image-based prices
* Voice assistant
* Regional purchasing power comparisons
* AI spending recommendations

---

# License

MIT License.

---

# 👨‍💻 Author

**Kelvin**

Building intelligent tools that simplify everyday financial decisions.

---

## ⭐ Support

If you found CurrencyFlow useful, consider giving the repository a ⭐.
