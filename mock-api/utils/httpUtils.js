const corsHeaders = {
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, X-Lab-Client',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json; charset=utf-8',
}

export function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, corsHeaders)

  if (statusCode === 204) {
    response.end()
    return
  }

  response.end(JSON.stringify(payload))
}

export function createHttpError(statusCode, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

export function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let receivedBytes = 0

    request.on('data', (chunk) => {
      receivedBytes += chunk.length

      if (receivedBytes > 100_000) {
        reject(createHttpError(413, '요청 본문이 너무 큽니다.'))
        return
      }

      chunks.push(chunk)
    })

    request.on('end', () => {
      if (chunks.length === 0) {
        resolve({})
        return
      }

      try {
        const body = JSON.parse(Buffer.concat(chunks).toString('utf8'))

        if (!body || Array.isArray(body) || typeof body !== 'object') {
          reject(createHttpError(400, '요청 본문은 JSON 객체여야 합니다.'))
          return
        }

        resolve(body)
      } catch (error) {
        if (error.statusCode) {
          reject(error)
          return
        }
        reject(createHttpError(400, '올바른 JSON 형식이 아닙니다.'))
      }
    })

    request.on('error', reject)
  })
}

export function sendError(response, error) {
  const statusCode = Number(error.statusCode) || 500
  const message =
    statusCode >= 500 ? '서버 내부 오류가 발생했습니다.' : error.message

  if (statusCode >= 500) console.error(error)
  sendJson(response, statusCode, { message })
}

export async function waitForRequestedDelay(url) {
  const requested = Number(url.searchParams.get('delay') ?? 0)
  const delay = Number.isFinite(requested)
    ? Math.min(Math.max(requested, 0), 3000)
    : 0

  if (delay > 0) {
    await new Promise((resolve) => setTimeout(resolve, delay))
  }
}
