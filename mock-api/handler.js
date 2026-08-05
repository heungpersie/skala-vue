import { handleAuthRoutes } from './routes/authRoutes.js'
import { sendJson, waitForRequestedDelay } from './utils/httpUtils.js'

// server.js(standalone)와 Vite 개발 서버 미들웨어가 동일한 라우팅 로직을 공유하도록 분리했습니다.
export async function handleMockApiRequest(request, response, url) {
  await waitForRequestedDelay(url)

  if (request.method === 'GET' && url.pathname === '/api/health') {
    sendJson(response, 200, {
      status: 'ok',
      service: 'JWT Mock API',
    })
    return true
  }

  if (await handleAuthRoutes(request, response, url)) return true

  return false
}
