// Portfolio interactivity: mobile navigation, theme, project dialogs, GitHub API.
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const themeToggle = document.getElementById("themeToggle");
const projectModal = document.getElementById("projectModal");
const modalClose = document.getElementById("modalClose");
const modalDone = document.getElementById("modalDone");

menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
  });
});

// Restore the visitor's theme preference, if one was saved.
const savedTheme = localStorage.getItem("rikash-portfolio-theme");
if (savedTheme === "light") document.body.classList.add("light-theme");
updateThemeButton();

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light-theme");
  localStorage.setItem("rikash-portfolio-theme", document.body.classList.contains("light-theme") ? "light" : "dark");
  updateThemeButton();
});

function updateThemeButton() {
  const isLight = document.body.classList.contains("light-theme");
  themeToggle.textContent = isLight ? "☾" : "☼";
  themeToggle.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
  themeToggle.title = isLight ? "Switch to dark theme" : "Switch to light theme";
}

const projectInfo = {
  portfolio: {
    title: "Responsive Interactive Portfolio",
    description: "A personal portfolio concept built to present skills, coursework, and development progress in one responsive website.",
    features: ["Semantic HTML sections and accessible navigation", "Responsive CSS Grid and Flexbox layouts", "JavaScript project details dialog and theme switcher", "Live public GitHub repository data using the GitHub REST API"]
  },
  student: {
    title: "Student Management System",
    description: "A student-management coursework concept focused on organising student information and practising programming logic and GUI design.",
    features: ["Student record management concepts", "Java programming practice", "User-interface structure and usability", "Opportunity to connect the project to a repository or screenshots"]
  },
  shop: {
    title: "Responsive Shop Website",
    description: "A front-end practice concept for a simple online shop, focused on responsive layouts and clear product presentation.",
    features: ["Responsive navigation and page layout", "Product cards and reusable UI patterns", "Bootstrap and CSS styling practice", "Mobile-friendly presentation"]
  }
};

document.querySelectorAll(".project-details").forEach((button) => {
  button.addEventListener("click", () => {
    const info = projectInfo[button.dataset.project];
    if (!info) return;
    document.getElementById("modalTitle").textContent = info.title;
    document.getElementById("modalDescription").textContent = info.description;
    const list = document.getElementById("modalFeatures");
    list.replaceChildren();
    info.features.forEach((feature) => {
      const item = document.createElement("li");
      item.textContent = feature;
      list.appendChild(item);
    });
    projectModal.showModal();
    modalClose.focus();
  });
});

function closeModal() {
  if (projectModal.open) projectModal.close();
}
modalClose.addEventListener("click", closeModal);
modalDone.addEventListener("click", closeModal);
projectModal.addEventListener("click", (event) => {
  if (event.target === projectModal) closeModal();
});

// Animate elements when they enter the viewport; show them immediately if unsupported.
const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("visible"));
}

document.getElementById("year").textContent = new Date().getFullYear();

// Public GitHub API: update the username below if your GitHub username changes.
const githubUsername = "rikashh-cmd";
const repoList = document.getElementById("repoList");
const apiStatus = document.getElementById("apiStatus");

async function loadGitHubRepositories() {
  try {
    const response = await fetch(`https://api.github.com/users/${encodeURIComponent(githubUsername)}/repos?sort=updated&per_page=4&type=owner`, {
      headers: { "Accept": "application/vnd.github+json" }
    });
    if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);
    const repositories = await response.json();
    repoList.replaceChildren();

    if (!repositories.length) {
      apiStatus.textContent = "No public repositories were found yet. Add public repositories to GitHub and they'll appear here.";
      return;
    }

    repositories.slice(0, 4).forEach((repo) => {
      const link = document.createElement("a");
      link.className = "repo-item";
      link.href = repo.html_url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      const head = document.createElement("div");
      head.className = "repo-item-head";
      const name = document.createElement("span");
      name.className = "repo-name";
      name.textContent = repo.name;
      const arrow = document.createElement("span");
      arrow.className = "repo-arrow";
      arrow.setAttribute("aria-hidden", "true");
      arrow.textContent = "↗";
      head.append(name, arrow);
      const description = document.createElement("p");
      description.className = "repo-description";
      description.textContent = repo.description || "No description added yet.";
      const meta = document.createElement("div");
      meta.className = "repo-meta";
      const language = document.createElement("span");
      language.textContent = repo.language || "Code";
      const stars = document.createElement("span");
      stars.textContent = `★ ${repo.stargazers_count}`;
      const forks = document.createElement("span");
      forks.textContent = `⑂ ${repo.forks_count}`;
      meta.append(language, stars, forks);
      link.append(head, description, meta);
      repoList.appendChild(link);
    });
    apiStatus.textContent = `Showing your latest public repositories from GitHub.`;
  } catch (error) {
    repoList.replaceChildren();
    const fallback = document.createElement("div");
    fallback.className = "repo-item";
    const title = document.createElement("div");
    title.className = "repo-name";
    title.textContent = "View repositories on GitHub ↗";
    const description = document.createElement("p");
    description.className = "repo-description";
    description.textContent = "Repositories could not be loaded right now. You can still open your GitHub profile directly.";
    fallback.append(title, description);
    repoList.appendChild(fallback);
    apiStatus.textContent = "GitHub API is unavailable right now or the username needs checking.";
    console.error("Unable to load GitHub repositories:", error);
  }
}
loadGitHubRepositories();
