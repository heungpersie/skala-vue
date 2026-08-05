import { handleMockApiRequest } from './handler.js'
import { sendError, sendJson } from './utils/httpUtils.js'

// npm run dev만으로 Mock API까지 함께 뜨도록 Vite 개발 서버에 미들웨어로 붙입니다.
// configureServer는 `vite dev`에서만 호출되므로 프로덕션 빌드에는 영향이 없습니다.
export function mockApiPlugin() {
  return {
    name: 'mock-api',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const host = request.headers.host ?? 'localhost'
        const url = new URL(request.url ?? '/', `http://${host}`)

        if (!url.pathname.startsWith('/api/')) {
          next()
          return
        }

        if (request.method === 'OPTIONS') {
          sendJson(response, 204)
          return
        }

        try {
          const handled = await handleMockApiRequest(request, response, url)

          if (!handled) {
            sendJson(response, 404, {
              message: '존재하지 않는 API 경로입니다.',
            })
          }
        } catch (error) {
          sendError(response, error)
        }
      })
    },
  }
}
