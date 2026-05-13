/**
 * Retorna o valor de venda cadastrado para o código do procedimento.
 * Se houver mais de uma linha (sem unique no BD), usa a de maior id.
 */
export const escolherValorVendaParaContexto = (codigo, linhas) => {
    const cod = String(codigo || '')
        .trim()
        .toUpperCase()
    const candidatos = (linhas || []).filter(
        (r) => String(r.cod_procedimento || '').trim().toUpperCase() === cod
    )
    if (!candidatos.length) return { valor: null, linha: null }

    const ordenado = [...candidatos].sort((a, b) => Number(b.id || 0) - Number(a.id || 0))
    const top = ordenado[0]
    return {
        valor: top != null && top.valor_venda != null ? Number(top.valor_venda) : null,
        linha: top || null,
    }
}
