import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import {I18nProvider} from "./lib/i18nContext";
import "./styles.css";
import "./v6-shell.css";
import "./v6-workspace.css";
import "./v6-tenant.css";
import "./provider-team.css";
import "./module-workbench.css";
import "./readability.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode><I18nProvider><App/></I18nProvider></React.StrictMode>
);
