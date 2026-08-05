<script setup>
/* ── [Store 실습 / 과제5] MagpieNest.vue ──
   현재 표시 중인 도시의 날씨(city)에 따라 둥지 속 까치의 상태/애니메이션이 바뀐다.
   온도/날씨 상태 텍스트로 하나의 state를 골라 CSS 애니메이션으로 표현한다. */
import { computed } from 'vue'

const props = defineProps({
  city: { type: Object, default: null },
  size: { type: String, default: 'normal' }, // 'normal' | 'large'
  floating: { type: Boolean, default: false }, // 화면에 고정되어 스크롤을 따라 움직인다
  dustGrade: { type: String, default: null }, // '좋음' | '보통' | '나쁨' | '매우나쁨'
})

const weatherState = computed(() => {
  const city = props.city
  if (!city || city.temp === null || city.temp === undefined) return 'empty'

  const status = city.status ?? ''
  if (status.includes('눈')) return 'snow'
  if (status.includes('비') || status.includes('천둥')) return 'rain'
  if (city.temp >= 28) return 'hot'
  if (city.temp < 5) return 'cold'
  if (status.includes('구름')) return 'cloudy'
  return 'sunny'
})

const STATE_INFO = {
  empty: { emoji: '🪹', label: '둥지가 비어있어요' },
  sunny: { emoji: '🌞', label: '맑은 날씨에 신난 까치' },
  cloudy: { emoji: '☁️', label: '구름 아래 꾸벅꾸벅 조는 까치' },
  rain: { emoji: '🌧️', label: '비를 피해 웅크린 까치' },
  snow: { emoji: '❄️', label: '눈송이 맞으며 포근한 까치' },
  hot: { emoji: '🥵', label: '더위에 헥헥거리는 까치' },
  cold: { emoji: '🥶', label: '추위에 잔뜩 웅크린 까치' },
}

const stateInfo = computed(() => STATE_INFO[weatherState.value])

// 미세먼지가 나쁨/매우나쁨이면 마스크를 씌우고 뿌연 먼지 연출을 더한다
const dustBad = computed(() => props.dustGrade === '나쁨' || props.dustGrade === '매우나쁨')
const dustVeryBad = computed(() => props.dustGrade === '매우나쁨')

const DUST_INFO = {
  좋음: { emoji: '🟢', key: 'good' },
  보통: { emoji: '🟡', key: 'moderate' },
  나쁨: { emoji: '🟠', key: 'bad' },
  매우나쁨: { emoji: '🔴', key: 'very-bad' },
}
const dustInfo = computed(() => (props.dustGrade ? DUST_INFO[props.dustGrade] : null))
</script>

<template>
  <div
    class="magpie-nest"
    :class="[`size-${size}`, { floating, 'dust-bad': dustBad, 'dust-very-bad': dustVeryBad }]"
    :data-state="weatherState"
  >
    <p v-if="size === 'large'" class="nest-title">🪺 까치 둥지</p>

    <svg viewBox="0 0 160 170" class="scene" aria-hidden="true">
      <g v-if="dustBad" class="dust-haze">
        <ellipse cx="80" cy="110" rx="70" ry="60" fill="#b9a06a" opacity="0.16" />
        <circle
          v-for="n in 5"
          :key="n"
          class="dust-mote"
          :style="{ animationDelay: `${n * 0.6}s`, left: `${n * 24}px` }"
          r="2"
          fill="#b9a06a"
        />
      </g>

      <g v-if="weatherState === 'sunny'" class="sun-rays">
        <circle cx="128" cy="30" r="14" class="sun" />
        <g class="rays" stroke="#f4b942" stroke-width="3" stroke-linecap="round">
          <line x1="128" y1="4" x2="128" y2="12" />
          <line x1="128" y1="48" x2="128" y2="56" />
          <line x1="102" y1="30" x2="110" y2="30" />
          <line x1="146" y1="30" x2="154" y2="30" />
          <line x1="110" y1="12" x2="115" y2="17" />
          <line x1="146" y1="12" x2="141" y2="17" />
        </g>
      </g>

      <g v-if="weatherState === 'rain'" class="rain">
        <line
          v-for="n in 6"
          :key="n"
          class="raindrop"
          :style="{ animationDelay: `${n * 0.15}s`, left: `${n * 22}px` }"
          x1="0"
          y1="0"
          x2="-6"
          y2="16"
          stroke="#5aa9e6"
          stroke-width="3"
          stroke-linecap="round"
        />
      </g>

      <g v-if="weatherState === 'snow'" class="snow">
        <circle
          v-for="n in 7"
          :key="n"
          class="snowflake"
          :style="{ animationDelay: `${n * 0.35}s`, left: `${n * 20}px` }"
          r="2.5"
          fill="#fafafa"
        />
      </g>

      <!-- 둥지 -->
      <g class="nest">
        <ellipse cx="80" cy="148" rx="54" ry="16" fill="#8b5e3c" />
        <path
          d="M28 146 Q42 130 58 142 M52 150 Q66 132 84 144 M78 150 Q94 130 110 144 M104 148 Q118 132 132 146"
          stroke="#6b4423"
          stroke-width="4"
          fill="none"
          stroke-linecap="round"
        />
        <ellipse cx="80" cy="142" rx="46" ry="10" fill="#a9724a" />
      </g>

      <!-- 까치 -->
      <g class="magpie-body-group">
        <g class="cough-wrap">
          <!-- 꼬리: 4겹 깃털 + 깃대(rachis) -->
          <g class="tail">
            <path
              d="M96 98 L146 110 L130 122 L148 140 L118 130 L100 116 Z"
              fill="url(#tailGradBack)"
              opacity="0.85"
            />
            <path d="M100 106 L138 118" stroke="rgba(255,255,255,0.15)" stroke-width="0.8" />
            <path
              d="M97 102 L132 113 L121 122 L132 136 L109 127 L99 114 Z"
              fill="url(#tailGradMid)"
            />
            <path d="M100 109 L125 118" stroke="rgba(255,255,255,0.18)" stroke-width="0.8" />
            <path
              d="M98 106 L120 114 L113 121 L118 130 L103 123 L97 112 Z"
              fill="url(#tailGradFront)"
            />
            <path d="M100 112 L113 118" stroke="rgba(255,255,255,0.2)" stroke-width="0.8" />
            <path
              d="M99 110 L110 115 L106 120 L108 126 L98 122 L96 116 Z"
              fill="url(#tailGradInner)"
              opacity="0.9"
            />
          </g>

          <!-- 다리 -->
          <g class="legs">
            <path d="M56 140 L54 150" stroke="#3a3d45" stroke-width="3" stroke-linecap="round" />
            <path d="M76 138 L78 150" stroke="#3a3d45" stroke-width="3" stroke-linecap="round" />
            <path
              d="M49 150 L54 150 L59 149"
              stroke="#3a3d45"
              stroke-width="2"
              stroke-linecap="round"
            />
            <path d="M50 153 L54 152" stroke="#3a3d45" stroke-width="1.4" stroke-linecap="round" />
            <path
              d="M71 150 L78 150 L85 149"
              stroke="#3a3d45"
              stroke-width="2"
              stroke-linecap="round"
            />
            <path d="M72 153 L78 152" stroke="#3a3d45" stroke-width="1.4" stroke-linecap="round" />
          </g>

          <!-- 몸통 -->
          <path
            class="body"
            d="M36 96 C24 92 14 100 14 114 C14 130 26 146 48 151 C68 155 90 151 99 137 C107 124 105 106 90 98 C76 90 52 90 36 96 Z"
            fill="url(#bodySheen)"
            stroke="rgba(0,0,0,0.18)"
            stroke-width="0.6"
          />
          <path
            d="M40 98 Q60 94 82 102"
            stroke="rgba(255,255,255,0.18)"
            stroke-width="1.4"
            stroke-linecap="round"
            fill="none"
          />

          <!-- 배(흰 무늬) -->
          <path
            class="belly"
            d="M28 116 C22 128 28 144 46 149 C60 153 74 146 74 132 C74 120 62 112 48 113 C40 114 32 112 28 116 Z"
            fill="var(--magpie-white)"
          />
          <path
            d="M34 138 Q48 147 64 140"
            stroke="rgba(0,0,0,0.06)"
            stroke-width="6"
            stroke-linecap="round"
            fill="none"
          />

          <!-- 날개: 덮깃 결 + 소우깃(alula) + 청람색 스페큘럼 -->
          <g class="wing">
            <path
              d="M58 96 Q90 97 88 123 Q84 140 60 136 Q47 128 49 108 Q51 100 58 96 Z"
              fill="url(#bodySheen)"
              stroke="rgba(0,0,0,0.18)"
              stroke-width="0.6"
            />
            <path
              d="M64 106 Q79 108 77 123 Q73 132 62 128 Q55 119 58 110 Q60 106 64 106 Z"
              fill="var(--magpie-white)"
              opacity="0.92"
            />
            <path
              d="M62 128 Q72 132 82 124 Q78 136 64 136 Q60 133 62 128 Z"
              fill="url(#tailGradMid)"
              opacity="0.85"
            />
            <path
              d="M56 100 Q50 104 52 110 Q56 108 58 103 Z"
              fill="var(--magpie-black)"
              opacity="0.9"
              stroke="rgba(0,0,0,0.2)"
              stroke-width="0.4"
            />
            <path
              d="M60 100 Q82 104 84 122"
              stroke="rgba(255,255,255,0.28)"
              stroke-width="1.2"
              fill="none"
              class="wing-line"
            />
            <path
              d="M56 112 Q70 116 74 128"
              stroke="rgba(255,255,255,0.16)"
              stroke-width="1"
              fill="none"
            />
            <path
              d="M53 122 Q64 126 68 134"
              stroke="rgba(255,255,255,0.12)"
              stroke-width="0.9"
              fill="none"
            />
          </g>

          <!-- 머리 -->
          <path
            d="M22.5 79 C21 65 30.5 56 43 56.5 C55 57 61.5 67 59.5 79 C58 90 49 97 39.5 97 C29.5 97 24 89 22.5 79 Z"
            fill="url(#headSheen)"
            stroke="rgba(0,0,0,0.18)"
            stroke-width="0.6"
          />

          <!-- 부리 -->
          <path
            class="beak"
            d="M25 74.5 Q13 71 5 76 Q2.5 78 5.5 80.5 Q14 85 25 81.5 Q28 78 25 74.5 Z"
            fill="url(#beakGrad)"
          />
          <path
            d="M23 76 Q15 77 9 78"
            stroke="#a9711a"
            stroke-width="0.8"
            opacity="0.55"
            fill="none"
          />
          <circle cx="20" cy="76.4" r="0.7" fill="#8a5c14" opacity="0.6" />

          <!-- 눈 -->
          <path d="M31 71 Q36 68 41 71" stroke="rgba(0,0,0,0.15)" stroke-width="1.2" fill="none" />
          <circle cx="36" cy="76" r="3.6" fill="var(--magpie-white)" />
          <circle cx="36" cy="76" r="3.8" fill="none" stroke="rgba(0,0,0,0.25)" stroke-width="0.6" />
          <circle cx="35.3" cy="76.6" r="1.7" fill="#1b1c1f" />
          <circle cx="37.3" cy="74.6" r="0.7" fill="#ffffff" opacity="0.9" />

          <g class="sweat" v-if="weatherState === 'hot'">
            <path d="M50 58 q4 6 0 10 a5 5 0 1 1 0 -10 Z" fill="#5aa9e6" />
          </g>
          <g v-if="dustBad" class="mask">
            <path
              d="M6 74 Q34 64 42 82 Q34 100 6 92 Q0 82 6 74 Z"
              fill="#eef3f6"
              stroke="#aebac2"
              stroke-width="1.5"
            />
            <path
              d="M9 79 Q22 76 34 80 M9 88 Q22 91 34 87"
              stroke="#aebac2"
              stroke-width="1"
              fill="none"
            />
            <line x1="34" y1="76" x2="48" y2="70" stroke="#c7d0d6" stroke-width="1.5" />
            <line x1="34" y1="90" x2="48" y2="96" stroke="#c7d0d6" stroke-width="1.5" />
          </g>
        </g>
      </g>

      <g v-if="weatherState === 'cloudy'" class="zzz">
        <text x="46" y="52" class="z z1">Z</text>
        <text x="56" y="40" class="z z2">Z</text>
        <text x="66" y="28" class="z z3">Z</text>
      </g>

      <defs>
        <radialGradient id="bodySheen" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stop-color="#464a54" />
          <stop offset="55%" stop-color="var(--magpie-black)" />
          <stop offset="100%" stop-color="var(--magpie-black)" />
        </radialGradient>
        <radialGradient id="headSheen" cx="40%" cy="25%" r="70%">
          <stop offset="0%" stop-color="#4a4d57" />
          <stop offset="55%" stop-color="var(--magpie-black)" />
          <stop offset="100%" stop-color="#0f1013" />
        </radialGradient>
        <linearGradient id="tailGradBack" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="var(--magpie-violet)" />
          <stop offset="100%" stop-color="var(--magpie-blue)" />
        </linearGradient>
        <linearGradient id="tailGradMid" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="var(--magpie-blue)" />
          <stop offset="100%" stop-color="var(--magpie-teal)" />
        </linearGradient>
        <linearGradient id="tailGradFront" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="var(--magpie-teal)" />
          <stop offset="100%" stop-color="var(--magpie-blue)" />
        </linearGradient>
        <linearGradient id="tailGradInner" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="var(--magpie-teal)" />
          <stop offset="100%" stop-color="var(--magpie-violet)" />
        </linearGradient>
        <linearGradient id="beakGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffcf6b" />
          <stop offset="100%" stop-color="#d98f1f" />
        </linearGradient>
      </defs>
    </svg>

    <p class="nest-label">{{ stateInfo.emoji }} {{ stateInfo.label }}</p>
    <p v-if="dustInfo" class="dust-label" :class="`dust-${dustInfo.key}`">
      {{ dustInfo.emoji }} 미세먼지 {{ dustGrade }}
    </p>
    <p v-if="city" class="nest-city">{{ city.name }} 날씨 기준</p>
  </div>
</template>

<style scoped>
.magpie-nest {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 8px 4px 0;
  box-sizing: border-box;
}
.scene {
  width: 100%;
  max-width: 150px;
  height: auto;
  overflow: visible;
}
.nest-label {
  margin: 4px 0 0;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-heading);
  text-align: center;
  line-height: 1.4;
}
.dust-label {
  margin: 4px 0 0;
  font-size: 11px;
  font-weight: 700;
  text-align: center;
}
.dust-label.dust-good {
  color: #2f8f52;
}
.dust-label.dust-moderate {
  color: #b8860b;
}
.dust-label.dust-bad {
  color: #d2691e;
}
.dust-label.dust-very-bad {
  color: #c0392b;
}
.nest-city {
  margin: 2px 0 0;
  font-size: 11px;
  color: var(--color-text);
  opacity: 0.65;
  text-align: center;
}

/* size="large": 독립된 카드 패널처럼 보이도록 자체 배경/테두리/제목을 갖춘다 */
.magpie-nest.size-large {
  position: relative;
  overflow: hidden;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 22px 16px 26px;
}
.magpie-nest.size-large::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--magpie-gradient);
}
.nest-title {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-heading);
}
.magpie-nest.size-large .scene {
  max-width: 240px;
}
.magpie-nest.size-large .nest-label {
  margin-top: 12px;
  font-size: 15px;
}
.magpie-nest.size-large .dust-label {
  font-size: 13px;
}
.magpie-nest.size-large .nest-city {
  font-size: 13px;
  margin-top: 4px;
}

/* floating: 화면(뷰포트)에 고정되어 스크롤해도 항상 같은 위치에 보인다 */
.magpie-nest.floating {
  position: fixed;
  top: 210px;
  right: 32px;
  width: 260px;
  z-index: 20;
}
@media (max-width: 1000px) {
  .magpie-nest.floating {
    position: static;
    width: 100%;
    max-width: 320px;
    margin: 0 auto;
  }
}

/* 기본 상태: 아주 살짝 숨쉬는 정도로만 움직인다 */
.magpie-body-group {
  transform-origin: 58px 122px;
  animation: breathe 2.6s ease-in-out infinite;
}
@keyframes breathe {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.015);
  }
}

/* 맑음: 신나서 콩콩 뛴다 */
[data-state='sunny'] .magpie-body-group {
  animation: bounce 1.1s ease-in-out infinite;
}
@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}
.sun {
  fill: #f4b942;
  animation: sun-glow 1.8s ease-in-out infinite;
}
@keyframes sun-glow {
  0%,
  100% {
    opacity: 0.85;
  }
  50% {
    opacity: 1;
  }
}

/* 구름: 천천히 좌우로 졸며 흔들 */
[data-state='cloudy'] .magpie-body-group {
  animation: sway 3.2s ease-in-out infinite;
}
@keyframes sway {
  0%,
  100% {
    transform: rotate(-2deg);
  }
  50% {
    transform: rotate(2deg);
  }
}
.z {
  font-size: 12px;
  font-weight: 700;
  fill: var(--color-text);
  opacity: 0;
}
.z1 {
  animation: float-z 2.4s ease-in infinite;
}
.z2 {
  animation: float-z 2.4s ease-in infinite 0.5s;
}
.z3 {
  animation: float-z 2.4s ease-in infinite 1s;
}
@keyframes float-z {
  0% {
    opacity: 0;
    transform: translateY(0);
  }
  20% {
    opacity: 0.8;
  }
  100% {
    opacity: 0;
    transform: translateY(-14px);
  }
}

/* 더움: 날개를 파닥이며 헥헥 */
[data-state='hot'] .wing {
  transform-origin: 68px 104px;
  animation: flap 0.35s ease-in-out infinite alternate;
}
@keyframes flap {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(-18deg);
  }
}
.sweat {
  animation: drip 1s ease-in infinite;
}
@keyframes drip {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  90% {
    opacity: 0.2;
    transform: translateY(10px);
  }
  100% {
    opacity: 0;
    transform: translateY(12px);
  }
}

/* 추움: 잘게 떨림 */
[data-state='cold'] .magpie-body-group {
  animation: shiver 0.22s ease-in-out infinite;
}
@keyframes shiver {
  0%,
  100% {
    transform: translateX(0) rotate(0deg);
  }
  25% {
    transform: translateX(-1.5px) rotate(-1.5deg);
  }
  75% {
    transform: translateX(1.5px) rotate(1.5deg);
  }
}

/* 비: 살짝 고개를 숙이고 정적으로, 빗방울만 떨어짐 */
[data-state='rain'] .magpie-body-group {
  animation: none;
  transform: rotate(4deg);
}
.raindrop {
  position: relative;
  animation: fall 0.9s linear infinite;
}
@keyframes fall {
  0% {
    transform: translateY(-10px);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  100% {
    transform: translateY(30px);
    opacity: 0;
  }
}

/* 눈: 포근하게 웅크리고, 눈송이만 천천히 낙하 */
[data-state='snow'] .magpie-body-group {
  animation: sway 4s ease-in-out infinite;
}
.snowflake {
  animation: snowfall 3s linear infinite;
}
@keyframes snowfall {
  0% {
    transform: translate(0, -10px);
    opacity: 0;
  }
  15% {
    opacity: 1;
  }
  100% {
    transform: translate(6px, 60px);
    opacity: 0;
  }
}

/* 비어있음: 흐리게, 움직임 없음 */
[data-state='empty'] .magpie-body-group,
[data-state='empty'] .nest {
  opacity: 0.4;
  animation: none;
}

/* 미세먼지 나쁨/매우나쁨: 뿌연 헤이즈 + 떠다니는 먼지 입자 */
.dust-mote {
  animation: dust-drift 4s ease-in-out infinite;
}
@keyframes dust-drift {
  0% {
    transform: translate(0, 0);
    opacity: 0;
  }
  20% {
    opacity: 0.7;
  }
  50% {
    transform: translate(-10px, -14px);
  }
  100% {
    transform: translate(6px, -30px);
    opacity: 0;
  }
}
.dust-haze ellipse {
  animation: haze-pulse 3.5s ease-in-out infinite;
}
@keyframes haze-pulse {
  0%,
  100% {
    opacity: 0.12;
  }
  50% {
    opacity: 0.22;
  }
}

/* 미세먼지 매우나쁨: 이따금 콜록거리며 앞으로 들썩인다 (날씨 애니메이션과 별개 레이어) */
.dust-very-bad .cough-wrap {
  animation: cough 2.2s ease-in-out infinite;
}
@keyframes cough {
  0%,
  80%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  85% {
    transform: translateY(3px) rotate(3deg);
  }
  90% {
    transform: translateY(0) rotate(-2deg);
  }
  95% {
    transform: translateY(2px) rotate(2deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .magpie-body-group,
  .wing,
  .sweat,
  .raindrop,
  .snowflake,
  .z,
  .sun,
  .dust-mote,
  .dust-haze ellipse,
  .cough-wrap {
    animation: none !important;
  }
}
</style>
