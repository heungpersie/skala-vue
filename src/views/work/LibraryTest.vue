<script setup>
// ─────────────────────────────────────────────────────────────
// [LibraryTest] ClassicLiteratureView.vue에 포함되는 "책BTI" 성향 테스트 컴포넌트입니다.
// - 5개의 A/B 양자택일 질문에 답하면 답변을 이어붙인 문자열 키(예: "AABAB")로
//   src/data/literaryResults.js의 결과 테이블을 조회해 성향 유형/추천 도서를 결정합니다.
//   (MBTI처럼 선택지 조합 자체가 결과를 가리키는 룩업 테이블 패턴)
// - 추천 도서가 정해지면 카카오 책 검색 API로 실제 책 표지/출판 정보를 다시 조회해 보여줍니다.
// ─────────────────────────────────────────────────────────────
import { ref, computed } from 'vue'
import axios from 'axios'
import { literaryResults } from '@/data/literaryResults'

// 5개의 질문과 각 질문의 두 선택지(A/B)를 정의한 정적 데이터입니다.
// 답변 순서대로 이어붙인 A/B 조합이 literaryResults의 키와 매칭됩니다.
const questions = [
  {
    text: '까치가 갑자기 당신의 이름을 부른다.',
    options: [
      { text: '대답한다', value: 'A' },
      { text: '못 들은 척한다', value: 'B' }
    ]
  },
  {
    text: '까치를 발견했다.',
    options: [
      { text: '흥부에게 가져다준다', value: 'A' },
      { text: '놀부에게 가져다준다', value: 'B' }
    ]
  },
  {
    text: '까치가 춤을 추기 시작한다.',
    options: [
      { text: '같이 춘다', value: 'A' },
      { text: '자리를 피한다', value: 'B' }
    ]
  },
  {
    text: '까치가 술 한잔하자고 한다.',
    options: [
      { text: '쐬주 한잔한다', value: 'A' },
      { text: '정중히 거절한다', value: 'B' }
    ]
  },
  {
    text: '까치가 가위바위보를 하자고 한다.',
    options: [
      { text: '까치는 보밖에 못 내지만, 나는 가위를 낸다', value: 'A' },
      { text: '그런 불공정한 승부는 거절한다', value: 'B' }
    ]
  }
]

// 현재 보여줄 질문의 인덱스입니다. 0부터 questions.length - 1까지 증가합니다.
const currentIndex = ref(0)
// 지금까지 선택한 답변('A'/'B')을 순서대로 담는 배열입니다. 최종적으로 join('')하면
// literaryResults의 키(예: "AABAB")가 됩니다.
const answers = ref([])
// 모든 질문에 답한 뒤 literaryResults에서 찾은 결과 객체(성향/추천 도서 정보)입니다.
const result = ref(null)
// 추천 도서를 카카오 책 검색 API로 재조회한 실제 검색 결과(표지, 출판사 등)입니다.
const kakaoBook = ref(null)
const isSearching = ref(false)

// computed: currentIndex가 바뀔 때마다 자동으로 재계산되는 진행률(%)입니다.
const progress = computed(() => Math.round((currentIndex.value / questions.length) * 100))

// literaryResults에 저장된 추천 도서 제목/저자로 카카오 책 검색 API를 호출해
// 실제 책 표지 이미지와 출판사 정보를 가져옵니다.
const searchBook = async (title, author) => {
  isSearching.value = true

  try {
    const response = await axios.get(
      'https://dapi.kakao.com/v3/search/book',
      {
        params: {
          query: title,
          size: 10
        },
        headers: {
          Authorization: `KakaoAK ${import.meta.env.VITE_KAKAO_API_KEY}`
        }
      }
    )

    const documents = response.data.documents

    // 동명이서 대비: 저자가 일치하는 결과를 우선으로 고른다
    const authorMatch = documents.find((doc) =>
      doc.authors.some((docAuthor) => docAuthor.includes(author) || author.includes(docAuthor))
    )

    kakaoBook.value = authorMatch ?? documents[0]
  } catch (error) {
    // 검색 실패해도 테스트 결과 자체는 이미 나온 상태이므로, 에러는 콘솔에만 남기고
    // 화면에서는 el-empty의 "찾지 못했어요" 문구로 자연스럽게 대체합니다.
    console.error('책 검색 실패:', error)
  } finally {
    isSearching.value = false
  }
}

// 선택지 버튼 클릭 시 호출됩니다.
// 마지막 질문이 아니면 다음 질문으로 넘어가고, 마지막 질문이었다면
// 지금까지의 답변 조합으로 결과를 확정하고 추천 도서를 검색합니다.
const selectAnswer = (value) => {
  answers.value.push(value)

  if (currentIndex.value < questions.length - 1) {
    currentIndex.value++
  } else {
    // answers 배열(['A','A','B',...])을 이어붙여 "AABAB" 같은 키 문자열을 만들고,
    // literaryResults 룩업 테이블에서 해당 성향/추천 도서를 찾습니다.
    const resultKey = answers.value.join('')

    result.value = literaryResults[resultKey]

    // 정확한 책을 찾기 위해 keyword(테마 문구)가 아닌 실제 책 제목 + 저자로 카카오 검색
    searchBook(result.value.book, result.value.author)
  }
}

// "다시 테스트하기" 버튼에서 호출되어 모든 상태를 초기값으로 되돌립니다.
const resetTest = () => {
  currentIndex.value = 0
  answers.value = []
  result.value = null
  kakaoBook.value = null
}
</script>

<template>
  <el-card class="test" shadow="hover">
    <template v-if="!result">
      <div class="progress-row">
        <span class="step-label">질문 {{ currentIndex + 1 }} / {{ questions.length }}</span>
        <el-progress
          :percentage="progress"
          :show-text="false"
          :stroke-width="6"
          color="var(--magpie-accent)"
        />
      </div>

      <h2 class="question">{{ questions[currentIndex].text }}</h2>

      <div class="option-grid">
        <el-button
          v-for="option in questions[currentIndex].options"
          :key="option.value"
          class="option-btn"
          @click="selectAnswer(option.value)"
        >
          {{ option.text }}
        </el-button>
      </div>
    </template>

    <template v-else>
      <div class="result">
        <span class="badge">📖 당신의 문학 성향</span>
        <h2 class="result-type">{{ result.type }}</h2>

        <el-empty v-if="isSearching" description="추천 도서를 찾는 중이에요..." />

        <div v-else-if="kakaoBook" class="book-card">
          <img :src="kakaoBook.thumbnail" alt="책 표지" class="book-thumbnail" />

          <div class="book-info">
            <h3 class="book-title">{{ kakaoBook.title }}</h3>
            <p class="book-meta">
              {{ kakaoBook.authors.join(', ') || '작가 정보 없음' }} · {{ kakaoBook.publisher }}
            </p>
          </div>
        </div>

        <el-empty v-else :description="`추천 도서 '${result.book}'을(를) 찾지 못했어요`" />

        <div class="actions">
          <el-button class="retry-btn" type="primary" @click="resetTest">🔁 다시 테스트하기</el-button>
        </div>
      </div>
    </template>
  </el-card>
</template>

<style scoped>
.test {
  position: relative;
  overflow: hidden;
  width: 100%;
  max-width: 560px;
  border-radius: 18px;
}

.test :deep(.el-card__body) {
  padding: 28px;
}

.test::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--magpie-gradient);
  z-index: 1;
}

.progress-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.step-label {
  flex-shrink: 0;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--magpie-accent);
}

.progress-row :deep(.el-progress) {
  flex: 1;
}

.question {
  margin: 0 0 22px;
  font-size: 1.15rem;
  line-height: 1.5;
  color: var(--color-heading);
}

.option-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.option-btn {
  height: auto;
  padding: 14px;
  border-radius: 14px;
  white-space: normal;
  line-height: 1.4;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
}

.option-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  border-color: var(--magpie-accent);
  color: var(--magpie-accent);
}

.result {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
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

.result-type {
  margin: 14px 0 22px;
  font-size: clamp(1.2rem, 3vw, 1.6rem);
  color: var(--color-heading);
}

.book-card {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: var(--color-background-mute);
  text-align: left;
}

.book-thumbnail {
  width: 72px;
  height: auto;
  border-radius: 8px;
  flex-shrink: 0;
}

.book-info {
  flex: 1;
  min-width: 0;
}

.book-title {
  margin: 0 0 6px;
  font-size: 1rem;
  color: var(--color-heading);
}

.book-meta {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-text);
  opacity: 0.75;
}

.actions {
  margin-top: 24px;
}

.retry-btn {
  border-radius: 999px;
  background: var(--magpie-gradient);
  border: none;
  box-shadow: 0 6px 16px var(--magpie-accent-strong);
}

.retry-btn:hover {
  filter: brightness(1.08);
}

@media (max-width: 520px) {
  .test :deep(.el-card__body) {
    padding: 20px;
  }

  .option-grid {
    grid-template-columns: 1fr;
  }

  .book-card {
    flex-direction: column;
    text-align: center;
  }
}
</style>
