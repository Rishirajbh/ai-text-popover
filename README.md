# AI-text-popover

A lightweight, plug-and-play JavaScript utility that allows users to **select text** on a webpage and get a simple explanation for it using Groq's LLMs. Perfect for **glossary-style popovers**, educational tools, or AI-assisted documentation.

---

## Features

- Zero configuration (just plug and play)
- Explains selected text using [Groq's API](https://console.groq.com/)
- Clean, minimal popover UI
- Ignores selections that are too short or meaningless
- Works in any plain JavaScript or TypeScript project

---

## Installation

```bash
npm install ai-text-popover
```

---

## Usage

```bash
import { initAIPopover } from "ai-text-popover";

initAIPopover({ apiKey: "api_key_from_https://console.groq.com/" });
```
