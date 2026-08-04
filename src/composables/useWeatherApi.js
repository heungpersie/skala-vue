// Open-Meteo(https://open-meteo.com)는 API 키 없이 브라우저에서 바로 호출 가능한 무료 날씨 API.
// 기존 목업 데이터가 쓰던 상태 문구('맑음' 등)를 그대로 유지하기 위해 WMO 코드를 매핑한다.
const WEATHER_CODE_STATUS = {
  0: '아주 맑음',
  1: '맑음',
  2: '맑음',
  3: '구름',
  45: '구름',
  48: '구름',
  51: '비',
  53: '비',
  55: '비',
  56: '비',
  57: '비',
  61: '비',
  63: '비',
  65: '비',
  66: '비',
  67: '비',
  71: '눈',
  73: '눈',
  75: '눈',
  77: '눈',
  80: '비',
  81: '비',
  82: '비',
  85: '눈',
  86: '눈',
  95: '천둥번개',
  96: '천둥번개',
  99: '천둥번개',
}

export function weatherCodeToStatus(code) {
  return WEATHER_CODE_STATUS[code] ?? '구름'
}

// 도시 하나의 실시간 날씨를 가져온다. 실패 시 예외를 던지고 호출부(fetchWeatherForCities)에서 처리한다.
// current_weather=true 대신 current= 파라미터를 써서 습도/체감온도/풍속까지 함께 받는다
// (상세 페이지에서 필요, 목록/지도는 temp·status만 사용).
export async function fetchCurrentWeather(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m` +
    `&wind_speed_unit=ms`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`날씨 API 응답 오류: ${res.status}`)
  const data = await res.json()
  const current = data.current
  return {
    temp: Math.round(current.temperature_2m),
    status: weatherCodeToStatus(current.weather_code),
    humidity: Math.round(current.relative_humidity_2m),
    feelsLike: Math.round(current.apparent_temperature),
    windSpeed: Math.round(current.wind_speed_10m * 10) / 10,
  }
}

// 도시 이름으로 위/경도를 검색한다 (Open-Meteo Geocoding API, 키 불필요).
// 목록에 없는 도시를 사용자가 직접 추가할 수 있게 해준다.
export async function searchCities(query) {
  const q = query.trim()
  if (!q) return []

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=ko&format=json`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`지오코딩 API 응답 오류: ${res.status}`)
  const data = await res.json()

  return (data.results ?? []).map((r) => ({
    id: `geo_${r.id}`,
    name: [r.name, r.admin1, r.country].filter(Boolean).join(', '),
    lat: r.latitude,
    lon: r.longitude,
  }))
}

// 여러 도시를 병렬로 조회해 city 객체 배열에 temp/status를 채워 넣는다.
export async function fetchWeatherForCities(cities) {
  const results = await Promise.allSettled(
    cities.map((city) => fetchCurrentWeather(city.lat, city.lon)),
  )

  return cities.map((city, index) => {
    const result = results[index]
    if (result.status === 'fulfilled') {
      return { ...city, ...result.value, error: false }
    }
    return { ...city, temp: null, status: '알 수 없음', error: true }
  })
}
