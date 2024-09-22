document.addEventListener("DOMContentLoaded", async () => {
  const username = localStorage.getItem("username"); // Ensure you store the username during signup

  const response = await fetch("/auth/mfa/setup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username }),
  });

  const result = await response.json();

  if (result.qrCodeUrl) {
    qrCodeImage.src = result.qrCodeUrl; // Set QR code image
  } else {
    document.getElementById("message").innerText =
      result.message || "Error fetching QR code.";
  }

  document
    .getElementById("verifyButton")
    .addEventListener("click", async () => {
      const totpCode = document.getElementById("totpCode").value;

      const verifyResponse = await fetch("/auth/mfa/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ totpCode }), // Include the session if necessary
      });

      const verifyResult = await verifyResponse.json();
      document.getElementById("message").innerText = verifyResult.message;

      if (verifyResult.message === "MFA setup successful!") {
        // Redirect to index.html after successful verification
        window.location.href = "index.html";
      }
    });
});
