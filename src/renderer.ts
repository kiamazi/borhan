// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process unless
// nodeIntegration is set to true in webPreferences.
// Use preload.js to selectively enable features
// needed in the renderer process.

const changeStyle = document.getElementById('changestyle') as HTMLInputElement
changeStyle.addEventListener('change', () => {
    const sheet: string =
        changeStyle.checked ? "./static/darkstyle.css" : "./static/lightstyle.css";
    swapStyleSheet(sheet)
    const changeStyleText = document.getElementById('changestyletext')
    changeStyleText.innerText =
        changeStyle.checked ? "Light Theme" : "Dark Theme";
})

function swapStyleSheet(sheet: string): void {
    document.getElementById('pagestyle').setAttribute('href', sheet);
}


// Get the modal (help)
const helpModal: HTMLElement = document.getElementById("helpModal");
const helpBtn: HTMLElement = document.getElementById("helpBtn");
const helpSpan: HTMLElement = document.getElementById("helpModalClose");
helpBtn.onclick = function(): void {
  helpModal.style.display = "block";
}
helpSpan.onclick = function(): void {
  helpModal.style.display = "none";
}

// Get the modal (about)
const aboutModal: HTMLElement = document.getElementById("aboutModal");
const aboutBtn: HTMLElement = document.getElementById("aboutBtn");
const aboutSpan: HTMLElement = document.getElementById("aboutModalClose");
aboutBtn.onclick = function(): void {
  aboutModal.style.display = "block";
}
aboutSpan.onclick = function(): void {
  aboutModal.style.display = "none";
}

window.onclick = function(event: Event): void {
  if (event.target === helpModal) {
    helpModal.style.display = "none";
  }
  if (event.target === aboutModal) {
    aboutModal.style.display = "none";
  }
}