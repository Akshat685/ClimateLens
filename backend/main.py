from pathlib import Path
from typing import Any

from env_loader import load_env_file
from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from storage import build_file_name, list_files, read_json, store_json
from validation import WeatherRequest
from weather import fetch_open_meteo

load_env_file(Path(__file__).resolve().parent / ".env")

app = FastAPI(title="ClimateLens API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.post("/store-weather-data")
def store_weather_data(request: WeatherRequest) -> dict[str, str]:
    name = build_file_name(request)
    payload = fetch_open_meteo(request)
    store_json(name, payload)
    return {"status": "ok", "file": name}


@app.get("/list-weather-files")
def list_weather_files() -> dict[str, list[dict[str, Any]]]:
    return {"files": list_files()}


@app.get("/weather-file-content/{file_name}")
def weather_file_content(file_name: str) -> Any:
    return read_json(file_name)


@app.exception_handler(RequestValidationError)
def validation_exception_handler(_request: Any, exc: RequestValidationError) -> JSONResponse:
    errors = exc.errors()
    message = errors[0]["msg"] if errors else "Invalid request."
    if message.startswith("Value error, "):
        message = message.removeprefix("Value error, ")
    return JSONResponse(status_code=400, content={"status": "error", "message": message})


@app.exception_handler(HTTPException)
def http_exception_handler(_request: Any, exc: HTTPException) -> JSONResponse:
    message = exc.detail if isinstance(exc.detail, str) else "request failed"
    return JSONResponse(status_code=exc.status_code, content={"status": "error", "message": message})
