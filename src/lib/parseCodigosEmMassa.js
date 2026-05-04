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
