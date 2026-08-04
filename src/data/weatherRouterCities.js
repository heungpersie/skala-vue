// [Router 실습 / 과제4] 전용 기본 도시 목록.
// work/ 과제 1~3이 쓰는 weatherCities.js와는 별개로 관리한다
// (여기 목록은 사용자가 전부 삭제할 수 있어야 하므로 독립된 목록이 필요).
export const WEATHER_ROUTER_DEFAULT_CITIES = [
  { id: 'city_seoul', name: '서울', lat: 37.5665, lon: 126.978 },
  { id: 'city_pyeongtaek', name: '평택', lat: 36.9921, lon: 127.1129 },
  { id: 'city_seongnam', name: '성남', lat: 37.4201, lon: 127.1265 },
  { id: 'city_milano', name: '밀라노', lat: 45.4642, lon: 9.19 },
]
