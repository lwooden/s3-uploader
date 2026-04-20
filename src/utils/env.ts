export type UploadAcl = "private" | "public-read"

export type S3UploaderEnv = {
  region: string
  bucket: string
  accessKeyId: string
  secretAccessKey: string
  sessionToken?: string
  keyPrefix?: string
  acl: UploadAcl
  projectName: string
  cloudwatchLogGroupName: string
  cloudwatchLogStreamName: string
}

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing ${name}. Create a .env.local with VITE_* variables (see .env.example).`,
    )
  }
  return value
}

export function getS3UploaderEnv(): S3UploaderEnv {
  const region = required("VITE_AWS_REGION", import.meta.env.VITE_AWS_REGION)
  const bucket = required("VITE_S3_BUCKET", import.meta.env.VITE_S3_BUCKET)
  const accessKeyId = required(
    "VITE_AWS_ACCESS_KEY_ID",
    import.meta.env.VITE_AWS_ACCESS_KEY_ID,
  )
  const secretAccessKey = required(
    "VITE_AWS_SECRET_ACCESS_KEY",
    import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  )
  const sessionToken = import.meta.env.VITE_AWS_SESSION_TOKEN
  const keyPrefix = import.meta.env.VITE_S3_KEY_PREFIX
  const acl = (import.meta.env.VITE_S3_UPLOAD_ACL ?? "private") as UploadAcl

  if (acl !== "private" && acl !== "public-read") {
    throw new Error(`Invalid VITE_S3_UPLOAD_ACL value: ${String(acl)}`)
  }

  const projectName = required(
    "VITE_PROJECT_NAME",
    import.meta.env.VITE_PROJECT_NAME,
  )
  const cloudwatchLogGroupName = required(
    "VITE_CLOUDWATCH_LOG_GROUP_NAME",
    import.meta.env.VITE_CLOUDWATCH_LOG_GROUP_NAME,
  )
  const cloudwatchLogStreamName = required(
    "VITE_CLOUDWATCH_LOG_STREAM_NAME",
    import.meta.env.VITE_CLOUDWATCH_LOG_STREAM_NAME,
  )

  return {
    region,
    bucket,
    accessKeyId,
    secretAccessKey,
    sessionToken,
    keyPrefix,
    acl,
    projectName,
    cloudwatchLogGroupName,
    cloudwatchLogStreamName,
  }
}
