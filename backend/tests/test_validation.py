import pytest
from datetime import date
from pydantic import ValidationError

from validation import WeatherRequest


def test_valid_request():
    req = WeatherRequest(
        latitude=40.71,
        longitude=-74.01,
        start_date="2024-01-01",
        end_date="2024-01-07",
    )
    assert req.latitude == 40.71
    assert req.end_date == "2024-01-07"


def test_latitude_out_of_range():
    with pytest.raises(ValidationError):
        WeatherRequest(
            latitude=95,
            longitude=-74.01,
            start_date="2024-01-01",
            end_date="2024-01-07",
        )


def test_end_before_start():
    with pytest.raises(ValidationError):
        WeatherRequest(
            latitude=40.71,
            longitude=-74.01,
            start_date="2024-01-10",
            end_date="2024-01-01",
        )


def test_range_over_31_days():
    with pytest.raises(ValidationError):
        WeatherRequest(
            latitude=40.71,
            longitude=-74.01,
            start_date="2024-01-01",
            end_date="2024-02-05",
        )


def test_end_date_in_future():
    future = (date.today().replace(year=date.today().year + 1)).isoformat()
    with pytest.raises(ValidationError):
        WeatherRequest(
            latitude=40.71,
            longitude=-74.01,
            start_date="2024-01-01",
            end_date=future,
        )


def test_invalid_date_format():
    with pytest.raises(ValidationError):
        WeatherRequest(
            latitude=40.71,
            longitude=-74.01,
            start_date="01-01-2024",
            end_date="2024-01-07",
        )
