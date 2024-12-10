/** @format */

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { CssVarsProvider } from "@mui/joy/styles";

ReactDOM.createRoot(document.getElementById("root")).render(
 <BrowserRouter>
  <CssVarsProvider defaultMode="dark">
   <App />
  </CssVarsProvider>
 </BrowserRouter>
);
