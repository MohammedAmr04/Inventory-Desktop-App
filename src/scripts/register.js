document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const errorEl = document.getElementById("error");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.textContent = "";
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!username || !password || !confirmPassword) {
      errorEl.textContent = "All fields are required.";
      return;
    }
    if (password !== confirmPassword) {
      errorEl.textContent = "Passwords do not match.";
      return;
    }

    try {
      const result = await window.electronAPI.registerUser({
        username,
        password,
      });
      if (result.success) {
        alert("Registration successful! You can now log in.");
        window.location.href = "../../index.html";
      } else {
        errorEl.textContent = result.message;
      }
    } catch (err) {
      errorEl.textContent = "Registration failed. Please try again.";
    }
  });
});
