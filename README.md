Author: Lowell Wooden

# S3 Uploader App

# What This App Is Not

An enterprise S3 browser with a backend, persistance layer, and a fully featured authenticaiton and authorization worflow.

# What This App Is

A lightweight React + TypeScript app that provides an interface for users to uploads files directly to a specific AWS S3 bucket (and prefix if so desired) if an automated mechanism is not readily available to do so.

## Authentication

Authentication is managed locally within the app (`auth/localAuth.ts`). Users are provisioned manually based on a need-to-access.

1. Users should be verified in the system of record
2. Sign a user agreement or terms and conditions
3. User is added within the local database using a predetermined naming convention

## Rendering

This app does not utilize react router or any backend features. This is by design. Page navigation is simply managed using conditional rendering via the root `App` component

I am using `@aws-sdk/lib-storage` for multipart uploads and progress reporting.

## Setup

1. Install deps

```bash
npm install
```

1. Create `.env` from the `.en.example`

```bash
cp .env.example .env
```

Fill in:

- `VITE_AWS_REGION`
- `VITE_S3_BUCKET`
- `VITE_AWS_ACCESS_KEY_ID`
- `VITE_AWS_SECRET_ACCESS_KEY`
- Optional: `VITE_AWS_SESSION_TOKEN`
- etc

1. Run

```bash
npm run dev
```

## Deployment

This app is intended to be deployed to an S3 bucket with `Static Web Hosting` enabled with a `CORS Policy` (see below).

### Scripts

You can utilize the scripts in package json to deploy this application to a target S3 bucket

```bash
   npm run build // builds the application bundle for hosting
   npm run deploy:dev // deploys bundle to dev
   npm run clean:dev // deletes all build files in hosted S3 bucket
```

### S3 CORS Config Example

```
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "PUT",
            "POST",
            "DELETE",
            "HEAD"
        ],
        "AllowedOrigins": [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://<HOSTING-BUCKET-NAME>.s3-website-us-east-1.amazonaws.com"
        ],
        "ExposeHeaders": [
            "ETag",
            "x-amz-meta-custom-header"
        ],
        "MaxAgeSeconds": 3000
    }
]
```
