# ClimateLens

A full-stack historical weather explorer built for the InRisk Labs case study.

## Stack

- **Frontend:** Next.js 13 App Router, React, TypeScript, Tailwind CSS
- **Backend:** Python FastAPI
- **Weather data:** Open-Meteo historical archive
- **Object storage:** AWS S3 (boto3)

## Architecture

The dashboard (Next.js) calls a separate FastAPI backend. The backend fetches weather from Open-Meteo, stores the **full raw API JSON** in S3, and serves list/read endpoints. The frontend parses stored Open-Meteo JSON for charts and tables — it never re-fetches weather data for visualization.

## Features

- Validates latitude (-90 to 90), longitude (-180 to 180), date format, ordering, and a maximum 31-day range
- Fetches daily max/min temperature and apparent max/min temperature
- Stores complete Open-Meteo JSON as `weather_<lat>_<lon>_<start>_<end>_<timestamp>.json`
- Lists S3 objects with metadata using `list_objects_v2`
- Line chart and paginated table (10 / 20 / 50 rows) from stored files
- Responsive layout with loading and error states

## AWS setup

Create an S3 bucket in a free-tier eligible AWS account and an IAM identity limited to that bucket with `s3:ListBucket`, `s3:GetObject`, and `s3:PutObject` permissions.

Copy `backend/.env.example` to `backend/.env` and provide:

```text
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-climate-lens-bucket
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

Keep credentials server-side only. Never expose the secret key through a `NEXT_PUBLIC_` variable.

## Run locally

**1. Backend**

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

**2. Frontend**

Create `.env.local` in the project root:

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/store-weather-data` | Fetch from Open-Meteo and store raw JSON in S3 |
| GET | `/list-weather-files` | List stored files with name, size, created_at |
| GET | `/weather-file-content/{file}` | Return stored JSON (404 → `{"status":"error","message":"not found"}`) |

## Deploy backend (AWS Lambda + API Gateway)

The backend ships with an AWS SAM template (`backend/template.yaml`) that deploys FastAPI on **Lambda** behind an **HTTP API**.

### What you need

1. **AWS account** (free tier is fine)
2. **Existing S3 bucket** — e.g. `climate-lens` in `us-east-1`
3. **AWS CLI** — run `aws configure` with your access keys
4. **AWS SAM CLI**
5. **Python 3.12** on PATH for `sam build` (or Docker Desktop for `--use-container`)

Your IAM user needs deploy permissions beyond S3-only access.

**Inline policy limit (2048 chars total per user):** delete any existing inline policies on `climate-lens-app` first, then attach **one** policy from `backend/iam-deploy-policy.json` (~810 chars). It covers S3 + Lambda deploy.

Alternatively, create a **customer managed policy** (IAM → Policies → Create policy) using `backend/iam-deploy-policy-managed.json` — no size limit issue — and attach it to the user.

### First deploy

```powershell
cd backend
.\deploy.ps1 -BucketName YOUR_S3_BUCKET_NAME -Guided
```

`--Guided` walks you through stack name, region, and permissions. Accept the defaults unless you need a specific region.

Or manually:

```powershell
cd backend
sam build
sam deploy --guided --parameter-overrides S3BucketName=YOUR_S3_BUCKET_NAME
```

When deploy finishes, copy the **ApiUrl** output, e.g.:

```text
https://abc123.execute-api.us-east-1.amazonaws.com
```

Test it:

```powershell
curl https://YOUR_API_URL/list-weather-files
```

### Redeploy after code changes

```powershell
cd backend
.\deploy.ps1 -BucketName YOUR_S3_BUCKET_NAME
```

### Frontend after backend deploy

Set the live API URL in `.env.local` (local) or in your host’s env vars (Netlify/Vercel):

```text
NEXT_PUBLIC_API_BASE_URL=https://YOUR_API_URL
```

Then deploy the Next.js app to **Netlify** or **Vercel** (`netlify.toml` is included).

## Deployment checklist

| Step | Status |
|------|--------|
| Backend on Lambda + API Gateway | Run `backend/deploy.ps1` |
| Frontend on Netlify/Vercel | Set `NEXT_PUBLIC_API_BASE_URL` to ApiUrl |
| Public GitHub repo + commits | Required by case study |

## Design approach

Warm off-white canvas, deep teal for data actions, orange for weather emphasis. Flow: create a snapshot → browse the archive → inspect a selected file. Chart and table values always come from the selected stored JSON file.
