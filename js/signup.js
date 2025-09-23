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

    if (
      !usernameInput.value.trim() ||
      !emailInput.value.trim() ||
      !passwordInput.value.trim()
    ) {
      alert("Semua bagian wajib diisi!");
      return;
    }

    // create data
    const formData = new URLSearchParams();
    formData.append("username", usernameInput.value.trim());
    formData.append("email", emailInput.value.trim());
    formData.append("password", passwordInput.value.trim());

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      const data = await res.json();

      if (data.success) {
        alert("Akun berhasil dibuat!");
        window.location.href = "/login";
      } else {
        alert(data.message || "Pendaftaran gagal!");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Terjadi kesalahan pada server!");
    }
  });
});
