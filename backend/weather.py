import json
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from fastapi import HTTPException

from validation import WeatherRequest

ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive"
REQUIRED_DAILY_FIELDS = (
    "time",
    "temperature_2m_max",
    "temperature_2m_min",
    "apparent_temperature_max",
    "apparent_temperature_min",
)


def fetch_open_meteo(request: WeatherRequest) -> dict[str, Any]:
    params = urlencode(
        {
            "latitude": request.latitude,
            "longitude": request.longitude,
            "start_date": request.start_date,
            "end_date": request.end_date,
            "daily": ",".join(REQUIRED_DAILY_FIELDS[1:]),
            "timezone": "auto",
        }
    )
    url = f"{ARCHIVE_URL}?{params}"
    req = Request(url, headers={"User-Agent": "ClimateLens/1.0"})

    try:
        with urlopen(req, timeout=30) as response:
            data = json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        message = "The weather provider could not return data for this range."
        try:
            body = json.loads(error.read().decode("utf-8"))
            if isinstance(body, dict):
                if body.get("reason"):
                    message = str(body["reason"])
                elif body.get("error") and isinstance(body.get("error"), str):
                    message = str(body["error"])
        except (json.JSONDecodeError, UnicodeDecodeError):
            pass
        status_code = 400 if error.code == 400 else 502
        raise HTTPException(status_code=status_code, detail=message) from error
    except URLError as error:
        raise HTTPException(
            status_code=502,
            detail="Unable to reach the weather provider. Check your internet connection.",
        ) from error
    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail="The weather provider could not return data for this range.",
        ) from error

    if data.get("error") and data.get("reason"):
        raise HTTPException(status_code=400, detail=str(data["reason"]))

    daily = data.get("daily") or {}
    if any(not daily.get(key) for key in REQUIRED_DAILY_FIELDS):
        raise HTTPException(status_code=502, detail="The weather provider returned an incomplete response.")

    return data
