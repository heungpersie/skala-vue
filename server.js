import http from 'node:http'

import { handleMockApiRequest } from './mock-api/handler.js'
import { sendError, sendJson } from './mock-api/utils/httpUtils.js'

const port = Number(process.env.API_PORT ?? 3001)

const server = http.createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    sendJson(response, 204)
    return
  }

  const host = request.headers.host ?? `localhost:${port}`
  const url = new URL(request.url ?? '/', `http://${host}`)

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

server.listen(port, '127.0.0.1', () => {
  console.log(`JWT Mock API: http://127.0.0.1:${port}/api`)
  console.log('테스트 계정: student@skala.com / 1234')
})

export { server }
