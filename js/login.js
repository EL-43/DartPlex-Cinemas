document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector(".btn");
  const usernameInput = document.querySelector('input[name="username"]');
  const emailInput = document.querySelector('input[name="email"]');
  const passwordInput = document.querySelector('input[name="password"]');

  btn.addEventListener("click", async (e) => {
    e.preventDefault();

    //debugging
    /*console.log("Username:", usernameInput?.value);
    console.log("Email:", emailInput?.value);
    console.log("Password:", passwordInput?.value);*/

    if (!usernameInput.value.trim() || 
        !emailInput.value.trim() || 
        !passwordInput.value.trim()) {
      alert("Semua bagian wajib diisi!");
      return;
    }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          username: usernameInput.value,
          email: emailInput.value,
          password: passwordInput.value,
        }),
      });

      const data = await res.json();

      if (data.success) {
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get("redirect");

        if (redirect) {
          window.location.href = redirect; 
        } else {
          window.location.href = "/"; 
        }
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Server bermasalah!");
    }
  });
});
