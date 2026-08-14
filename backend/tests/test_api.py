from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)

SAMPLE_OPEN_METEO = {
    "latitude": 40.71,
    "longitude": -74.01,
    "daily": {
        "time": ["2024-01-01", "2024-01-02"],
        "temperature_2m_max": [7.7, 5.7],
        "temperature_2m_min": [0.2, -4.6],
        "apparent_temperature_max": [4.4, 1.2],
        "apparent_temperature_min": [-4.0, -8.4],
    },
}


@patch("main.list_files", return_value=[])
def test_list_files_empty(_mock):
    response = client.get("/list-weather-files")
    assert response.status_code == 200
    assert response.json() == {"files": []}


@patch("main.list_files", return_value=[{"name": "weather_40.71_-74.01_2024-01-01_2024-01-07_20240101T120000Z.json", "size": 900, "created_at": "2024-01-01T12:00:00+00:00"}])
def test_list_files_with_data(_mock):
    response = client.get("/list-weather-files")
    assert response.status_code == 200
    body = response.json()
    assert len(body["files"]) == 1
    assert body["files"][0]["name"].startswith("weather_")


@patch("main.fetch_open_meteo", return_value=SAMPLE_OPEN_METEO)
@patch("main.store_json")
@patch("main.build_file_name", return_value="weather_40.71_-74.01_2024-01-01_2024-01-07_20240101T120000Z.json")
def test_store_weather_success(_name, _store, _fetch):
    response = client.post(
        "/store-weather-data",
        json={
            "latitude": 40.71,
            "longitude": -74.01,
            "start_date": "2024-01-01",
            "end_date": "2024-01-07",
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["file"].startswith("weather_")


def test_store_weather_invalid_latitude():
    response = client.post(
        "/store-weather-data",
        json={
            "latitude": 999,
            "longitude": -74.01,
            "start_date": "2024-01-01",
            "end_date": "2024-01-07",
        },
    )
    assert response.status_code == 400
    body = response.json()
    assert body["status"] == "error"


def test_store_weather_range_too_long():
    response = client.post(
        "/store-weather-data",
        json={
            "latitude": 40.71,
            "longitude": -74.01,
            "start_date": "2024-01-01",
            "end_date": "2024-02-10",
        },
    )
    assert response.status_code == 400
    assert response.json()["status"] == "error"


@patch("main.read_json", return_value=SAMPLE_OPEN_METEO)
def test_read_file_success(_mock):
    name = "weather_40.71_-74.01_2024-01-01_2024-01-07_20240101T120000Z.json"
    response = client.get(f"/weather-file-content/{name}")
    assert response.status_code == 200
    assert "daily" in response.json()


def test_read_file_not_found():
    response = client.get("/weather-file-content/not-a-valid-file.json")
    assert response.status_code == 404
    body = response.json()
    assert body["status"] == "error"
    assert body["message"] == "not found"
