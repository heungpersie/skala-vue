// [까치의 서재 / 책BTI 실습] 5문항(각 A/B 2지선다) 응답 조합을 key로 하는 결과 매핑 데이터.
// 예: 'AAAAA'는 1~5번 문항을 모두 A로 답했을 때 나오는 유형이며, 총 2^5 = 32가지 조합을 모두 정의한다.
// 컴포넌트에서는 사용자의 답변을 'AABAB' 같은 문자열 key로 조합해 이 객체에서 바로 조회한다.
const literaryResults = {
    AAAAA: {
    type: '까치와 술 마시며 운명을 논하는 인간',
    book: '그리스인 조르바',
    author: '니코스 카잔차키스',
    keyword: '자유와 삶의 열정'
  },

  AAAAB: {
    type: '마지막까지 호기심을 버리지 않는 인간',
    book: '신곡',
    author: '단테 알리기에리',
    keyword: '여행과 구원의 여정'
  },

  AAABA: {
    type: '이상한 일에도 웃으며 뛰어드는 인간',
    book: '백년의 고독',
    author: '가브리엘 가르시아 마르케스',
    keyword: '마술적 현실과 운명'
  },

  AAABB: {
    type: '모험하지만 선은 지키는 인간',
    book: '달과 6펜스',
    author: '서머싯 몸',
    keyword: '예술과 욕망'
  },

  AABAA: {
    type: '혼돈 속에서도 삶을 즐기는 인간',
    book: '거장과 마르가리타',
    author: '미하일 불가꼬프',
    keyword: '광기와 자유'
  },

  AABAB: {
    type: '현실과 환상 사이를 걷는 인간',
    book: '불멸',
    author: '밀란 쿤데라',
    keyword: '기억과 존재'
  },

  AABBA: {
    type: '웃기지만 속은 깊은 인간',
    book: '농담',
    author: '밀란 쿤데라',
    keyword: '웃음과 운명의 아이러니'
  },

  AABBB: {
    type: '세상을 관찰하는 방랑자',
    book: '체호프 단편선',
    author: '안톤 체호프',
    keyword: '인간과 일상의 관찰'
  },

  ABAAA: {
    type: '본능적으로 새로운 길을 찾는 인간',
    book: '사탄 탱고',
    author: '크러스너호르커이 라슬로',
    keyword: '혼돈과 인간의 욕망'
  },

  ABAAB: {
    type: '위험한 호기심을 가진 인간',
    book: '픽션들',
    author: '호르헤 루이스 보르헤스',
    keyword: '상상과 무한한 세계'
  },

  ABABA: {
    type: '자유를 위해 모든 걸 버리는 인간',
    book: '사랑할 때와 죽을 때',
    author: '에리히 마리아 레마르크',
    keyword: '전쟁과 사랑'
  },

  ABABB: {
    type: '혼자만의 세계를 가진 인간',
    book: '노르웨이의 숲',
    author: '무라카미 하루키',
    keyword: '상실과 성장'
  },

  ABBAA: {
    type: '감정과 논리를 오가는 인간',
    book: '참을 수 없는 존재의 가벼움',
    author: '밀란 쿤데라',
    keyword: '사랑과 존재의 무게'
  },

  ABBAB: {
    type: '관계를 조용히 바라보는 인간',
    book: '이별의 왈츠',
    author: '밀란 쿤데라',
    keyword: '관계와 이별'
  },

  ABBBA: {
    type: '삶의 아이러니를 즐기는 인간',
    book: '웃음과 망각의 책',
    author: '밀란 쿤데라',
    keyword: '기억과 망각'
  },

  ABBBB: {
    type: '까치도 분석하는 냉철한 인간',
    book: '명상록',
    author: '마르쿠스 아우렐리우스',
    keyword: '철학과 자기성찰'
  },

  BAAAA: {
    type: '규칙보다 마음을 믿는 인간',
    book: '카라마조프가의 형제들',
    author: '도스토예프스키',
    keyword: '신앙과 인간의 갈등'
  },

  BAAAB: {
    type: '의심하면서도 결국 믿는 인간',
    book: '죄와 벌',
    author: '도스토예프스키',
    keyword: '죄와 구원'
  },

  BAABA: {
    type: '내면의 목소리를 따라가는 인간',
    book: '구토',
    author: '장 폴 사르트르',
    keyword: '실존과 자유'
  },
  BAABB: {
    type: '순수함으로 인간의 선함을 믿는 인간',
    book: '백치',
    author: '도스토예프스키',
    keyword: '순수와 구원'
  },

  BABAA: {
    type: '몰락 속에서도 자신의 삶을 바라보는 인간',
    book: '사양',
    author: '다자이 오사무',
    keyword: '몰락과 자존'
  },

  BABAB: {
    type: '극한의 환경에서도 인간성을 지키는 인간',
    book: '이반 데니소비치, 수용소의 하루',
    author: '솔제니친',
    keyword: '생존과 존엄'
  },

  BABBA: {
    type: '고독 속에서 삶의 아름다움을 발견하는 인간',
    book: '젊은 남자',
    author: '아니 에르노',
    keyword: '기억과 욕망'
  },

  BABBB: {
    type: '사회와 거리를 두며 자신을 지키는 인간',
    book: '차라투스트라는 이렇게 말했다',
    author: '프리드리히 니체',
    keyword: '초인과 자기극복'
  },

  BBAAA: {
    type: '이상을 향해 현실을 넘어서는 인간',
    book: '암 병동',
    author: '솔제니친',
    keyword: '삶과 죽음'
  },

  BBAAB: {
    type: '끝없는 여정을 통해 자신을 찾아가는 인간',
    book: '녹천에는 똥이 많다',
    author: '이창동',
    keyword: '방황과 귀환'
  },

  BBABA: {
    type: '내면의 공포와 마주하는 인간',
    book: '소지',
    author: '이창동',
    keyword: '죄책감과 두려움'
  },

  BBABB: {
    type: '열정과 운명 사이에서 흔들리는 인간',
    book: '비극의 탄생',
    author: '프리드리히 니체',
    keyword: '비극과 예술'
  },

  BBBAA: {
    type: '욕망의 대가를 알면서도 선택하는 인간',
    book: '단순한 열정',
    author: '아니 에르노',
    keyword: '사랑과 집착'
  },

  BBBAB: {
    type: '부조리한 세계에서도 자신의 감정을 살아내는 인간',
    book: '시지프 신화',
    author: '알베르 카뮈',
    keyword: '부조리와 반항'
  },

  BBBBA: {
    type: '갈등 속에서도 자신의 마음을 선택하는 인간',
    book: '밤으로의 긴 여로',
    author: '유진 오닐',
    keyword: '가족과 후회'
  },

  BBBBB: {
    type: '현실을 계산하며 자신만의 길을 걷는 인간',
    book: '카사블랑카여, 다시 한번',
    author: '우디 앨런',
    keyword: '환상과 현실'
  }
}

export { literaryResults }
