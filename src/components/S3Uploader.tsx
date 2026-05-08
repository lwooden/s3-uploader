import { useMemo, useRef, useState, useEffect } from "react";
import { getS3UploaderEnv, type S3UploaderEnv } from "../utils/env";
import { defaultObjectKey, joinS3Key } from "../utils/key";
import {
	uploadFileToS3,
	type UploadProgress,
	type UploadResult,
} from "../utils/s3Uploader";

const mono = "font-mono text-[13px] text-slate-800 dark:text-slate-200";
const labelCls =
	"text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400";

type S3UploaderProps = {
	userId: string;
	onSignOut?: () => void;
};

export function S3Uploader({ userId, onSignOut }: S3UploaderProps) {
	const env = useMemo((): S3UploaderEnv | { error: string } => {
		try {
			return getS3UploaderEnv();
		} catch (e) {
			return { error: e instanceof Error ? e.message : String(e) };
		}
	}, []);

	const [files, setFiles] = useState<File[]>([]);
	const [keyPrefix, setKeyPrefix] = useState<string>(() => {
		return (env as { keyPrefix?: string }).keyPrefix ?? "";
	});
	const [status, setStatus] = useState<
		| { state: "idle" }
		| { state: "uploading"; fileName: string; progress: UploadProgress }
		| { state: "done"; result: UploadResult }
		| { state: "error"; message: string }
		| { state: "aborted" }
	>({ state: "idle" });

	const abortRef = useRef<AbortController | null>(null);

	const canUpload =
		!("error" in env) && files.length > 0 && status.state !== "uploading";

	const bucket = "error" in env ? "" : env.bucket;
	const region = "error" in env ? "" : env.region;
	const project = "error" in env ? "" : env.projectName;

	const inputCls =
		"w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100 dark:file:bg-slate-700 dark:file:text-slate-200";

	return (
		<main className="mx-auto w-full max-w-4xl space-y-5 px-5 py-12 text-left">
			<header className="flex flex-wrap items-start justify-between gap-4">
				<div>
					<h1 className="text-4xl font-medium tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl">
						{project} Uploader
					</h1>

					<p className={`mt-2 text-sm text-slate-600 dark:text-slate-400`}>
						Signed in as{" "}
						<span className={`${mono} text-slate-900 dark:text-slate-100`}>
							{userId}
						</span>
					</p>
				</div>
				<div className="flex flex-col items-end gap-3">
					{onSignOut ? (
						<button
							type="button"
							className="rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
							onClick={onSignOut}
						>
							Sign out
						</button>
					) : null}
					<div className="flex flex-wrap gap-6">
						<div>
							<div className={labelCls}>Bucket</div>
							<div className={mono}>{bucket || "—"}</div>
						</div>
						<div>
							<div className={labelCls}>Region</div>
							<div className={mono}>{region || "—"}</div>
						</div>
					</div>
				</div>
			</header>

			{"error" in env ? (
				<section
					className="rounded-2xl border border-red-300/60 bg-red-50/90 p-5 dark:border-red-500/35 dark:bg-red-950/45"
					role="alert"
				>
					<h2 className="text-xl font-medium text-slate-900 dark:text-slate-100">
						Missing configuration
					</h2>
					<p className={`mt-2 ${mono} text-red-900 dark:text-red-200`}>
						{env.error}
					</p>
					<p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
						Create a <span className={mono}>.env.local</span> (see{" "}
						<span className={mono}>.env.example</span>).
					</p>
				</section>
			) : (
				<section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/55">
					<div className="grid gap-3 sm:grid-cols-2">
						<label className="flex flex-col gap-1.5">
							<span className={labelCls}>Key prefix (optional)</span>
							<input
								className={inputCls}
								value={keyPrefix}
								onChange={(e) => setKeyPrefix(e.target.value)}
								placeholder={env.keyPrefix ?? "uploads/"}
								disabled // don't allow the prefix to be modified
							/>
						</label>

						<label className="flex flex-col gap-1.5">
							<span className={labelCls}>Files</span>
							<input
								className={inputCls}
								type="file"
								multiple
								onChange={(e) => {
									const next = Array.from(e.target.files ?? []);
									// file extension validation
									for (const file of next) {
										if (file.name.toLowerCase().endsWith(".png")) {
											alert(
												"JPG files are not allowed. Please upload a file with a different extension.",
											);
											next.filter((f) => f.name !== file.name);
											return;
										}
									}
									setFiles(next);
									setStatus({ state: "idle" });
								}}
							/>
						</label>
					</div>

					{files.length > 0 ? (
						<ul className="mt-4 space-y-2">
							{files.map((f) => (
								<li
									key={`${f.name}-${f.size}-${f.lastModified}`}
									className="flex items-baseline justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/90 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800/50"
								>
									<span className={mono}>{f.name}</span>
									<span className="text-sm text-slate-500 dark:text-slate-400">
										{Math.round(f.size / 1024)} KB
									</span>
								</li>
							))}
						</ul>
					) : (
						<p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
							Choose one or more files to upload.
						</p>
					)}

					<div className="mt-4 flex flex-wrap gap-2.5">
						<button
							type="button"
							className="rounded-xl border border-blue-950/25 bg-blue-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50 dark:border-blue-300/15 dark:bg-blue-900 dark:hover:bg-blue-800"
							disabled={!canUpload}
							onClick={async () => {
								if ("error" in env) return;
								const cfg = env;
								abortRef.current = new AbortController();

								try {
									for (const file of files) {
										const key = joinS3Key(
											keyPrefix || cfg.keyPrefix,
											defaultObjectKey(file.name),
										);

										setStatus({
											state: "uploading",
											fileName: file.name,
											progress: { loaded: 0, total: file.size, percent: 0 },
										});

										const result = await uploadFileToS3({
											userId,
											region: cfg.region,
											bucket: cfg.bucket,
											key,
											cloudwatchLogGroupName: cfg.cloudwatchLogGroupName,
											cloudwatchLogStreamName: cfg.cloudwatchLogStreamName,
											file,
											acl: cfg.acl,
											credentials: {
												accessKeyId: cfg.accessKeyId,
												secretAccessKey: cfg.secretAccessKey,
												sessionToken: cfg.sessionToken,
											},
											abortSignal: abortRef.current.signal,
											onProgress: (progress) => {
												setStatus((prev) =>
													prev.state === "uploading"
														? { ...prev, progress }
														: prev,
												);
											},
										});

										setStatus({ state: "done", result });
									}
								} catch (e) {
									if (abortRef.current?.signal.aborted) {
										setStatus({ state: "aborted" });
										return;
									}
									setStatus({
										state: "error",
										message: e instanceof Error ? e.message : String(e),
									});
								} finally {
									abortRef.current = null;
								}
							}}
						>
							Send to TSDH
						</button>

						<button
							type="button"
							className="rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
							disabled={status.state !== "uploading"}
							onClick={() => abortRef.current?.abort()}
						>
							Cancel
						</button>
					</div>

					{status.state === "uploading" ? (
						<div className="mt-4 space-y-2 rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-800/40">
							<div className={labelCls}>Uploading</div>
							<div className={mono}>{status.fileName}</div>
							<div className="flex items-center gap-3">
								<progress
									className="h-2.5 w-full flex-1 rounded-full accent-violet-600 [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-slate-200 dark:[&::-webkit-progress-bar]:bg-slate-700"
									value={status.progress.percent ?? 0}
									max={100}
								/>
								<span className={`shrink-0 ${mono}`}>
									{status.progress.percent ?? 0}%
								</span>
							</div>
						</div>
					) : null}

					{status.state === "done" ? (
						<div className="mt-4 space-y-2 rounded-xl border border-emerald-300/50 bg-emerald-50/60 p-3 dark:border-emerald-500/30 dark:bg-emerald-950/35">
							<div className={labelCls}>Uploaded</div>
							<div className={mono}>{status.result.key}</div>
							{status.result.location ? (
								<a
									className={`${mono} break-all text-violet-700 underline decoration-violet-300 underline-offset-2 hover:text-violet-600 dark:text-violet-400 dark:decoration-violet-600`}
									href={status.result.location}
									target="_blank"
									rel="noreferrer"
								>
									{status.result.location}
								</a>
							) : null}
						</div>
					) : null}

					{status.state === "aborted" ? (
						<div className="mt-4 space-y-1 rounded-xl border border-amber-300/60 bg-amber-50/70 p-3 dark:border-amber-500/35 dark:bg-amber-950/40">
							<div className={labelCls}>Cancelled</div>
							<div className="text-sm text-slate-600 dark:text-slate-400">
								Upload was aborted.
							</div>
						</div>
					) : null}

					{status.state === "error" ? (
						<div className="mt-4 space-y-2 rounded-xl border border-red-300/60 bg-red-50/80 p-3 dark:border-red-500/30 dark:bg-red-950/40">
							<div className={labelCls}>Error</div>
							<div className={`${mono} text-red-900 dark:text-red-200`}>
								{status.message}
							</div>
						</div>
					) : null}
				</section>
			)}

			<footer className="text-xs text-slate-500 dark:text-slate-500"></footer>
		</main>
	);
}
