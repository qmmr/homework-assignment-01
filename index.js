const http = require('http')
const url = require('url')
const StringDecoder = require('string_decoder').StringDecoder
const PORT = 1337

const httpServer = http.createServer(function(req, res) {
	const parsedUrl = url.parse(req.url, true)
	const path = parsedUrl.pathname
	const queryString = parsedUrl.query
	const headers = req.headers
	const trimmedPath = path.replace(/^\/+|\/+$/g, '')
	const method = req.method.toLocaleLowerCase()

	const decoder = new StringDecoder('utf-8')
	let buffer = ''
	req.on('data', data => {
		buffer += decoder.write(data)
	})
	req.on('end', () => {
		buffer += decoder.end()

		const matchedHandler = typeof router[ trimmedPath ] !== 'undefined' ? handlers[ trimmedPath ] : handlers.notFound
		const data = {
			headers,
			method,
			payload: buffer,
			queryString,
			trimmedPath
		}

		matchedHandler(data, (statusCode = 200, payload = {}) => {
			const payloadString = JSON.stringify(payload)

			res.setHeader('Content-Type', 'application/json')
			res.writeHead(statusCode)
			res.end(payloadString)

			if (buffer) {
				console.log('Request was sent with payload" ', payloadString)
			} else {
				console.log('No payload sent with the request...')
			}
		})
	})

	console.log(`
---
request:
- path ${path}
- trimmedPath: ${trimmedPath}
- method: ${method}
- query string: ${JSON.stringify(queryString)}
- headers: ${JSON.stringify(headers)}
---
`)
})

httpServer.listen(PORT, () => {
	console.log(`httpServer is listening on port ${PORT}`)
})

const handlers = {}

handlers.hello = (data, cb) => {
	switch (data.method) {
		case 'get':
			return cb(200, { message: 'Hello world!' })
			break
		case 'post':
			return cb(200, { message: 'Hello there!' })
		default:
			return cb(404)
	}
}

handlers.notFound = (data, cb) => {
	cb(404)
}

const router = {
	hello: handlers.hello
}
