// Index.js

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId="95854064737-4l51t3i0vegcl2051css7f9593uv2me0.apps.googleusercontent.com">
    <React.StrictMode>
      <App />
    </React.StrictMode>
    ,
  </GoogleOAuthProvider>
);
