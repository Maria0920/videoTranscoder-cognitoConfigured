document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signupForm");

  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = document.getElementById("username").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      try {
        const response = await fetch("/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, email, password, confirmPassword }),
        });

        const data = await response.json();

        if (response.ok) {
          alert(data.message || "Signup successful!");
          window.location.href = "/login.html";
        } else {
          alert(data.message || "Signup failed");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    });
  }
});
