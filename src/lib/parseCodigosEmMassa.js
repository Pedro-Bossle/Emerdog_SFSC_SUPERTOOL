/**
 * Extrai códigos de texto colado: aceita vírgula, quebra de linha e tab (ex.: Excel).
 * Retorna lista única em maiúsculas.
 */
export function extrairCodigosProcedimentoEmMassa(texto) {
    return [
        ...new Set(
            String(texto || '')
                .replace(/\r/g, '')
                .split(/[,\n\t]+/)
                .map((item) => item.trim().toUpperCase())
                .filter(Boolean)
        ),
    ]
}

const normalizarCodLinha = (s) => String(s || '').trim().toUpperCase()

const parseValorNumero = (raw) => {
    const t = String(raw || '').trim().replace(/\s+/g, '').replace(',', '.')
    const n = Number(t)
    return Number.isFinite(n) ? n : NaN
}

/**
 * Uma linha por registro: CODIGO;VALOR ou CODIGO<TAB>VALOR ou "CODIGO VALOR" (último token = valor).
 * Ignora linhas vazias. Códigos em maiúsculas.
 */
export function extrairParesCodigoValorEmMassa(texto) {
    const linhas = String(texto || '')
        .replace(/\r/g, '')
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean)

    const mapa = new Map()

    for (const linha of linhas) {
        let cod = ''
        let valRaw = ''

        if (linha.includes(';')) {
            const partes = linha.split(';')
            cod = partes[0]
            valRaw = partes.slice(1).join(';')
        } else if (linha.includes('\t')) {
            const partes = linha.split('\t')
            cod = partes[0]
            valRaw = partes[partes.length - 1]
        } else {
            const ultimoEspaco = linha.lastIndexOf(' ')
            if (ultimoEspaco > 0) {
                cod = linha.slice(0, ultimoEspaco)
                valRaw = linha.slice(ultimoEspaco + 1)
            }
        }

        const codigo = normalizarCodLinha(cod)
        const valor = parseValorNumero(valRaw)
        if (!codigo || Number.isNaN(valor)) continue
        mapa.set(codigo, valor)
    }

    return [...mapa.entries()].map(([codigo, valor]) => ({ codigo, valor }))
}
