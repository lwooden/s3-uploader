import type { ComponentType, ReactNode } from "react";
import type { OidcInitializationError } from "oidc-spa/core";
import { oidcSpa } from "oidc-spa/react-spa";

const oidcUtils = oidcSpa.createUtils();

export const bootstrapOidc = oidcUtils.bootstrapOidc;
export const useOidc = oidcUtils.useOidc;
export const getOidc = oidcUtils.getOidc;
export const OidcInitializationGate = oidcUtils.OidcInitializationGate;

/** Runtime always exposes this; typings omit it when autoLogin is false. */
export const OidcInitializationErrorGate = (
	oidcUtils as typeof oidcUtils & {
		OidcInitializationErrorGate: (props: {
			errorComponent: ComponentType<{
				oidcInitializationError: OidcInitializationError;
			}>;
			children: ReactNode;
		}) => ReactNode;
	}
).OidcInitializationErrorGate;

/**
 * Real OIDC bootstrap parameters for Vite. Set in `.env.local` (see `.env.example`).
 */
export function getOidcBootstrapParams() {
	const issuerUri = import.meta.env.VITE_OIDC_ISSUER_URI;
	const clientId = import.meta.env.VITE_OIDC_CLIENT_ID;
	if (typeof issuerUri !== "string" || !issuerUri.trim()) {
		throw new Error(
			"Missing VITE_OIDC_ISSUER_URI. Copy .env.example to .env.local and set OIDC variables.",
		);
	}
	if (typeof clientId !== "string" || !clientId.trim()) {
		throw new Error(
			"Missing VITE_OIDC_CLIENT_ID. Copy .env.example to .env.local and set OIDC variables.",
		);
	}
	return {
		implementation: "real" as const,
		issuerUri: issuerUri.trim(),
		clientId: clientId.trim(),
		scopes: ["profile", "email"],
		debugLogs: import.meta.env.DEV,
	};
}
