<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { Search, Loading } from '@element-plus/icons-vue'

const API_KEY = import.meta.env.VITE_KOBIS_API_KEY || ''

const searchKeyword = ref('')
const movieResults = ref([])
const selectedMovie = ref(null)
const isSearching = ref(false)

const movieTitle = ref('')
const movieYear = ref('')
const movieGenre = ref('')
const movieOpenDate = ref('')
const movieDirector = ref('')
const watchDate = ref('')
const productRate = ref(0)
const movies = ref([])

/* KOBIS 응답의 directors 배열(예: [{ peopleNm: '봉준호' }])을 "봉준호" 형태 문자열로 변환 */
const getDirectorNames = (movie) => {
  const directors = movie?.directors ?? []
  return directors.map((director) => director.peopleNm).filter(Boolean).join(', ')
}

const resetSelectedMovie = () => {
  selectedMovie.value = null
  movieTitle.value = ''
  movieYear.value = ''
  movieGenre.value = ''
  movieOpenDate.value = ''
  movieDirector.value = ''
  watchDate.value = ''
  productRate.value = 0
}

/* el-autocomplete가 입력할 때마다(디바운스 300ms) 호출하는 자동완성 콜백 */
const fetchSuggestions = async (queryString, callback) => {
  const normalized = queryString.trim()

  if (!normalized) {
    movieResults.value = []
    callback([])
    return
  }

  if (!API_KEY) {
    movieResults.value = []
    callback([])
    ElMessage.warning('KOBIS API 키가 없습니다. .env에 VITE_KOBIS_API_KEY를 설정해주세요.')
    return
  }

  isSearching.value = true

  try {
    const response = await axios.get(
      'https://www.kobis.or.kr/kobisopenapi/webservice/rest/movie/searchMovieList.json',
      {
        params: {
          key: API_KEY,
          movieNm: normalized,
          itemPerPage: 10,
        },
      },
    )

    const list = response?.data?.movieListResult?.movieList ?? []
    movieResults.value = list
    callback(list)
  } catch (error) {
    console.error(error)
    movieResults.value = []
    callback([])
    ElMessage.warning('영화 API 호출에 실패했습니다. 잠시 후 다시 시도해주세요.')
  } finally {
    isSearching.value = false
  }
}

const selectMovie = (movie) => {
  const { movieNm, prdtYear, genreAlt, openDt } = movie

  selectedMovie.value = movie
  movieTitle.value = movieNm
  movieYear.value = prdtYear ?? ''
  movieGenre.value = genreAlt ?? ''
  movieOpenDate.value = openDt ?? ''
  movieDirector.value = getDirectorNames(movie) || '정보 없음'
  watchDate.value = ''
  productRate.value = 0
  movieResults.value = []

  ElMessage.success(`${movieNm} 선택 완료`)
}

const handleSave = () => {
  if (!selectedMovie.value || !movieTitle.value) {
    ElMessage.warning('영화를 선택해주세요!')
    return
  }

  if (!watchDate.value) {
    ElMessage.warning('관람일자를 입력해주세요!')
    return
  }

  if (productRate.value <= 0) {
    ElMessage.warning('별점을 선택해주세요!')
    return
  }

  const isDuplicate = movies.value.map((movie) => movie.title).includes(movieTitle.value)
  if (isDuplicate) {
    ElMessage.warning('이미 등록된 영화입니다!')
    return
  }

  movies.value = [
    ...movies.value,
    {
      id: Date.now(),
      title: movieTitle.value,
      year: movieYear.value,
      genre: movieGenre.value,
      openDate: movieOpenDate.value,
      director: movieDirector.value,
      watchDate: watchDate.value,
      rate: productRate.value,
    },
  ]

  ElMessage.success('영화가 저장되었습니다!')
  resetSelectedMovie()
}

const handleDelete = (id) => {
  movies.value = movies.value.filter((movie) => movie.id !== id)
  ElMessage.success('삭제되었습니다!')
}
</script>


<template>
  <div class="rank-system">
    <h1 class="page-title">까치 극장</h1>
    <p class="page-subtitle">
      까치가 물어다 준 소식 대신, 이번엔 영화를 물어다 드립니다. KOBIS 영화 검색으로 본 작품을
      찾아 감독과 개봉 정보를 확인하고, 관람일과 별점을 더해 나만의 영화 기록으로 남겨보세요.
    </p>

    <el-card class="search-card">
      <template #header>
        <h2>🎬 KOBIS 영화 검색</h2>
      </template>

      <el-autocomplete
        v-model="searchKeyword"
        class="movie-autocomplete"
        :fetch-suggestions="fetchSuggestions"
        value-key="movieNm"
        placeholder="영화 제목을 입력하면 자동완성됩니다"
        clearable
        :debounce="300"
        @select="selectMovie"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
        <template #suffix>
          <el-icon v-if="isSearching" class="is-loading"><Loading /></el-icon>
        </template>
        <template #default="{ item }">
          <div class="suggestion-item">
            <span class="suggestion-title">{{ item.movieNm }}</span>
            <span class="suggestion-meta">
              {{ item.prdtYear || '-' }} · {{ item.genreAlt || '장르 정보 없음' }} · 감독
              {{ getDirectorNames(item) || '정보 없음' }}
            </span>
          </div>
        </template>
      </el-autocomplete>

      <el-empty
        v-if="searchKeyword.trim() && !isSearching && movieResults.length === 0"
        description="검색 결과가 없습니다"
      />
    </el-card>

    <div class="movie-container">
      <el-card shadow="hover">
        <template #header>
          <h2>🎬 영화 평점 등록</h2>
        </template>

        <p>영화 제목</p>
        <el-input v-model="movieTitle" placeholder="영화 제목" readonly />

        <br /><br />

        <p>제작년도</p>
        <el-input v-model="movieYear" placeholder="제작년도" readonly />

        <br /><br />

        <p>장르</p>
        <el-input v-model="movieGenre" placeholder="장르" readonly />

        <br /><br />

        <p>개봉일</p>
        <el-input v-model="movieOpenDate" placeholder="개봉일" readonly />

        <br /><br />

        <p>감독</p>
        <el-input v-model="movieDirector" placeholder="감독" readonly />

        <br /><br />

        <p>관람일자</p>
        <el-date-picker
          v-model="watchDate"
          type="date"
          placeholder="관람일 선택"
          value-format="YYYY-MM-DD"
        />

        <br /><br />

        <p>영화 평점</p>
        <el-rate
          v-model="productRate"
          allow-half
          show-score
          score-template="{value} 점"
        />

        <br /><br />

        <el-button type="primary" @click="handleSave">저장하기</el-button>
      </el-card>

      <el-card shadow="hover">
        <template #header>
          <h2>⭐ 저장된 영화</h2>
        </template>

        <el-empty v-if="movies.length === 0" description="등록된 영화가 없습니다" />

        <div v-for="movie in movies" :key="movie.id" class="movie-item">
          <h3>{{ movie.title }}</h3>
          <p>제작년도 : {{ movie.year || '-' }}</p>
          <p>장르 : {{ movie.genre || '-' }}</p>
          <p>감독 : {{ movie.director || '-' }}</p>
          <p>관람일자 : {{ movie.watchDate }}</p>
          <p>평점 : {{ movie.rate }}점</p>

          <el-rate :model-value="movie.rate" disabled allow-half />

          <el-button type="danger" size="small" @click="handleDelete(movie.id)">
            삭제
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>



<style scoped>
.rank-system {
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
.movie-container .el-card {
  position: relative;
  overflow: hidden;
  width: 100%;
  border-radius: 18px;
}

.search-card::before,
.movie-container .el-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--magpie-gradient);
  z-index: 1;
}

.movie-autocomplete {
  width: 100%;
}

.suggestion-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 2px 0;
}

.suggestion-title {
  font-weight: 600;
  color: var(--color-heading);
}

.suggestion-meta {
  font-size: 12px;
  color: var(--color-text);
  opacity: 0.7;
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

.movie-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 28px;
  align-items: start;
}

h2 {
  margin: 0;
  font-size: 1.3rem;
  color: var(--color-heading);
}

p {
  font-weight: 600;
  margin: 0 0 8px;
  color: var(--color-text);
}

.movie-item {
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: var(--color-background-mute);
  padding: 18px 16px;
  margin-bottom: 16px;
}

.movie-item:last-child {
  margin-bottom: 0;
}

.movie-item h3 {
  margin: 0 0 10px;
  font-size: 1.05rem;
  color: var(--color-heading);
}

.movie-item p {
  margin: 6px 0;
  font-size: 0.92rem;
  color: var(--color-text);
  font-weight: 500;
  opacity: 0.85;
}

.el-button {
  margin-top: 10px;
}

:deep(.el-rate) {
  margin-top: 4px;
}
</style>
