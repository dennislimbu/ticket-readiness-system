import React from "react";
import ReactDOM from "react-dom/client";
import { Amplify } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";
import App from "./App.jsx";
import "./index.css";
import awsConfig from "./awsConfig";

Amplify.configure(awsConfig);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);