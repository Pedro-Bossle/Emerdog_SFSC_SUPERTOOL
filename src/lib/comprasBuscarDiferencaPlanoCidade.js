/**
 * Busca `diferenca` em `planos_cidade` por procedimento_cod + plano_id + regiao_id
 * (mesmo critério que Supertabela Planos — sem cidade_id; coluna inexistente gera 400 no PostgREST).
 * Testa variantes de caixa no código do procedimento.
 */

const selectDiferenca = 'id, procedimento_cod, diferenca, plano_id'

const parseDiferenca = (raw) => {
    if (raw == null || raw === '') return null
    const n = Number(raw)
    return Number.isFinite(n) ? n : null
}

/** Ordem: exato (trim), maiúsculas, minúsculas — deduplicado */
const variantesProcedimentoCod = (raw) => {
    const t = String(raw ?? '').trim()
    if (!t) return []
    const u = t.toUpperCase()
    const l = t.toLowerCase()
    return [...new Set([t, u, l])]
}

const queryPorRegiao = (supabase, procedimentoCod, regiaoId, planoId) =>
    supabase
        .from('planos_cidade')
        .select(selectDiferenca)
        .eq('procedimento_cod', procedimentoCod)
        .eq('regiao_id', regiaoId)
        .eq('plano_id', planoId)
        .order('id', { ascending: false })
        .limit(1)

const montarResultadoLinha = (row, planoIdFallback, origem) => ({
    encontrado: true,
    planoCidadeId: row.id,
    diferenca: parseDiferenca(row.diferenca),
    planoUtilizadoId: Number(row.plano_id || planoIdFallback),
    origem,
})

const tentarUmaVariante = async (supabase, { procedimentoCod, regiaoId, planoId }) => {
    const pid = Number(planoId)
    if (!pid) return { row: null, erro: null }

    if (regiaoId == null || regiaoId === '') return { row: null, erro: null }

    const rRegiao = await queryPorRegiao(supabase, procedimentoCod, Number(regiaoId), pid)
    if (rRegiao.error) return { row: null, erro: rRegiao.error }
    if (rRegiao.data?.length) return { row: rRegiao.data[0], erro: null }
    return { row: null, erro: null }
}

export const buscarDiferencaPlanoCidadeUmaTentativa = async (supabase, { procedimentoCod, regiaoId, planoId }) => {
    const variantes = variantesProcedimentoCod(procedimentoCod)
    if (!variantes.length) return { row: null, erro: null }

    let ultimoErro = null
    for (const cod of variantes) {
        const { row, erro } = await tentarUmaVariante(supabase, {
            procedimentoCod: cod,
            regiaoId,
            planoId,
        })
        if (erro) ultimoErro = erro
        if (row && row.id != null) return { row, erro: null }
    }

    return { row: null, erro: ultimoErro }
}

/**
 * Percorre planos do comprador até o topo até encontrar linha em planos_cidade.
 */
export const buscarDiferencaComCascataPlanos = async (supabase, { procedimentoCod, regiaoId, planoIdsOrdenados }) => {
    const lista = Array.isArray(planoIdsOrdenados) ? planoIdsOrdenados : []
    let ultimoErro = null

    for (let i = 0; i < lista.length; i += 1) {
        const planoId = lista[i]
        const { row, erro } = await buscarDiferencaPlanoCidadeUmaTentativa(supabase, {
            procedimentoCod,
            regiaoId,
            planoId,
        })
        if (erro) ultimoErro = erro
        if (row && row.id != null) {
            return {
                ...montarResultadoLinha(row, planoId, i === 0 ? 'match_direto' : 'plano_superior'),
                erro: null,
            }
        }
    }

    return {
        encontrado: false,
        planoCidadeId: null,
        diferenca: null,
        planoUtilizadoId: null,
        origem: 'nao_encontrado',
        erro: ultimoErro,
    }
}
