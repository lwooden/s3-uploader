import { useMemo, useState, type FormEvent } from "react"
import { isAuthorizedUserId } from "../auth/localAuth"
import { getS3UploaderEnv, type S3UploaderEnv } from "../utils/env"

const mono = "font-mono text-[13px] text-slate-800 dark:text-slate-200"
const labelCls =
  "text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400"
const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100"

type LoginProps = {
  onAuthenticated: (userId: string) => void
}

export function Login({ onAuthenticated }: LoginProps) {
  const env = useMemo((): S3UploaderEnv | { error: string } => {
    try {
      return getS3UploaderEnv()
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) }
    }
  }, [])

  const [userId, setUserId] = useState("")
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = userId.trim()
    if (!trimmed) {
      setError("Enter a user id.")
      return
    }
    if (!isAuthorizedUserId(trimmed)) {
      setError("Authentication failed.")
      return
    }
    setError(null)
    onAuthenticated(trimmed)
  }

  const project = "error" in env ? "" : env.projectName

  return (
    <main className="mx-auto w-full max-w-md space-y-5 px-5 py-12 text-left">
      <header>
        <h1 className="text-3xl font-medium tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
          {project} Uploader
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Enter your assinged UserID to authenticate.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/55"
      >
        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>User id</span>
          <input
            className={inputCls}
            name="userid"
            autoComplete="username"
            value={userId}
            onChange={(e) => {
              setUserId(e.target.value)
              if (error) setError(null)
            }}
            placeholder="e.g. testuser"
          />
        </label>

        {error ? (
          <p
            className={`mt-3 ${mono} text-red-800 dark:text-red-200`}
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          className="mt-4 w-full rounded-xl border border-blue-950/25 bg-blue-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-800 dark:border-blue-300/15 dark:bg-blue-900 dark:hover:bg-blue-800"
        >
          Continue
        </button>

        <p
          className={`mt-4 text-xs text-slate-500 dark:text-slate-500 ${mono}`}
        ></p>
      </form>
    </main>
  )
}
