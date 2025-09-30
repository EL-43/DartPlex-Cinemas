document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector(".btn");
  const usernameInput = document.querySelector('input[name="username"]');
  const emailInput = document.querySelector('input[name="email"]');
  const passwordInput = document.querySelector('input[name="password"]');
  const rememberMe = document.querySelector("#rememberMe");

  const savedUsername = localStorage.getItem("savedUsername");
  const savedEmail = localStorage.getItem("savedEmail");

  if (savedUsername) usernameInput.value = savedUsername;
  if (savedEmail) emailInput.value = savedEmail;
  if (savedUsername || savedEmail) rememberMe.checked = true;

  btn.addEventListener("click", async (e) => {
    e.preventDefault();

    if (
      !usernameInput.value.trim() ||
      !emailInput.value.trim() ||
      !passwordInput.value.trim()
    ) {
      alert("Semua bagian wajib diisi!");
      return;
    }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          username: usernameInput.value.trim(),
          email: emailInput.value.trim(),
          password: passwordInput.value.trim()
        })
      });

      const result = await res.json();

      if (result.success) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("currentUsername", result.username);
        localStorage.setItem("currentEmail", result.email);
        localStorage.setItem("currentRole", result.role || "user");
        localStorage.setItem("isAdmin", result.role === "admin" ? "true" : "false");

        console.log("User role:", result.role);
        console.log("isAdmin:", localStorage.getItem("isAdmin"));

        if (rememberMe.checked) {
          localStorage.setItem("savedUsername", result.username);
          localStorage.setItem("savedEmail", result.email);
        } else {
          localStorage.removeItem("savedUsername");
          localStorage.removeItem("savedEmail");
        }

        // Redirect handling
        const params = new URLSearchParams(window.location.search);
        let redirect = params.get("redirect");

        if (!redirect) {
          redirect = localStorage.getItem("redirectAfterLogin");
          localStorage.removeItem("redirectAfterLogin");
        }

        console.log("Redirect target:", redirect);

        window.location.href = redirect || "/index";
      } else {
        alert(result.message || "Username, email, atau password salah!");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Server bermasalah!");
    }
  });
});
