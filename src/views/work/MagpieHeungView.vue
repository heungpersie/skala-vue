<script setup>
/* ── MagpieHeungView.vue: "은혜 갚는 까치" 미니 스토리/게임 ──
   흥부전 모티브의 인터랙티브 화면. 사용자가 붕대(색깔)를 선택해 다친 까치를 치료하면,
   까치는 단계(phase)를 거쳐 날아갔다가 돌아와 선택한 색에 대응하는 시사 기사를 물어다 준다.
   상태는 두 개의 ref로만 구성된다.
     - selectedBandage: 사용자가 고른 붕대 색('yellow'|'blue'|'red'|'black'|null)
     - phase: 이야기의 진행 단계('injured' → 'healing' → 'flying' → 'returned')
   phase는 heal() 안의 setTimeout으로 시간차를 두고 자동 전환되며(간단한 타이머 기반
   상태 머신), computed는 selectedBandage로부터 "보여줄 기사"와 "붕대 색상값"을 파생시킨다. */
import { ref, computed } from 'vue'

// 현재 선택된 붕대 색. null이면 아직 아무것도 선택하지 않은 초기 상태
const selectedBandage = ref(null)
// 스토리 진행 단계(4단계 상태 머신). 템플릿의 v-if들이 이 값에 따라
// 까치 다리 모양(다침/치료됨), 대사(speech), 기사 카드 노출 여부를 결정한다.
// injured(다침, 초기) → healing(치료 중) → flying(날아감) → returned(돌아와서 기사 전달)
const phase = ref('injured') // injured → healing → flying → returned

// 붕대 색깔별로 보여줄 시사 기사 데이터(카테고리/제목/요약/단어장).
// selectedBandage 값과 이 객체의 key를 그대로 매칭해서 currentArticle을 계산한다.
const articles = {
  yellow: {
    category: '경제 / 금융',
    emoji: '🟡',
    title: 'AI revenues are growing fast, but not fast enough',

    summary:
      '미국의 주요 기술 기업들은 인공지능 시대의 주도권을 확보하기 위해 데이터센터, 반도체, 전력 인프라 등에 역사적인 규모의 자본을 투입하고 있다. Amazon, Google, Microsoft와 같은 기업들은 향후 AI 수요 증가를 예상하며 수천억 달러 규모의 투자를 진행하고 있지만, 시장에서는 이러한 지출이 실제 수익으로 연결될 수 있을지에 대한 의문이 커지고 있다. 현재 AI 관련 매출은 빠르게 증가하고 있지만, 기업들이 투자한 막대한 비용을 회수하기에는 아직 부족한 수준이다. 특히 많은 기업들이 AI를 실험적으로 사용하고 있을 뿐, 조직 구조와 업무 방식을 근본적으로 변화시키는 단계까지 도달하지 못했다. 전문가들은 AI가 장기적으로 생산성을 크게 향상시키기 위해서는 단순히 챗봇을 도입하는 것을 넘어 데이터 관리, 인력 재편, 기업 프로세스 개선과 같은 무형 자본 투자가 병행되어야 한다고 지적한다. 결국 AI 투자 열풍의 성공 여부는 기술 발전 자체보다 기업들이 AI를 활용해 지속 가능한 경제적 가치를 창출할 수 있는지에 달려 있다.',

    words: [
      {
        word: 'capital-allocation',
        meaning: '자본 배분',
      },
      {
        word: 'expenditure',
        meaning: '지출, 비용',
      },
      {
        word: 'dilettante',
        meaning: '아마추어적 관심만 가진 사람',
      },
      {
        word: 'intangible capital',
        meaning: '무형 자본',
      },
    ],
  },
  blue: {
    category: '환경 / 사회',
    emoji: '🔵',
    title: 'Europe’s fires are just the start',

    summary:
      '유럽에서 발생한 대규모 산불은 단순한 계절적 재난이 아니라 기후 변화가 만들어낸 새로운 위험 환경을 보여주는 사례로 평가된다. 프랑스와 스페인 등에서는 기록적인 규모의 화재가 발생했으며, 지속적인 폭염과 건조한 환경으로 인해 앞으로 더 심각한 산불이 발생할 가능성이 커지고 있다. 기후 변화는 전 세계 산불 발생 지역의 상당 부분에서 위험도를 높이고 있으며, 특히 화재 자체뿐 아니라 연기 오염으로 인한 장기적인 건강 피해도 심각한 문제로 떠오르고 있다. 전문가들은 산불 대응이 단순한 진화 능력 확대에 머물러서는 안 되며, 위성 감시, 드론 기술, 산림 관리, 대중 교육 등 예방 중심의 전략이 필요하다고 지적한다. 또한 화재 위험이 증가하는 시대에는 국제적인 협력과 자원 공유 체계가 더욱 중요해지고 있다. 현재 발생하는 산불은 새로운 정상 상태가 아니라 앞으로 나타날 수 있는 더 극단적인 기후 위험의 신호일 수 있다.',

    words: [
      {
        word: 'desiccated',
        meaning: '극도로 건조해진',
      },
      {
        word: 'perilously',
        meaning: '위험할 정도로',
      },
      {
        word: 'anthropogenic',
        meaning: '인간 활동에 의해 발생한',
      },
      {
        word: 'destitution',
        meaning: '빈곤, 궁핍',
      },
    ],
  },
  red: {
    category: '과학 / 기술',
    emoji: '🔴',
    title: 'It is past time to upgrade to post-quantum encryption',

    summary:
      '양자 컴퓨팅 기술이 빠르게 발전하면서 기존 암호화 체계의 안정성에 대한 우려가 커지고 있다. 현재 인터넷 금융 거래와 디지털 통신을 보호하는 암호 방식은 일반적인 컴퓨터로는 해독하기 어렵지만, 충분히 강력한 양자 컴퓨터가 등장하면 단기간에 무력화될 가능성이 있다. 특히 현재 전송되고 있는 암호화 데이터가 미래의 양자 컴퓨터 발전 이후 해독될 수 있다는 점에서 선제적인 대응이 요구되고 있다. 이를 해결하기 위한 방법으로 양자 내성 암호(Post-Quantum Cryptography)가 개발되고 있으며, 일부 브라우저와 대형 기술 기업들은 이미 이를 도입하기 시작했다. 그러나 많은 기업과 기관은 오래된 장비와 업데이트가 어려운 시스템 때문에 전환에 어려움을 겪고 있다. 전문가들은 완벽한 보안을 보장할 수는 없더라도 지금부터 새로운 암호 체계로 이동하고 지속적인 검증을 진행하는 것이 미래의 사이버 위협에 대비하는 가장 현실적인 방법이라고 강조한다.',

    words: [
      {
        word: 'imminent',
        meaning: '임박한',
      },
      {
        word: 'exploitable',
        meaning: '악용 가능한',
      },
      {
        word: 'cryptography',
        meaning: '암호학',
      },
      {
        word: 'vulnerability',
        meaning: '취약점',
      },
    ],
  },
  black: {
    category: '정치',
    emoji: '⚫',
    title: 'Donald Trump is warming to Volodymyr Zelensky',

    summary:
      '한때 심각하게 악화되었던 미국과 우크라이나 지도자 간의 관계가 최근 변화하고 있다. 도널드 트럼프 대통령은 과거 볼로디미르 젤렌스키 대통령을 강하게 비판했지만, 우크라이나의 군사적 역량과 독자적인 방위 기술 발전을 평가하면서 태도를 바꾸기 시작했다. 특히 우크라이나가 개발한 장거리 드론 능력과 자체 무기 생산 능력은 미국 내 일부 정치권에서 우크라이나 지원의 전략적 가치를 재평가하게 만드는 요인이 되었다. 동시에 트럼프 행정부는 러시아에 대한 불만을 키우며 제재 강화 가능성을 검토하고 있다. 그러나 우크라이나 지원 문제는 미국 의회 내부의 정치적 갈등과 평화 협상의 불확실성이라는 복잡한 장애물을 남겨두고 있다. 젤렌스키는 제한된 외교적 선택지 속에서도 미국과의 관계를 다시 강화하며 국제 무대에서 전략적 영향력을 확보하려 노력하고 있다.',

    words: [
      {
        word: 'prowess',
        meaning: '뛰어난 능력, 역량',
      },
      {
        word: 'appropriation',
        meaning: '예산 책정, 자금 할당',
      },
      {
        word: 'moribund',
        meaning: '쇠퇴한, 활력을 잃은',
      },
      {
        word: 'mercurial',
        meaning: '변덕스러운, 예측하기 어려운',
      },
    ],
  },
}

// 선택된 붕대 색에 해당하는 기사를 반환한다. 아직 아무것도 선택하지 않았으면 null
// (computed이므로 selectedBandage가 바뀔 때만 재계산되고, 그 외엔 캐시된 값을 반환)
const currentArticle = computed(() =>
  selectedBandage.value ? articles[selectedBandage.value] : null,
)

// 선택된 붕대 색 이름을 실제 CSS 색상값(hex)으로 변환한다.
// 템플릿에서 붕대 SVG/UI를 :style로 물들이는 데 사용된다.
const bandageColor = computed(() => {
  switch (selectedBandage.value) {
    case 'yellow':
      return '#f7d64a'
    case 'blue':
      return '#4b8cff'
    case 'red':
      return '#ff5d5d'
    case 'black':
      return '#333333'
    default:
      return '#d9d9d9' // 아직 선택 전(기본 회색)
  }
})

// 사용자가 붕대 버튼을 클릭했을 때 호출되는 "스토리 진행" 함수.
// setTimeout 두 개로 시간차를 두어 phase를 순차적으로 전환하는 간단한 타이머 기반
// 상태 머신이다: 즉시 healing → 1.2초 후 flying(날아감) → 3.2초 후 returned(기사 도착).
// 각 단계 전환에 맞춰 템플릿의 CSS 애니메이션(까치 이동/날개짓 등)이 함께 재생된다.
function heal(color) {
  selectedBandage.value = color
  phase.value = 'healing'

  setTimeout(() => {
    phase.value = 'flying'
  }, 1200)

  setTimeout(() => {
    phase.value = 'returned'
  }, 3200)
}

// "다시 치료하기" 버튼: 선택/진행 상태를 모두 초기값으로 되돌려 스토리를 처음부터 다시 시작한다
function resetStory() {
  selectedBandage.value = null
  phase.value = 'injured'
}
</script>

<template>
  <div class="board" :data-theme="selectedBandage || 'default'">
    <h1 class="page-title">은혜 갚는 까치</h1>

    <div class="paper">
      <div class="hero">
        <div class="hero-text">
          <span class="badge">🐦‍⬛ Economist Magpie</span>
          <p>
            흥부를 도왔던 까치는 오늘도 누군가의 도움을 기다립니다. 다친 까치를 정성껏 치료해주면,
            까치는 고마움의 표시로 오늘의 주요 해외 소식을 물어다 줍니다. 붕대 색깔마다 정치,
            경제, 환경, 과학 등 서로 다른 카테고리의 기사가 준비되어 있으니, 궁금한 소식을 골라
            까치를 치료해보세요. 기사와 함께 정리된 핵심 단어로 시사 영어 공부도 자연스럽게 할 수
            있습니다.
          </p>
        </div>

        <div class="scene-wrap">
          <div class="scene">
            <div class="nest">🪹</div>

            <svg
              viewBox="0 0 360 96"
              class="blossom-branch"
              preserveAspectRatio="xMidYMin meet"
              aria-hidden="true"
            >
              <defs>
                <radialGradient id="blossomGlow" cx="50%" cy="15%" r="80%">
                  <stop offset="0%" stop-color="#ffd6e8" stop-opacity="0.5" />
                  <stop offset="100%" stop-color="#ffd6e8" stop-opacity="0" />
                </radialGradient>
                <radialGradient id="petalGradLight" cx="35%" cy="30%" r="70%">
                  <stop offset="0%" stop-color="#fff3f7" />
                  <stop offset="100%" stop-color="#f6b9d2" />
                </radialGradient>
                <radialGradient id="petalGradDeep" cx="35%" cy="30%" r="70%">
                  <stop offset="0%" stop-color="#f9c9dd" />
                  <stop offset="100%" stop-color="#e97ba5" />
                </radialGradient>
                <symbol id="sakura" viewBox="-9 -9 18 18">
                  <ellipse cx="0" cy="-4.6" rx="2.8" ry="4.4" transform="rotate(0)" />
                  <ellipse cx="0" cy="-4.6" rx="2.8" ry="4.4" transform="rotate(72)" />
                  <ellipse cx="0" cy="-4.6" rx="2.8" ry="4.4" transform="rotate(144)" />
                  <ellipse cx="0" cy="-4.6" rx="2.8" ry="4.4" transform="rotate(216)" />
                  <ellipse cx="0" cy="-4.6" rx="2.8" ry="4.4" transform="rotate(288)" />
                  <circle cx="0" cy="0" r="1.7" fill="#f9c04d" />
                </symbol>
              </defs>

              <ellipse cx="150" cy="6" rx="200" ry="42" fill="url(#blossomGlow)" />

              <!-- 가지 -->
              <path
                d="M-10 4 Q60 0 96 14 Q130 26 170 18 Q220 8 260 20 Q300 30 344 12"
                stroke="#7a4a2c"
                stroke-width="5"
                fill="none"
                stroke-linecap="round"
              />
              <path d="M96 14 Q92 26 82 34" stroke="#7a4a2c" stroke-width="3" fill="none" stroke-linecap="round" />
              <path d="M170 18 Q176 30 166 38" stroke="#7a4a2c" stroke-width="3" fill="none" stroke-linecap="round" />
              <path d="M260 20 Q268 32 254 40" stroke="#7a4a2c" stroke-width="3" fill="none" stroke-linecap="round" />

              <!-- 잎 -->
              <path d="M108 18 Q118 12 126 20 Q118 24 108 18 Z" fill="#8fae67" opacity="0.85" />
              <path d="M220 14 Q230 8 238 16 Q230 20 220 14 Z" fill="#8fae67" opacity="0.85" />
              <path d="M60 4 Q68 -1 75 6 Q68 9 60 4 Z" fill="#8fae67" opacity="0.75" />

              <!-- 벚꽃 송이 (밝은 톤) -->
              <g fill="url(#petalGradLight)">
                <use href="#sakura" transform="translate(20,8) rotate(-10) scale(0.95)" />
                <use href="#sakura" transform="translate(58,5) rotate(12) scale(0.75)" />
                <use href="#sakura" transform="translate(90,20) rotate(-6) scale(1.05)" />
                <use href="#sakura" transform="translate(150,14) rotate(8) scale(0.85)" />
                <use href="#sakura" transform="translate(196,7) rotate(-14) scale(0.9)" />
                <use href="#sakura" transform="translate(248,20) rotate(10) scale(1)" />
                <use href="#sakura" transform="translate(300,12) rotate(-8) scale(0.8)" />
                <use href="#sakura" transform="translate(336,24) rotate(6) scale(0.9)" />
              </g>

              <!-- 벚꽃 송이 (진한 톤, 깊이감) -->
              <g fill="url(#petalGradDeep)">
                <use href="#sakura" transform="translate(40,14) rotate(20) scale(0.65)" />
                <use href="#sakura" transform="translate(112,9) rotate(-18) scale(0.6)" />
                <use href="#sakura" transform="translate(172,28) rotate(14) scale(0.68)" />
                <use href="#sakura" transform="translate(222,5) rotate(-10) scale(0.58)" />
                <use href="#sakura" transform="translate(278,30) rotate(16) scale(0.65)" />
              </g>

              <!-- 흩날리는 꽃잎 -->
              <g class="falling-petals" fill="#f6b9d2">
                <ellipse class="petal p1" cx="70" cy="22" rx="2.6" ry="4.2" />
                <ellipse class="petal p2" cx="180" cy="14" rx="2.4" ry="3.8" />
                <ellipse class="petal p3" cx="260" cy="24" rx="2.8" ry="4.4" />
                <ellipse class="petal p4" cx="320" cy="18" rx="2.3" ry="3.6" />
              </g>
            </svg>

            <div class="magpie" :class="phase">
              <div class="bird">
                <svg viewBox="0 0 160 170" class="magpie-svg">
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

                      <path
                        v-if="phase === 'injured'"
                        d="M56 138 L50 144 L54 150 M76 136 L82 142 L78 150"
                        stroke="#1b1c1f"
                        stroke-width="3"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        fill="none"
                        class="leg-broken"
                      />

                      <g v-else class="leg-healed">
                        <path
                          d="M56 138 L54 150"
                          stroke="#1b1c1f"
                          stroke-width="3"
                          stroke-linecap="round"
                        />
                        <path
                          d="M76 136 L78 150"
                          stroke="#1b1c1f"
                          stroke-width="3"
                          stroke-linecap="round"
                        />
                        <path
                          d="M49 150 L54 150 L59 149"
                          stroke="#1b1c1f"
                          stroke-width="2"
                          stroke-linecap="round"
                        />
                        <path d="M50 153 L54 152" stroke="#1b1c1f" stroke-width="1.4" stroke-linecap="round" />
                        <path
                          d="M71 150 L78 150 L85 149"
                          stroke="#1b1c1f"
                          stroke-width="2"
                          stroke-linecap="round"
                        />
                        <path d="M72 153 L78 152" stroke="#1b1c1f" stroke-width="1.4" stroke-linecap="round" />
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

                      <!-- 붕대 선택 후(selectedBandage 존재)에만 표시. bandageColor computed 값을
                           CSS 커스텀 프로퍼티(--bandage-color)로 전달해 붕대 색을 동적으로 칠한다 -->
                      <g
                        v-if="selectedBandage"
                        class="bandage-wrap"
                        :style="{ '--bandage-color': bandageColor }"
                      >
                        <path
                          d="M50 140 Q56 138 62 140 L62 150 Q56 152 50 150 Z"
                          fill="var(--bandage-color)"
                          opacity="0.92"
                        />
                        <path
                          d="M52 143 Q56 144 60 143 M52 146 Q56 147 60 146 M52 149 Q56 150 60 149"
                          stroke="rgba(255,255,255,0.4)"
                          stroke-width="1.3"
                          stroke-linecap="round"
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
                    </g>
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

                <!-- 까치가 돌아온 단계에서만 신문 아이콘 노출 -->
                <span v-if="phase === 'returned'" class="newspaper">📰</span>
              </div>
            </div>
          </div>

          <!-- phase 값에 따라 서로 다른 말풍선을 노출(동시에 하나만 true가 되므로 배타적으로 표시됨).
               <Transition>로 감싸 말풍선이 나타나고 사라질 때 CSS 트랜지션 애니메이션이 붙는다 -->
          <Transition name="bubble">
            <div v-if="phase === 'injured'" class="speech">도와주세요…</div>
          </Transition>

          <Transition name="bubble">
            <div v-if="phase === 'healing'" class="speech success">
              고마워요! 다시 날 수 있을 것 같아요.
            </div>
          </Transition>

          <Transition name="bubble">
            <div v-if="phase === 'returned'" class="speech returned">
              {{ currentArticle?.emoji }} {{ currentArticle?.category }} 소식을 가져왔어요!
            </div>
          </Transition>
        </div>
      </div>

      <!-- 아직 치료 전(injured)일 때만 붕대 선택 버튼을 보여준다.
           각 버튼 클릭이 heal(color)를 호출해 phase를 healing으로 바꾸는 트리거가 된다 -->
      <div v-if="phase === 'injured'" class="selector">
        <h2>어떤 붕대로 치료할까요?</h2>

        <div class="bandage-grid">
          <el-button class="bandage-btn yellow" @click="heal('yellow')">
            <span class="emoji">🟡</span>
            <strong>노랑 붕대</strong>
          </el-button>

          <el-button class="bandage-btn blue" @click="heal('blue')">
            <span class="emoji">🔵</span>
            <strong>파랑 붕대</strong>
          </el-button>

          <el-button class="bandage-btn red" @click="heal('red')">
            <span class="emoji">🔴</span>
            <strong>빨강 붕대</strong>
          </el-button>

          <el-button class="bandage-btn black" @click="heal('black')">
            <span class="emoji">⚫</span>
            <strong>검정 붕대</strong>
          </el-button>
        </div>
      </div>

      <!-- 까치가 돌아왔고(phase === 'returned') 기사 데이터도 준비됐을 때만 기사 카드 표시 -->
      <Transition name="card">
        <el-card v-if="phase === 'returned' && currentArticle" class="article-card" shadow="hover">
          <div class="article-header">
            <div>
              <span class="source">📰 The Economist</span>
              <h2>{{ currentArticle.title }}</h2>
            </div>

            <el-tag class="chip" effect="light" round>
              {{ currentArticle.emoji }} {{ currentArticle.category }}
            </el-tag>
          </div>

          <div class="section">
            <h3>요약</h3>
            <p>{{ currentArticle.summary }}</p>
          </div>

          <div class="section">
            <h3>Vocabulary</h3>

            <!-- currentArticle.words 배열을 순회하며 단어/뜻 목록을 렌더링 (배열 렌더링, v-for + :key) -->
            <el-descriptions :column="2" border>
              <el-descriptions-item v-for="item in currentArticle.words" :key="item.word" :label="item.word">
                {{ item.meaning }}
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <div class="actions">
            <!-- resetStory() 호출 -> 상태 초기화 -> phase가 'injured'로 돌아가 처음 화면부터 다시 시작 -->
            <el-button class="reset" type="primary" @click="resetStory">🔁 다시 치료하기</el-button>
          </div>
        </el-card>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.board {
  min-height: 100vh;
  padding: 32px 16px 56px;
  background: var(--color-background);
  color: var(--color-text);
  transition: background 0.4s ease;
}

.board[data-theme='yellow'] {
  background:
    radial-gradient(circle at top, rgba(244, 185, 66, 0.12), transparent 45%),
    var(--color-background);
}

.board[data-theme='blue'] {
  background:
    radial-gradient(circle at top, rgba(46, 134, 222, 0.14), transparent 45%),
    var(--color-background);
}

.board[data-theme='red'] {
  background:
    radial-gradient(circle at top, rgba(239, 91, 91, 0.14), transparent 45%),
    var(--color-background);
}

.board[data-theme='black'] {
  background:
    radial-gradient(circle at top, rgba(124, 92, 255, 0.14), transparent 45%),
    var(--color-background);
}

.paper {
  position: relative;
  max-width: 1040px;
  margin: 0 auto;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.paper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--magpie-gradient);
}

.hero {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 24px;
  padding: 36px;
}

.page-title {
  width: 100%;
  margin: 0 0 28px;
  text-align: center;
  font-size: clamp(1.7rem, 3vw, 2.6rem);
  font-weight: 700;
  letter-spacing: 0.01em;
  color: var(--color-heading);
  box-sizing: border-box;
}

.hero-text p {
  color: var(--color-text);
  opacity: 0.85;
  line-height: 1.8;
  max-width: 560px;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 999px;
  background: var(--magpie-accent-soft);
  color: var(--magpie-accent);
  font-size: 0.84rem;
  font-weight: 700;
}

.scene-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 320px;
}

.scene {
  position: relative;
  width: 100%;
  max-width: 360px;
  height: 260px;
  border-radius: 24px;
  background: var(--color-background-mute);
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.nest {
  position: absolute;
  left: 50%;
  bottom: 22px;
  transform: translateX(-50%);
  font-size: 4rem;
  filter: drop-shadow(0 6px 8px rgba(0, 0, 0, 0.12));
}

.blossom-branch {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: auto;
  z-index: 1;
  pointer-events: none;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.22));
}

.falling-petals .petal {
  transform-box: fill-box;
  transform-origin: center;
  animation: petal-fall 6s ease-in infinite;
}

.falling-petals .p1 {
  animation-delay: 0s;
}
.falling-petals .p2 {
  animation-delay: 1.4s;
}
.falling-petals .p3 {
  animation-delay: 2.8s;
}
.falling-petals .p4 {
  animation-delay: 4.2s;
}

@keyframes petal-fall {
  0% {
    transform: translate(0, -10px) rotate(0deg);
    opacity: 0;
  }
  15% {
    opacity: 0.85;
  }
  85% {
    opacity: 0.6;
  }
  100% {
    transform: translate(16px, 58px) rotate(160deg);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .falling-petals .petal {
    animation: none;
  }
}

.magpie {
  position: absolute;
  left: 50%;
  bottom: 86px;
  transform: translateX(-50%);
  z-index: 2;
}

.bird {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 180px;
  height: 180px;
  filter: drop-shadow(0 10px 14px rgba(0, 0, 0, 0.18));
}

.magpie-svg {
  display: block;
  width: 180px;
  height: 180px;
}

.leg-broken {
  opacity: 1;
}

.leg-healed {
  transition: all 0.25s ease;
}

.bandage-wrap {
  transform-origin: center;
  animation: bandageTie 0.45s ease-out;
}

@keyframes bandageTie {
  0% {
    transform: scaleY(0.4) translateY(8px);
    opacity: 0;
  }
  100% {
    transform: scaleY(1) translateY(0);
    opacity: 1;
  }
}

.newspaper {
  position: absolute;
  left: -14px;
  top: 34px;
  font-size: 1.7rem;
  animation: paperSwing 1.1s ease-in-out infinite alternate;
}

.magpie.injured {
  animation: shiver 0.45s ease-in-out infinite;
}

.magpie.healing {
  animation: healBounce 0.9s ease-in-out infinite;
}

.magpie.flying {
  animation: flyAway 1.8s ease-in forwards;
}

.magpie.returned {
  animation: land 0.9s ease-out;
}

@keyframes shiver {
  0%,
  100% {
    transform: translateX(-50%) translateX(0);
  }
  25% {
    transform: translateX(-50%) translateX(-2px);
  }
  75% {
    transform: translateX(-50%) translateX(2px);
  }
}

@keyframes healBounce {
  0%,
  100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(-10px);
  }
}

@keyframes flyAway {
  0% {
    transform: translateX(-50%) translate(0, 0) scale(1) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateX(-50%) translate(180px, -160px) scale(0.68) rotate(-14deg);
    opacity: 0;
  }
}

@keyframes land {
  0% {
    transform: translateX(-50%) translateY(-28px) scale(1.08);
    opacity: 0;
  }
  60% {
    transform: translateX(-50%) translateY(4px) scale(0.98);
    opacity: 1;
  }
  100% {
    transform: translateX(-50%) translateY(0) scale(1);
  }
}

@keyframes paperSwing {
  from {
    transform: rotate(-8deg);
  }
  to {
    transform: rotate(8deg);
  }
}

.speech {
  position: absolute;
  top: 18px;
  right: 10px;
  z-index: 3;
  max-width: 220px;
  padding: 12px 14px;
  border-radius: 18px 18px 4px 18px;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.25);
  font-size: 0.92rem;
  line-height: 1.45;
  color: var(--color-text);
}

.speech.success {
  background: var(--color-background-mute);
  border-color: var(--magpie-accent-strong);
}

.speech.returned {
  background: var(--color-background-mute);
}

.bubble-enter-active,
.bubble-leave-active {
  transition: all 0.28s ease;
}

.bubble-enter-from,
.bubble-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.selector {
  padding: 0 36px 36px;
}

.selector h2 {
  margin: 0 0 18px;
  font-size: 1.15rem;
  color: var(--color-heading);
}

.bandage-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.bandage-btn {
  height: auto;
  display: flex;
  flex-direction: row; /* 세로 -> 가로 */
  align-items: center;
  justify-content: center; /* 가운데 정렬 */
  gap: 8px; /* 이모지와 글자 사이 간격 */
  padding: 18px 14px;
  border-radius: 16px;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
  text-align: center;
}


.bandage-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
}

.bandage-btn .emoji {
  font-size: 1.6rem;
  margin-right: 8px;
}

.bandage-btn.yellow:hover {
  border-color: #f4b942;
}
.bandage-btn.blue:hover {
  border-color: var(--magpie-blue);
}
.bandage-btn.red:hover {
  border-color: #ef4444;
}
.bandage-btn.black:hover {
  border-color: rgba(255, 255, 255, 0.5);
}

.article-card {
  margin: 0 24px 28px;
  border-radius: 20px;
  box-shadow: 0 16px 34px rgba(0, 0, 0, 0.25);
}

.article-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 18px;
}

.source {
  display: inline-block;
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--magpie-accent);
  margin-bottom: 8px;
}

.article-header h2 {
  margin: 0;
  font-size: clamp(1.4rem, 3vw, 2rem);
  line-height: 1.2;
  color: var(--color-heading);
}

.chip {
  white-space: nowrap;
  font-weight: 700;
  font-size: 0.9rem;
}

.section {
  padding-top: 18px;
  border-top: 1px dashed var(--color-border);
  margin-top: 18px;
}

.section h3 {
  margin: 0 0 10px;
  font-size: 1rem;
  color: var(--color-heading);
}

.section p {
  margin: 0;
  line-height: 1.8;
  color: var(--color-text);
  opacity: 0.9;
}

.actions {
  display: flex;
  justify-content: center;
  margin-top: 26px;
}

.reset {
  border-radius: 999px;
  background: var(--magpie-gradient);
  border: none;
  box-shadow: 0 6px 16px var(--magpie-accent-strong);
}

.reset:hover {
  filter: brightness(1.08);
}

.card-enter-active,
.card-leave-active {
  transition: all 0.36s ease;
}

.card-enter-from,
.card-leave-to {
  opacity: 0;
  transform: translateY(18px);
}

@media (max-width: 860px) {
  .hero {
    grid-template-columns: 1fr;
  }

  .bandage-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .article-header {
    flex-direction: column;
  }
}

@media (max-width: 520px) {
  .board {
    padding: 18px 10px 36px;
  }

  .paper {
    border-radius: 22px;
  }

  .hero,
  .selector {
    padding: 22px;
  }

  .article-card {
    margin: 0 14px 18px;
  }

  .bandage-grid {
    grid-template-columns: 1fr;
  }
}
</style>
