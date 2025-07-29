export function initAIPopover({ apiKey }: { apiKey: string }) {
  const popoverId = "ai-popover";
  const numbersOfListtoSave = 10;

  // Prevent double injection
  if (document.getElementById(popoverId)) return;

  // Inject popover styles
  const style = document.createElement("style");
  style.innerHTML = `
    #${popoverId} {
      position: absolute;
      max-width: 300px;
      max-height: 450px;
      overflow: auto;
      background: white;
      color: black;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      z-index: 9999;
      display: none;
      font-family: sans-serif;
    }
  `;
  document.head.appendChild(style);

  // Create popover element
  const popover = document.createElement("div");
  popover.id = popoverId;
  document.body.appendChild(popover);

  // Cache functions
  function getCachedData(): { key: string; value: string }[] {
    try {
      const data = localStorage.getItem("aiTextPopover");
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  function setDatatoLocalStorage(key: string, value: string) {
    let cache = getCachedData();
    cache = cache.filter((item) => item.key !== key); // Remove duplicates
    cache.unshift({ key, value });
    if (cache.length > numbersOfListtoSave) {
      cache = cache.slice(0, numbersOfListtoSave);
    }
    localStorage.setItem("aiTextPopover", JSON.stringify(cache));
    console.log("Cached:", key);
  }

  function getDatatoLocalStorage(key: string): string | null {
    const cache = getCachedData();
    const found = cache.find((item) => item.key === key);
    return found ? found.value : null;
  }

  // Selection handler
  document.addEventListener("mouseup", async () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const text = selection.toString().trim();
    console.log("Selected text:", text);

    if (!text || text.length < 2) {
      console.log("Selection too short. Hiding.");
      popover.style.display = "none";
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Position the popover
    popover.style.left = `${rect.left + window.scrollX}px`;
    popover.style.top = `${rect.bottom + window.scrollY + 8}px`;
    popover.innerText = "Loading...";
    console.log("Showing popover");
    popover.style.display = "block";

    // Check localStorage first
    const cached = getDatatoLocalStorage(text);
    if (cached) {
      console.log("Using cached result");
      popover.innerText = cached;
      return;
    }

    // Fetch explanation from API
    try {
      const res = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama3-70b-8192",
            messages: [
              {
                role: "user",
                content: `Explain this in simple terms:\n\n"${text}"`,
              },
            ],
          }),
        }
      );

      const data = await res.json();
      const reply =
        data?.choices?.[0]?.message?.content || "No response from AI.";
      console.log("AI Response:", reply);
      popover.innerText = reply;
      setDatatoLocalStorage(text, reply);
    } catch (err) {
      console.error("Fetch error:", err);
      popover.innerText = "Error fetching AI response.";
    }
  });

  // Delayed click outside to hide popover
  // document.addEventListener("click", (e) => {
  //   setTimeout(() => {
  //     if (!popover.contains(e.target as Node)) {
  //       console.log("Hiding popover due to click outside");
  //       popover.style.display = "none";
  //     }
  //   }, 100);
  // });

  // Hide on input focus
  document.addEventListener("focusin", (e) => {
    const target = e.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable
    ) {
      console.log("Hiding popover due to focusin");
      popover.style.display = "none";
    }
  });
}
