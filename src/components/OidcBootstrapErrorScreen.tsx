import type { OidcInitializationError } from "oidc-spa/core";

type Props = {
	oidcInitializationError: OidcInitializationError;
};

export function OidcBootstrapErrorScreen({ oidcInitializationError }: Props) {
	return (
		<main
			className="mx-auto max-w-lg px-5 py-12 text-left"
			role="alert"
		>
			<h1 className="text-xl font-medium text-slate-900 dark:text-slate-100">
				Sign-in unavailable
			</h1>
			<p className="mt-3 font-mono text-sm text-red-800 dark:text-red-200">
				{oidcInitializationError.message}
			</p>
		</main>
	);
}
