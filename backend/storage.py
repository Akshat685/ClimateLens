import json
import os
import re
from datetime import datetime, timezone
from typing import Any

import boto3
from botocore.exceptions import BotoCoreError, ClientError
from fastapi import HTTPException

from validation import WeatherRequest

FILE_PATTERN = re.compile(
    r"^weather_[^/]+_[^/]+_\d{4}-\d{2}-\d{2}_\d{4}-\d{2}-\d{2}_[0-9TZ]+\.json$"
)


def bucket_name() -> str:
    bucket = os.getenv("AWS_S3_BUCKET") or os.getenv("AWS_BUCKET")
    if not bucket:
        raise HTTPException(status_code=503, detail="AWS S3 is not configured.")
    return bucket


def s3_client() -> Any:
    return boto3.client("s3", region_name=os.getenv("AWS_REGION", "us-east-1"))


def build_file_name(request: WeatherRequest) -> str:
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    return (
        f"weather_{request.latitude}_{request.longitude}_"
        f"{request.start_date}_{request.end_date}_{timestamp}.json"
    )


def store_json(name: str, payload: dict[str, Any]) -> None:
    try:
        s3_client().put_object(
            Bucket=bucket_name(),
            Key=name,
            Body=json.dumps(payload).encode("utf-8"),
            ContentType="application/json",
        )
    except (BotoCoreError, ClientError) as error:
        raise HTTPException(
            status_code=500,
            detail="Unable to store the weather snapshot in AWS S3.",
        ) from error


def list_files() -> list[dict[str, Any]]:
    try:
        response = s3_client().list_objects_v2(Bucket=bucket_name(), Prefix="weather_")
    except (BotoCoreError, ClientError) as error:
        raise HTTPException(
            status_code=500,
            detail="Unable to list weather files from AWS S3.",
        ) from error

    files = [
        {
            "name": item["Key"],
            "size": item.get("Size", 0),
            "created_at": item["LastModified"].isoformat(),
        }
        for item in response.get("Contents", [])
        if item.get("Key", "").endswith(".json")
    ]
    files.sort(key=lambda item: item["created_at"], reverse=True)
    return files


def read_json(name: str) -> dict[str, Any]:
    if not FILE_PATTERN.match(name):
        raise HTTPException(status_code=404, detail="not found")
    try:
        response = s3_client().get_object(Bucket=bucket_name(), Key=name)
        return json.loads(response["Body"].read().decode("utf-8"))
    except ClientError as error:
        if error.response.get("Error", {}).get("Code") in {"NoSuchKey", "404"}:
            raise HTTPException(status_code=404, detail="not found") from error
        raise HTTPException(
            status_code=500,
            detail="Unable to read the weather file from AWS S3.",
        ) from error
    except (BotoCoreError, json.JSONDecodeError) as error:
        raise HTTPException(
            status_code=500,
            detail="Unable to read the weather file from AWS S3.",
        ) from error
