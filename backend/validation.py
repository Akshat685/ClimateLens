from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, Field, validator


class WeatherRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    start_date: str
    end_date: str

    @validator("start_date", "end_date")
    def validate_date_format(cls, value: str) -> str:
        try:
            datetime.strptime(value, "%Y-%m-%d")
        except ValueError as error:
            raise ValueError("Dates must use YYYY-MM-DD format.") from error
        return value

    @validator("end_date")
    def validate_date_range(cls, value: str, values: dict[str, Any]) -> str:
        start_value = values.get("start_date")
        if not start_value:
            return value
        start = date.fromisoformat(start_value)
        end = date.fromisoformat(value)
        today = date.today()
        if end > today:
            raise ValueError(f"End date cannot be after today ({today.isoformat()}).")
        if start > today:
            raise ValueError(f"Start date cannot be after today ({today.isoformat()}).")
        if end < start:
            raise ValueError("End date must be on or after start date.")
        if (end - start).days + 1 > 31:
            raise ValueError("Date range cannot exceed 31 days.")
        return value
