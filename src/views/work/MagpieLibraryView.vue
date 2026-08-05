<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { Search, Loading } from '@element-plus/icons-vue'

const KAKAO_API_KEY = import.meta.env.VITE_KAKAO_API_KEY || ''

const keyword = ref('')
const books = ref([])
const isSearching = ref(false)
const wishlist = ref([])

const isWished = (book) => wishlist.value.some((item) => item.isbn === book.isbn)

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
      headers: {
        Authorization: `KakaoAK ${KAKAO_API_KEY}`,
      },
    })

    books.value = response.data.documents

    if (books.value.length === 0) {
      ElMessage.info('검색 결과가 없습니다')
    }
  } catch (error) {
    console.error(error)
    books.value = []
    ElMessage.warning('책 검색에 실패했습니다. 잠시 후 다시 시도해주세요.')
  } finally {
    isSearching.value = false
  }
}

const toggleWishlist = (book) => {
  if (isWished(book)) {
    wishlist.value = wishlist.value.filter((item) => item.isbn !== book.isbn)
    ElMessage.success(`${book.title} 위시리스트에서 삭제했습니다`)
    return
  }

  wishlist.value = [...wishlist.value, book]
  ElMessage.success(`${book.title} 위시리스트에 추가했습니다`)
}

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
