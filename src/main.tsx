import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<head>
			<title>S3 Uploader</title>
		</head>
		<div className="h-7 w-full bg-yellow-300">
			<p className="text-black font-bold text-center">
				TS/SCI Site Security Clearance
			</p>
		</div>
		<App />
	</StrictMode>,
);
