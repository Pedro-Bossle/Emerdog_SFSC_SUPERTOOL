import http from 'node:http'
import handler from '../api/rc-pdf.js'

const PORT = Number(process.env.API_PORT || 3000)

const server = http.createServer(async (req, res) => {
    try {
        if (req.url !== '/api/rc-pdf') {
            res.statusCode = 404
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({ error: 'Rota não encontrada.' }))
            return
        }

        const chunks = []
        for await (const chunk of req) chunks.push(chunk)
        let body = {}
        if (chunks.length) {
            try {
                body = JSON.parse(Buffer.concat(chunks).toString('utf-8'))
            } catch {
                body = {}
            }
        }

        const reqLike = { method: req.method, body }
        const resLike = {
            statusCode: 200,
            headers: {},
            setHeader(name, value) {
                this.headers[name] = value
                res.setHeader(name, value)
            },
            status(code) {
                this.statusCode = code
                res.statusCode = code
                return this
            },
            json(payload) {
                if (!res.getHeader('Content-Type')) {
                    res.setHeader('Content-Type', 'application/json; charset=utf-8')
                }
                res.statusCode = this.statusCode
                res.end(JSON.stringify(payload))
            },
            send(payload) {
                res.statusCode = this.statusCode
                res.end(payload)
            },
        }

        await handler(reqLike, resLike)
    } catch (error) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end(JSON.stringify({ error: error?.message || 'Falha na API local.' }))
    }
})

server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API local pronta em http://localhost:${PORT}`)
})
