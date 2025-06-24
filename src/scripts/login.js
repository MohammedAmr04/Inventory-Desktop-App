const form = document.getElementById("loginForm");
const errorMsg = document.getElementById("error");
document
  .getElementById("createAccountBtn")
  .addEventListener("click", function () {
    window.location.href = "src/views/register.html";
  });
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const response = await window.electronAPI.loginUser({ username, password });

    if (response.success) {
      // Redirect to dashboard or main page
      window.location.href = "src/views/products.html";
      console.log("dashboard");
    } else {
      errorMsg.textContent = response.message;
    }
  } catch (err) {
    console.error("Login failed:", err);
    errorMsg.textContent = "Something went wrong!";
  }
});
