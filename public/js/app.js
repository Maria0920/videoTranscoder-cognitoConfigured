document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (token && isValidToken(token)) {
    showMainContent(); // Show main content if token exists and is valid
  } else {
    showLoginPage(); // Show login page if no token or invalid token
  }

  // Add event listener to the logout button
  document.querySelector(".logout-button").addEventListener("click", logout);
});

function isValidToken(token) {
  // Implement your token validation logic here
  // For example, make an API call to check if the token is valid
  return true; // Replace with actual token validation
}

function showLoginPage() {
  document.getElementById("loginPage").style.display = "block";
  document.getElementById("mainContent").style.display = "none";
  history.pushState(null, "Login", "/login");
}

function showMainContent() {
  const username = localStorage.getItem("username");
  document
    .getElementById("profileSection")
    .querySelector("h2").textContent = `Welcome, ${username}!`;

  document.getElementById("loginPage").style.display = "none";
  document.getElementById("mainContent").style.display = "block";
  showPage("videosList");
  loadFiles();
}

function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  fetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })
    .then((response) => {
      if (response.ok) return response.json();
      throw new Error("Login failed");
    })
    .then((data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", username);
      showMainContent(); // Redirect to the main content page
    })
    .catch((error) => {
      console.error("Login error:", error);
      alert("An error occurred during login");
    });
}

function signup() {
  const username = document.getElementById("signupUsername").value;
  const password = document.getElementById("signupPassword").value;

  fetch("/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })
    .then((response) => {
      if (response.ok) return response.json();
      throw new Error("Signup failed");
    })
    .then((data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", username);
      showMainContent(); // Redirect to the main content page
    })
    .catch((error) => {
      console.error("Signup error:", error);
      alert("An error occurred during signup");
    });
}

function showPage(pageId) {
  document.querySelectorAll(".page-section").forEach((section) => {
    section.style.display = "none";
  });
  const selectedSection = document.getElementById(pageId);
  if (selectedSection) selectedSection.style.display = "block";
  history.pushState(null, pageId, `/${pageId}`);
}

window.addEventListener("popstate", () => {
  const path = window.location.pathname.replace("/", "");
  showPage(path || "videosList");
});

async function loadFiles() {
  try {
    const response = await fetch("/files", {
      method: "GET",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (response.ok) {
      const files = await response.json();
      renderFileList(files);
    } else {
      alert("Failed to load files");
    }
  } catch (error) {
    console.error("Load files error:", error);
    alert("An error occurred while loading files");
  }
}

function renderFileList(files) {
  const fileList = document.getElementById("fileList");
  fileList.innerHTML = "";
  files.forEach((file) => {
    const div = document.createElement("div");
    div.classList.add("file-item");

    const fileNameWithoutExtension = file.filename
      .split(".")
      .slice(0, -1)
      .join(".");

    const img = document.createElement("img");
    img.src = `/thumbnails/${fileNameWithoutExtension}.png`;
    img.alt = file.filename;
    img.classList.add("thumbnail");

    const filename = document.createElement("div");
    filename.textContent = file.filename;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.classList.add("delete-button");
    deleteButton.onclick = () => deleteFile(file.id);

    const downloadButton = document.createElement("button");
    downloadButton.textContent = "Download";
    downloadButton.classList.add("download-button");
    downloadButton.onclick = () => downloadFile(file.id, file.filename);

    div.appendChild(img);
    div.appendChild(filename);
    div.appendChild(deleteButton);
    div.appendChild(downloadButton);

    fileList.appendChild(div);

    const option = document.createElement("option");
    option.value = file.id;
    option.textContent = file.filename;
    document.getElementById("videoSelect").appendChild(option);
  });
}

async function deleteFile(fileId) {
  if (!confirm("Are you sure you want to delete this file?")) return;

  try {
    const response = await fetch(`/files/${fileId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (response.ok) {
      alert("File deleted successfully");
      loadFiles();
    } else {
      alert("Failed to delete file");
    }
  } catch (error) {
    console.error("Delete file error:", error);
    alert("An error occurred while deleting the file");
  }
}

function downloadFile(fileId, filename) {
  const a = document.createElement("a");
  a.href = `/files/${fileId}/download`;
  a.download = filename;
  a.click();
}

async function uploadVideo() {
  const fileInput = document.getElementById("videoUpload");
  const file = fileInput.files[0];
  if (!file) {
    alert("Please select a file to upload");
    return;
  }

  const formData = new FormData();
  formData.append("video", file);

  try {
    const response = await fetch("/files/upload", {
      method: "POST",
      body: formData,
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (response.ok) {
      alert("Video uploaded successfully");
      loadFiles();
    } else {
      alert("Failed to upload video");
    }
  } catch (error) {
    console.error("Upload video error:", error);
    alert("An error occurred while uploading the video");
  }
}

async function startTranscoding() {
  const videoId = document.getElementById("videoSelect").value;
  if (!videoId) {
    alert("Please select a video to transcode");
    return;
  }

  try {
    const response = await fetch(`/transcode/${videoId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (response.ok) {
      const progressBar = document.getElementById("progress-bar");
      progressBar.style.display = "block";
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        const progress = JSON.parse(decoder.decode(value)).progress;
        progressBar.value = progress;
      }
      alert("Transcoding complete");
    } else {
      alert("Failed to start transcoding");
    }
  } catch (error) {
    console.error("Transcoding error:", error);
    alert("An error occurred while transcoding the video");
  }
}

function logout() {
  // Clear localStorage to remove user data
  localStorage.removeItem("token");
  localStorage.removeItem("username");

  // Close any WebSocket connection if needed
  closeWebSocket();

  // Redirect to index.html (login page)
  window.location.href = "index.html";
}

function closeWebSocket() {
  // Assuming `ws` is your WebSocket variable. Adjust if necessary.
  if (typeof ws !== "undefined" && ws.readyState === WebSocket.OPEN) {
    ws.close();
  }
}
