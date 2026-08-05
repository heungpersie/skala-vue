<script setup>
// ─────────────────────────────────────────────────────────────
// [MagpieLibraryView] /library 라우트의 "까치의 서재" 화면입니다.
// - axios로 카카오 책 검색 Open API(dapi.kakao.com)를 호출해 키워드로 책을 검색합니다.
// - 인증은 카카오 REST API 키(VITE_KAKAO_API_KEY 환경변수)를 Authorization 헤더에 실어 보냅니다.
// - 검색 결과 중 담고 싶은 책을 위시리스트(ref 배열)에 추가/삭제할 수 있습니다.
//   (별도 서버 저장 없이 컴포넌트 메모리에만 유지되는 반응형 상태입니다.)
// ─────────────────────────────────────────────────────────────
import { ref } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { Search, Loading } from '@element-plus/icons-vue'

// Vite는 .env의 VITE_ 접두사가 붙은 변수만 import.meta.env로 클라이언트에 노출합니다.
// 키가 없을 수도 있으니 빈 문자열을 기본값으로 두고, 아래 searchBooks에서 별도 안내합니다.
const KAKAO_API_KEY = import.meta.env.VITE_KAKAO_API_KEY || ''

// ref: 원시값/객체를 감싸 반응형으로 만드는 기본 API. .value로 접근/변경합니다.
const keyword = ref('')
const books = ref([])
const isSearching = ref(false)
const wishlist = ref([])

// isbn을 기준으로 이미 위시리스트에 담긴 책인지 판별하는 헬퍼입니다.
// (버튼 라벨/색상을 위시 여부에 따라 다르게 보여주는 데 사용됩니다.)
const isWished = (book) => wishlist.value.some((item) => item.isbn === book.isbn)

// 카카오 책 검색 API를 호출하는 비동기 함수입니다.
// 입력값/키 유무를 먼저 검사하고, isSearching으로 로딩 상태를 관리하며,
// 성공/실패/완료 각각에서 사용자에게 el-message로 피드백을 줍니다.
const searchBooks = async () => {
  const normalized = keyword.value.trim()

  if (!normalized) {
    ElMessage.warning('검색어를 입력해주세요!')
    return
  }

  if (!KAKAO_API_KEY) {
    ElMessage.warning('카카오 API 키가 없습니다. .env에 VITE_KAKAO_API_KEY를 설정해주세요.')
    return
  }

  isSearching.value = true

  try {
    const response = await axios.get('https://dapi.kakao.com/v3/search/book', {
      params: {
        query: normalized,
        size: 12,
      },
      // 카카오 API는 Bearer 토큰이 아닌 "KakaoAK {REST API 키}" 형식을 요구합니다.
      headers: {
        Authorization: `KakaoAK ${KAKAO_API_KEY}`,
      },
    })

    books.value = response.data.documents

    if (books.value.length === 0) {
      ElMessage.info('검색 결과가 없습니다')
    }
  } catch (error) {
    // 네트워크 오류/키 만료 등 예외 상황에서도 화면이 깨지지 않도록 결과를 비우고 안내만 띄웁니다.
    console.error(error)
    books.value = []
    ElMessage.warning('책 검색에 실패했습니다. 잠시 후 다시 시도해주세요.')
  } finally {
    // 성공/실패 여부와 무관하게 로딩 스피너는 항상 꺼줍니다.
    isSearching.value = false
  }
}

// 검색 결과 카드의 "위시리스트에 담기/삭제" 버튼에서 호출됩니다.
// 이미 담긴 책이면 제거, 아니면 추가 — 하나의 토글 함수로 두 동작을 처리합니다.
const toggleWishlist = (book) => {
  if (isWished(book)) {
    wishlist.value = wishlist.value.filter((item) => item.isbn !== book.isbn)
    ElMessage.success(`${book.title} 위시리스트에서 삭제했습니다`)
    return
  }

  wishlist.value = [...wishlist.value, book]
  ElMessage.success(`${book.title} 위시리스트에 추가했습니다`)
}

// 위시리스트 영역에서 직접 삭제할 때 사용하는 함수입니다(toggleWishlist의 삭제 분기와 동일한 로직).
const removeFromWishlist = (book) => {
  wishlist.value = wishlist.value.filter((item) => item.isbn !== book.isbn)
  ElMessage.success('삭제되었습니다!')
}
</script>

<template>
  <div class="library">
    <h1 class="page-title">📚 까치의 서재</h1>
    <p class="page-subtitle">
      까치가 이번엔 책을 물어다 드립니다. 카카오 책 검색으로 읽고 싶은 책을 찾아 나만의
      위시리스트에 담아보세요.
    </p>

    <el-card class="search-card">
      <template #header>
        <h2>🔍 책 검색</h2>
      </template>

      <el-input
        v-model="keyword"
        class="book-input"
        placeholder="책 제목이나 작가를 입력하세요"
        clearable
        @keyup.enter="searchBooks"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
        <template #suffix>
          <el-icon v-if="isSearching" class="is-loading"><Loading /></el-icon>
        </template>
      </el-input>

      <el-button type="primary" class="search-button" :loading="isSearching" @click="searchBooks">
        검색
      </el-button>

      <el-empty
        v-if="!isSearching && keyword.trim() && books.length === 0"
        description="검색 결과가 없습니다"
      />
    </el-card>

    <div v-if="books.length" class="book-grid">
      <el-card v-for="book in books" :key="book.isbn" class="book-card" shadow="hover">
        <img :src="book.thumbnail" alt="책 표지" class="book-thumbnail" />

        <h3 class="book-title">{{ book.title }}</h3>
        <p class="book-meta">{{ book.authors.join(', ') || '작가 정보 없음' }} · {{ book.publisher }}</p>
        <p class="book-contents">{{ book.contents }}</p>

        <el-button
          class="wish-button"
          :type="isWished(book) ? 'danger' : 'primary'"
          plain
          @click="toggleWishlist(book)"
        >
          {{ isWished(book) ? '위시리스트에서 삭제' : '🐦‍⬛ 위시리스트에 담기' }}
        </el-button>
      </el-card>
    </div>

    <el-card class="wishlist-card" shadow="hover">
      <template #header>
        <h2>🪺 나의 위시리스트</h2>
      </template>

      <el-empty v-if="wishlist.length === 0" description="담아둔 책이 없습니다" />

      <div v-else class="wishlist-grid">
        <div v-for="book in wishlist" :key="book.isbn" class="wishlist-item">
          <img :src="book.thumbnail" alt="책 표지" class="wishlist-thumbnail" />

          <div class="wishlist-info">
            <h3>{{ book.title }}</h3>
            <p>{{ book.authors.join(', ') || '작가 정보 없음' }}</p>
          </div>

          <el-button type="danger" size="small" @click="removeFromWishlist(book)">삭제</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.library {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.page-title {
  width: 100%;
  margin: 0 0 8px;
  text-align: center;
  font-size: clamp(1.7rem, 3vw, 2.6rem);
  font-weight: 700;
  letter-spacing: 0.01em;
  color: var(--color-heading);
  box-sizing: border-box;
}

.page-subtitle {
  width: 100%;
  max-width: 560px;
  margin: 0 auto 28px;
  text-align: center;
  color: var(--color-text);
  opacity: 0.75;
  line-height: 1.7;
  font-size: 0.95rem;
  box-sizing: border-box;
}

.search-card,
.book-card,
.wishlist-card {
  position: relative;
  overflow: hidden;
  width: 100%;
  border-radius: 18px;
}

.search-card::before,
.book-card::before,
.wishlist-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--magpie-gradient);
  z-index: 1;
}

.book-input {
  width: 100%;
  margin-bottom: 12px;
}

.search-button {
  border-radius: 999px;
}

.is-loading {
  animation: spin 1s linear infinite;
  color: var(--magpie-accent);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

h2 {
  margin: 0;
  font-size: 1.3rem;
  color: var(--color-heading);
}

.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}

.book-card {
  display: flex;
  flex-direction: column;
}

.book-thumbnail {
  width: 100%;
  max-width: 140px;
  margin: 0 auto 12px;
  border-radius: 8px;
  display: block;
}

.book-title {
  margin: 0 0 6px;
  font-size: 1.02rem;
  color: var(--color-heading);
}

.book-meta {
  margin: 0 0 8px;
  font-size: 0.85rem;
  color: var(--color-text);
  opacity: 0.75;
}

.book-contents {
  margin: 0 0 14px;
  font-size: 0.85rem;
  line-height: 1.6;
  color: var(--color-text);
  opacity: 0.85;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.wish-button {
  margin-top: auto;
  align-self: flex-start;
  border-radius: 999px;
}

.wishlist-grid {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.wishlist-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: var(--color-background-mute);
}

.wishlist-thumbnail {
  width: 48px;
  height: 68px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
}

.wishlist-info {
  flex: 1;
  min-width: 0;
}

.wishlist-info h3 {
  margin: 0 0 4px;
  font-size: 0.95rem;
  color: var(--color-heading);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wishlist-info p {
  margin: 0;
  font-size: 0.82rem;
  color: var(--color-text);
  opacity: 0.75;
}
</style>
