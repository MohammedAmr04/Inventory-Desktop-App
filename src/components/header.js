// Dynamically load header, highlight active page, fetch user info, and handle logout
export async function loadHeader(activePage) {
  const headerContainer = document.createElement("div");
  headerContainer.id = "headerContainer";
  document.body.prepend(headerContainer);
  // Load header HTML
  const res = await fetch("../components/header.html");
  headerContainer.innerHTML = await res.text();
  // Load header CSS
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "../styles/header.css";
  document.head.appendChild(link);
  // Highlight active nav link
  const navLinks = headerContainer.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    if (link.dataset.page === activePage) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
    link.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = link.getAttribute("href");
    });
  });
  // Fetch user info
  let userId = window.localStorage.getItem("user_id") || 1;
  try {
    const username = await window.electronAPI.getUsernameById(Number(userId));
    headerContainer.querySelector("#headerUserInfo").textContent = `Welcome, ${
      username || "Guest"
    }`;
  } catch (err) {
    headerContainer.querySelector("#headerUserInfo").textContent =
      "Welcome, Guest";
    console.error("Failed to fetch username", err);
  }
  // Logout
  headerContainer
    .querySelector("#headerLogoutBtn")
    .addEventListener("click", () => {
      window.localStorage.removeItem("user_id");
      alert("Logged out!");
      window.location.reload();
    });
}
