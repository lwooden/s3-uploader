import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { OidcBootstrapErrorScreen } from "./components/OidcBootstrapErrorScreen";
import {
	bootstrapOidc,
	getOidcBootstrapParams,
	OidcInitializationErrorGate,
	OidcInitializationGate,
} from "./oidc";

bootstrapOidc(getOidcBootstrapParams());

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
		<OidcInitializationGate
			fallback={
				<p className="px-5 py-8 text-center text-sm text-slate-600 dark:text-slate-400">
					Loading sign-in…
				</p>
			}
		>
			<OidcInitializationErrorGate errorComponent={OidcBootstrapErrorScreen}>
				<App />
			</OidcInitializationErrorGate>
		</OidcInitializationGate>
	</StrictMode>,
);
