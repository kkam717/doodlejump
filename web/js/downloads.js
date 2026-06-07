export async function setupDownloads() {
  const macLink = document.getElementById("mac-download");
  const winLink = document.getElementById("win-download");

  try {
    const response = await fetch("/api/downloads");
    if (!response.ok) {
      throw new Error("download api unavailable");
    }

    const data = await response.json();
    configureLink(macLink, data.mac);
    configureLink(winLink, data.win);
  } catch {
    configureUnavailable(macLink, "Download API unavailable");
    configureUnavailable(winLink, "Download API unavailable");
  }
}

function configureLink(link, item) {
  if (!link) return;

  const note = link.querySelector("small");
  link.classList.remove("unavailable");

  if (!item.available || !item.url) {
    configureUnavailable(link, "Build with the package script, then publish a release");
    return;
  }

  link.href = item.url;
  if (item.source === "local") {
    link.setAttribute("download", item.file);
  } else {
    link.removeAttribute("download");
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }

  if (note) {
    if (item.size) {
      const mb = (item.size / (1024 * 1024)).toFixed(0);
      note.textContent = `Ready to download (${mb} MB)`;
    } else {
      note.textContent = "Ready to download";
    }
  }
}

function configureUnavailable(link, message) {
  if (!link) return;

  link.classList.add("unavailable");
  link.removeAttribute("href");
  link.removeAttribute("download");
  link.removeAttribute("target");
  link.removeAttribute("rel");

  const note = link.querySelector("small");
  if (note) {
    note.textContent = message;
  }
}
