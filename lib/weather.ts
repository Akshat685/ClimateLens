export type WeatherPoint = {
  date: string;
  temperature_max: number;
  temperature_min: number;
  apparent_temperature_max: number;
  apparent_temperature_min: number;
};

export type WeatherPayload = {
  latitude: number;
  longitude: number;
  start_date: string;
  end_date: string;
  daily: WeatherPoint[];
};

type OpenMeteoDaily = {
  time?: string[];
  temperature_2m_max?: number[];
  temperature_2m_min?: number[];
  apparent_temperature_max?: number[];
  apparent_temperature_min?: number[];
};

type OpenMeteoStoredFile = {
  latitude?: number;
  longitude?: number;
  daily?: OpenMeteoDaily;
};

export function parseStoredWeather(raw: unknown): WeatherPayload {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Stored file does not contain valid weather data.');
  }

  const data = raw as OpenMeteoStoredFile;
  const daily = data.daily;

  if (!daily) {
    throw new Error('Stored file is missing daily weather data.');
  }

  const times = daily.time;
  const maxTemps = daily.temperature_2m_max;
  const minTemps = daily.temperature_2m_min;
  const apparentMaxTemps = daily.apparent_temperature_max;
  const apparentMinTemps = daily.apparent_temperature_min;

  if (
    !times?.length ||
    !maxTemps?.length ||
    !minTemps?.length ||
    !apparentMaxTemps?.length ||
    !apparentMinTemps?.length
  ) {
    throw new Error('Stored file is missing required daily temperature fields.');
  }

  if (data.latitude === undefined || data.longitude === undefined) {
    throw new Error('Stored file is missing location coordinates.');
  }

  return {
    latitude: data.latitude,
    longitude: data.longitude,
    start_date: times[0],
    end_date: times[times.length - 1],
    daily: times.map((date, index) => ({
      date,
      temperature_max: maxTemps[index],
      temperature_min: minTemps[index],
      apparent_temperature_max: apparentMaxTemps[index],
      apparent_temperature_min: apparentMinTemps[index],
    })),
  };
}
