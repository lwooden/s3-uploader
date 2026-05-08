import { Login } from "./components/Login";
import { S3Uploader } from "./components/S3Uploader";
import { useOidc } from "./oidc";

function userIdFromDecodedIdToken(token: Record<string, unknown>): string {
	const preferred = token.preferred_username;
	const email = token.email;
	const sub = token.sub;
	if (typeof preferred === "string" && preferred.length > 0) return preferred;
	if (typeof email === "string" && email.length > 0) return email;
	if (typeof sub === "string" && sub.length > 0) return sub;
	return "unknown";
}

export default function App() {
	const oidc = useOidc();
	console.log(oidc);

	if (!oidc.isUserLoggedIn) {
		return (
			<Login
				onSignIn={() => void oidc.login()}
				initErrorMessage={oidc.initializationError?.message}
			/>
		);
	}

	const userId = userIdFromDecodedIdToken(
		oidc.decodedIdToken as Record<string, unknown>,
	);

	return (
		<S3Uploader
			userId={userId}
			onSignOut={() => void oidc.logout({ redirectTo: "current page" })}
		/>
	);
}
