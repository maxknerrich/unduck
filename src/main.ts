import { bangs } from "./bang";
import "./global.css";

const baseUrl = "https://search.knerrich.tech";

function noSearchDefaultPageRender() {
	const app = document.querySelector<HTMLDivElement>("#app")!;
	app.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
      <div class="content-container">
        <h1>Und*ck</h1>
        <p>DuckDuckGo's bang redirects are too slow. Add the following URL as a custom search engine to your browser. Enables <a href="https://duckduckgo.com/bang.html" target="_blank">all of DuckDuckGo's bangs.</a></p>
        <div class="url-container"> 
          <input 
            type="text" 
            class="url-input"
            value="${baseUrl}?q=%s"
            readonly 
          />
          <button class="copy-button">
            <img src="/clipboard.svg" alt="Copy" />
          </button>
        </div>
        <div class="engine-select">
					<label for="engine-dropdown">Default search engine:</label>
          <select class="engine-dropdown">
            <option value="g">Google</option>
            <option value="ddg">DuckDuckGo</option>
            <option value="brave">Brave</option>
            <option value="b">Bing</option>
            <option value="sp">Startpage</option>
            <option value="custom">Custom</option>
          </select>
          <div class="custom-input-container">
            <input type="text" class="custom-engine-input" placeholder="Enter bang (e.g., g, ddg, b)">
          </div>
        </div>
      </div>
      <footer class="footer">
        <p>Fork made by <a href="https://knerrich.com" target="_blank">Max Knerrich</a>
				Forked from Theo <a href="https://github.com/t3dotgg/unduck" target="_blank">unduck</a></p>
      </footer>
    </div>
  `;

	const copyButton = app.querySelector<HTMLButtonElement>(".copy-button")!;
	const copyIcon = copyButton.querySelector("img")!;
	const urlInput = app.querySelector<HTMLInputElement>(".url-input")!;

	const engineDropdown = app.querySelector<HTMLSelectElement>(
		".engine-dropdown",
	)!;
	const customInput = app.querySelector<HTMLInputElement>(
		".custom-engine-input",
	)!;
	const customInputContainer = app.querySelector<HTMLDivElement>(
		".custom-input-container",
	)!;

	engineDropdown.value = LS_DEFAULT_BANG;

	// Show/hide custom input on initial load
	customInputContainer.style.display = engineDropdown.value === "custom"
		? "block"
		: "none";

	engineDropdown.addEventListener("change", () => {
		const selectedEngine = engineDropdown.value;
		customInputContainer.style.display = selectedEngine === "custom"
			? "block"
			: "none";

		if (selectedEngine === "custom") {
			customInput.value = LS_DEFAULT_BANG;
		} else {
			localStorage.setItem("default-bang", selectedEngine);
			updateUrlWithEngine(selectedEngine);
		}
	});

	customInput.addEventListener("change", () => {
		const customBang = customInput.value.trim();
		if (customBang) {
			localStorage.setItem("default-bang", customBang);
			updateUrlWithEngine(customBang);
		}
	});

	if (engineDropdown.value === "custom") {
		customInput.classList.add("visible");
		customInput.value = LS_DEFAULT_BANG;
	}

	copyButton.addEventListener("click", async () => {
		await navigator.clipboard.writeText(urlInput.value);
		copyIcon.src = "/clipboard-check.svg";

		setTimeout(() => {
			copyIcon.src = "/clipboard.svg";
		}, 2000);
	});
}

const LS_DEFAULT_BANG = localStorage.getItem("default-bang") ?? "g";
const defaultBang = bangs.find((b) => b.t === LS_DEFAULT_BANG);

function getBangredirectUrl() {
	const url = new URL(window.location.href);
	const query = url.searchParams.get("q")?.trim() ?? "";
	const defaultEngine = url.searchParams.get("default")?.trim() ?? "";
	if (defaultEngine && defaultEngine !== LS_DEFAULT_BANG) {
		console.log("Setting default bang to", defaultEngine);
		localStorage.setItem("default-bang", defaultEngine);
	}
	if (!query) {
		noSearchDefaultPageRender();
		return null;
	}

	const match = query.match(/!(\S+)/i);

	const bangCandidate = match?.[1]?.toLowerCase();
	const selectedBang = bangs.find((b) => b.t === bangCandidate) ?? defaultBang;

	const cleanQuery = query.replace(/!\S+\s*/i, "").trim();

	const searchUrl = selectedBang?.u.replace(
		"{{{s}}}",
		encodeURIComponent(cleanQuery).replace(/%2F/g, "/"),
	);
	if (!searchUrl) return null;

	return searchUrl;
}

function doRedirect() {
	const searchUrl = getBangredirectUrl();
	console.log("searchUrl", searchUrl);
	if (!searchUrl) return;
	window.location.replace(searchUrl);
}

function updateUrlWithEngine(engine: string) {
	const urlInput = document.querySelector<HTMLInputElement>(".url-input")!;
	urlInput.value = `${baseUrl}?q=%s&default=${engine}`;
}

doRedirect();
