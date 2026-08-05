<script setup>
/* ── WeatherMap.vue ──
   실시간 날씨 지도 — Leaflet + OpenStreetMap (API 키 불필요).
   props로 받은 도시 목록을 지도 위 마커로 표시하고, 마커 클릭 시 select-city를 emit한다.
   Leaflet은 Vue의 반응형 시스템을 모르는 순수 DOM 기반 라이브러리이므로,
   지도 인스턴스(map)와 마커(markers)는 ref가 아닌 일반 변수로 관리하고,
   대신 watch()로 props 변화를 감지해 Leaflet API를 직접 호출(명령형)하는 방식으로 동기화한다. */
import { ref, onMounted, onUnmounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// cities: 지도에 표시할 도시 배열(WeatherParent 등 부모가 필터링/정렬한 결과를 그대로 전달)
// selectedId: 현재 선택된 도시의 id. 선택된 마커를 강조 표시하고 지도 중심을 이동시키는 데 사용
const props = defineProps({
  cities: { type: Array, required: true },
  selectedId: { type: String, default: null },
})
// 마커를 클릭하면 select-city 이벤트로 도시 id를 부모에게 전달한다.
// (부모는 이 id로 카드 목록에서 동일한 선택 로직(selectCity)을 재사용한다)
const emit = defineEmits(['select-city'])

const mapEl = ref(null) // 지도를 그릴 <div>의 DOM 참조 (template ref)
let map = null // Leaflet 지도 인스턴스 (반응형 불필요 - Vue가 추적할 필요 없는 외부 객체)
const markers = new Map() // 도시 id -> L.Marker. 매번 마커를 새로 만들지 않고 재사용하기 위한 캐시

function badgeClass(city) {
  if (city.temp === null || city.temp === undefined) return 'unknown'
  if (city.temp >= 25) return 'hot'
  if (city.temp >= 10) return 'cool'
  return 'cold'
}

function buildIcon(city, isSelected) {
  const cls = ['pin', badgeClass(city), isSelected ? 'selected' : ''].join(' ')
  const label = city.temp === null || city.temp === undefined ? '?' : `${city.temp}°`
  return L.divIcon({
    className: 'weather-pin-wrap',
    html: `<div class="${cls}"><span class="pin-label">${label}</span></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -36],
  })
}

// props.cities / props.selectedId가 바뀔 때마다 호출되어 마커를 "재조정(diff)"한다.
// 전체를 지우고 다시 그리는 대신, id 기준으로 기존 마커는 아이콘/팝업만 갱신하고
// 새로 생긴 도시만 마커를 추가, 사라진 도시만 제거하는 방식이라 깜빡임이 없다.
function renderMarkers() {
  if (!map) return

  // 1) 더 이상 목록에 없는(필터링으로 사라진) 도시의 마커는 지도에서 제거
  for (const [id, marker] of markers) {
    if (!props.cities.some((c) => c.id === id)) {
      marker.remove()
      markers.delete(id)
    }
  }

  // 2) 현재 목록의 각 도시에 대해 마커를 추가하거나(신규) 갱신한다(기존)
  props.cities.forEach((city) => {
    const isSelected = city.id === props.selectedId
    const icon = buildIcon(city, isSelected)
    const popupHtml = `<strong>${city.name}</strong><br/>${city.status ?? '조회 중...'} · ${city.temp === null || city.temp === undefined ? '-' : city.temp + '°C'}`

    let marker = markers.get(city.id)
    if (marker) {
      // 이미 존재하는 마커는 새로 만들지 않고 아이콘/팝업 내용만 교체(선택 상태·기온 변화 반영)
      marker.setIcon(icon)
      marker.setPopupContent(popupHtml)
    } else {
      // 처음 등장하는 도시는 마커를 새로 만들어 지도에 추가하고, 클릭 이벤트를 연결
      marker = L.marker([city.lat, city.lon], { icon }).addTo(map).bindPopup(popupHtml)
      marker.on('click', () => emit('select-city', city.id))
      markers.set(city.id, marker)
    }
  })
}

// onMounted: mapEl(위 template의 <div ref="mapEl">)이 실제 DOM에 붙은 뒤에만
// Leaflet이 그 DOM 요소를 기준으로 지도를 생성할 수 있으므로 반드시 마운트 이후에 초기화한다.
onMounted(() => {
  map = L.map(mapEl.value, {
    center: [36.2, 127.8], // 대한민국 중심 부근
    zoom: 6.4,
    scrollWheelZoom: false, // 페이지 스크롤 중 실수로 지도가 확대/축소되는 것을 방지
  })

  // OpenStreetMap 타일 서버 등록 (무료, API 키 불필요)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 18,
  }).addTo(map)

  renderMarkers()
})

// onUnmounted: Leaflet 지도 인스턴스는 Vue가 관리하지 않는 외부(DOM 이벤트 리스너 등) 자원이므로,
// 컴포넌트가 사라질 때 명시적으로 remove()를 호출해 메모리 누수를 막아야 한다.
onUnmounted(() => {
  map?.remove()
  map = null
})

// cities 배열 내부 값(온도 등)이 바뀌어도 감지하도록 deep watch로 마커를 다시 그린다
watch(() => props.cities, renderMarkers, { deep: true })

// 선택된 도시(selectedId)가 바뀌면: 마커 강조 표시를 갱신하고,
// 해당 도시 좌표로 지도를 부드럽게 이동(panTo)한 뒤 팝업을 자동으로 연다
watch(
  () => props.selectedId,
  (id) => {
    renderMarkers()
    const city = props.cities.find((c) => c.id === id)
    if (city && map) {
      map.panTo([city.lat, city.lon])
      markers.get(id)?.openPopup()
    }
  },
)
</script>

<template>
  <div class="weather-map" ref="mapEl"></div>
</template>

<style scoped>
.weather-map {
  width: 100%;
  height: 320px;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--color-border);
}

:deep(.weather-pin-wrap) {
  background: transparent;
  border: none;
}

/* 눈물방울(teardrop) 모양 핀: 바깥 요소를 -45deg 회전시켜 모양을 만들고,
   안쪽 라벨은 반대로 +45deg 회전시켜 텍스트가 항상 똑바로 보이게 한다 */
:deep(.pin) {
  width: 40px;
  height: 40px;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  border: 2px solid #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
  cursor: pointer;
}

:deep(.pin-label) {
  display: inline-block;
  transform: rotate(45deg);
  font-size: 12px;
  font-weight: 700;
}

:deep(.pin.hot) {
  background: #ef5b5b;
}
:deep(.pin.cool) {
  background: var(--magpie-blue);
}
:deep(.pin.cold) {
  background: var(--magpie-violet);
}
:deep(.pin.unknown) {
  background: #9aa5b1;
}

:deep(.pin.selected) {
  outline: 3px solid #ffd166;
  outline-offset: 1px;
}
</style>
