import { useMemo } from "react";
import { getS3UploaderEnv, type S3UploaderEnv } from "../utils/env";

const mono = "font-mono text-[13px] text-slate-800 dark:text-slate-200";

type LoginProps = {
	onSignIn: () => void;
	initErrorMessage?: string;
};

export function Login({ onSignIn, initErrorMessage }: LoginProps) {
	const env = useMemo((): S3UploaderEnv | { error: string } => {
		try {
			return getS3UploaderEnv();
		} catch (e) {
			return { error: e instanceof Error ? e.message : String(e) };
		}
	}, []);

	const project = "error" in env ? "" : env.projectName;

	return (
		<main className="mx-auto w-full max-w-md space-y-5 px-5 py-12 text-left">
			<header>
				<h1 className="text-3xl font-medium tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
					{project} Uploader
				</h1>
				<p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
					Sign in. You will be redirected to your identity provider and returned
					here.
				</p>
			</header>

			<div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/55">
				{initErrorMessage ? (
					<p className={`${mono} text-red-800 dark:text-red-200`} role="alert">
						{initErrorMessage}
					</p>
				) : null}

				<button
					type="button"
					className="mt-4 w-full rounded-xl border border-blue-950/25 bg-blue-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-800 dark:border-blue-300/15 dark:bg-blue-900 dark:hover:bg-blue-800"
					onClick={onSignIn}
				>
					Sign in with JANUS
				</button>
			</div>
		</main>
	);
}
