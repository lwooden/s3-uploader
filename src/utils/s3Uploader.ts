import { S3Client } from "@aws-sdk/client-s3"
import { Upload } from "@aws-sdk/lib-storage"
import {
  CloudWatchLogsClient,
  PutLogEventsCommand,
} from "@aws-sdk/client-cloudwatch-logs"
import type { UploadAcl } from "./env"

export type UploadProgress = {
  loaded: number
  total?: number
  percent?: number
}

export type UploadResult = {
  bucket: string
  key: string
  etag?: string
  location?: string
}

export type UploadParams = {
  userId: string
  region: string
  bucket: string
  key: string
  file: File
  contentType?: string
  acl: UploadAcl
  credentials: {
    accessKeyId: string
    secretAccessKey: string
    sessionToken?: string
  }
  onProgress?: (p: UploadProgress) => void
  abortSignal?: AbortSignal
  cloudwatchLogGroupName: string
  cloudwatchLogStreamName: string
}

export type CloudwatchLogParams = {
  logGroupName: string
  logStreamName: string
  logEvents: [
    {
      timestamp: number
      message: string
    },
  ]
}

function contentTypeFor(file: File): string | undefined {
  return file.type || undefined
}

export async function uploadFileToS3({
  userId,
  region,
  bucket,
  key,
  file,
  contentType,
  acl,
  credentials,
  onProgress,
  abortSignal,
  cloudwatchLogGroupName,
  cloudwatchLogStreamName,
}: UploadParams): Promise<UploadResult> {
  const client = new S3Client({
    region,
    credentials,
    // Avoid auto-enabling checksum requirements that can break multipart completion in browser uploads.
    requestChecksumCalculation: "WHEN_REQUIRED",
  })
  const cloudWatch = new CloudWatchLogsClient({
    region,
    credentials,
  })

  const logParams: CloudwatchLogParams = {
    logGroupName: cloudwatchLogGroupName,
    logStreamName: cloudwatchLogStreamName,
    logEvents: [
      {
        timestamp: Date.now(),
        message: `File ${file.name} uploaded to S3 by user ${userId}`,
      },
    ],
  }

  const upload = new Upload({
    client,
    params: {
      Bucket: bucket,
      Key: key,
      Body: file,
      ContentType: contentType ?? contentTypeFor(file),
      ACL: acl,
    },
    queueSize: 4,
    partSize: 8 * 1024 * 1024,
    leavePartsOnError: false,
  })

  if (abortSignal) {
    abortSignal.addEventListener(
      "abort",
      () => {
        upload.abort()
      },
      { once: true },
    )
  }

  upload.on("httpUploadProgress", (evt) => {
    const loaded = typeof evt.loaded === "number" ? evt.loaded : 0
    const total = typeof evt.total === "number" ? evt.total : undefined
    const percent = total ? Math.round((loaded / total) * 100) : undefined
    onProgress?.({ loaded, total, percent })
  })

  const result = await upload.done()

  const command = new PutLogEventsCommand(logParams)
  const response = await cloudWatch.send(command)
  console.log(response)

  const uploadOutput = result as { ETag?: string; Location?: string }
  return {
    bucket,
    key,
    etag: uploadOutput.ETag,
    location: uploadOutput.Location,
  }
}
