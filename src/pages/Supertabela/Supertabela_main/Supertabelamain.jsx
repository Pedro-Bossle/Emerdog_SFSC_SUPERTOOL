import React, { useEffect, useMemo, useState } from 'react'
import './Supertabelamain.css'
import { supabase } from '../../../lib/supabase'

const Supertabelamain = () => {
    const [cidades, setCidades] = useState([])
    const [planos, setPlanos] = useState([])
    const [portes, setPortes] = useState([])
    const [categorias, setCategorias] = useState([])
    const [linhas, setLinhas] = useState([])

    const [cidadeId, setCidadeId] = useState('')
    const [planoId, setPlanoId] = useState('')
    const [porteSelecionado, setPorteSelecionado] = useState('')

    const [termoBusca, setTermoBusca] = useState('')
    const [loading, setLoading] = useState(false)
    const [erroDetalhe, setErroDetalhe] = useState('')
    const [ordenacaoPorCategoria, setOrdenacaoPorCategoria] = useState({})
    const [headerCompacto, setHeaderCompacto] = useState(false)
    const [edicaoAtiva, setEdicaoAtiva] = useState(false)
    const [edicoesLocais, setEdicoesLocais] = useState({})

    /**
     * Formata valores numéricos para moeda BRL.
     */
    const formatarMoeda = (valor) =>
        new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(Number(valor || 0))

    /**
     * Normaliza o nome do porte para facilitar comparação textual.
     */
    const normalizarPorteNome = (nome) =>
        String(nome || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim()
            .toUpperCase()

    /**
     * Obtém um ID de porte pela letra (P/M/G) usando a lista da tabela portes.
     */
    const obterPorteIdPorLetra = (letra) => {
        const alvo = String(letra || '').toUpperCase()
        const porte = portes.find((item) => {
            const nome = normalizarPorteNome(item.nome)
            return nome === alvo || nome.startsWith(alvo)
        })

        return porte ? String(porte.id) : ''
    }

    /**
     * Carrega listas base dos filtros (cidades, planos e portes) e define valores padrão.
     */
    const carregarFiltros = async () => {
        try {
            setLoading(true)
            setErroDetalhe('')

            const [
                { data: cidadesData, error: errCidades },
                { data: planosData, error: errPlanos },
                { data: portesData, error: errPortes },
                { data: categoriasData, error: errCategorias },
            ] = await Promise.all([
                supabase.from('cidades').select('id, nome, regiao_id').order('nome', { ascending: true }),
                supabase.from('planos').select('id, nome').order('id', { ascending: true }),
                supabase.from('portes').select('id, nome').order('id', { ascending: true }),
                supabase
                    .from('categorias')
                    .select('id, nome')
                    .gte('id', 3)
                    .lte('id', 25)
                    .order('id', { ascending: true }),
            ])

            if (errCidades || errPlanos || errPortes || errCategorias) {
                const detalhes = [errCidades?.message, errPlanos?.message, errPortes?.message, errCategorias?.message]
                    .filter(Boolean)
                    .join(' | ')
                setErroDetalhe(`Erro ao carregar filtros: ${detalhes}`)
                return
            }

            const cidadesLista = cidadesData || []
            const planosLista = planosData || []
            const portesLista = portesData || []

            setCidades(cidadesLista)
            setPlanos(planosLista)
            setPortes(portesLista)
            setCategorias(categoriasData || [])

            if (cidadesLista.length > 0) {
                setCidadeId(String(cidadesLista[0].id))
            }
            if (planosLista.length > 0) {
                setPlanoId(String(planosLista[0].id))
            }
            if (portesLista.length > 0) {
                setPorteSelecionado(String(portesLista[0].id))
            }
        } catch (error) {
            setErroDetalhe(`Falha inesperada ao carregar filtros: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    /**
     * Busca dados de planos_cidade e repasses conforme filtros,
     * cruza por procedimento e calcula custo (porte selecionado - diferenca).
     */
    const buscarLinhasTabela = async () => {
        if (!cidadeId || !planoId || portes.length === 0) return
        try {
            setLoading(true)
            setErroDetalhe('')

            const cidadeSelecionada = cidades.find((cidade) => String(cidade.id) === String(cidadeId))
            if (!cidadeSelecionada) {
                setErroDetalhe('Cidade selecionada não encontrada na lista.')
                return
            }

            const regiaoId = cidadeSelecionada.regiao_id

            const [{ data: planosCidade, error: errPlanosCidade }, { data: repasses, error: errRepasses }] =
                await Promise.all([
                    supabase
                        .from('planos_cidade')
                        .select('id, procedimento_cod, diferenca')
                        .eq('regiao_id', regiaoId)
                        .eq('plano_id', planoId),
                    supabase
                        .from('repasses')
                        .select('id, procedimento_id, porte_id, valor')
                        .eq('cidade_id', cidadeId),
                ])

            if (errPlanosCidade || errRepasses) {
                const detalhes = [errPlanosCidade?.message, errRepasses?.message].filter(Boolean).join(' | ')
                setErroDetalhe(`Erro ao buscar tabela principal: ${detalhes}`)
                return
            }

            const porteIdP = obterPorteIdPorLetra('P')
            const porteIdM = obterPorteIdPorLetra('M')
            const porteIdG = obterPorteIdPorLetra('G')

            const mapaRepassesPorProcedimento = new Map()
            ;(repasses || []).forEach((item) => {
                const procId = String(item.procedimento_id)
                const porteId = String(item.porte_id)
                const valor = Number(item.valor || 0)

                if (!mapaRepassesPorProcedimento.has(procId)) {
                    mapaRepassesPorProcedimento.set(procId, {})
                }
                mapaRepassesPorProcedimento.get(procId)[porteId] = {
                    repasseId: item.id,
                    valor,
                }
            })

            const codigosProcedimento = [...new Set((planosCidade || []).map((item) => String(item.procedimento_cod)))]
            const { data: procedimentosData, error: errProcedimentos } = await supabase
                .from('procedimentos')
                .select('codigo, nome, categoria_id')
                .in('codigo', codigosProcedimento)

            if (errProcedimentos) {
                setErroDetalhe(`Erro ao carregar nomes de procedimentos: ${errProcedimentos.message}`)
                return
            }

            const mapaProcedimentos = new Map(
                (procedimentosData || []).map((item) => [
                    String(item.codigo),
                    { nome: String(item.nome), categoriaId: item.categoria_id },
                ])
            )

            const linhasMontadas = (planosCidade || []).map((item) => {
                const procId = String(item.procedimento_cod)
                const valoresPorPorte = mapaRepassesPorProcedimento.get(procId) || {}
                const diferenca = Number(item.diferenca || 0)

                const valorP = porteIdP ? Number(valoresPorPorte[porteIdP]?.valor || 0) : 0
                const valorM = porteIdM ? Number(valoresPorPorte[porteIdM]?.valor || 0) : 0
                const valorG = porteIdG ? Number(valoresPorPorte[porteIdG]?.valor || 0) : 0
                const valorPorteSelecionado = Number(valoresPorPorte[String(porteSelecionado)]?.valor || 0)

                return {
                    planoCidadeId: item.id,
                    codigo: procId,
                    procedimento: mapaProcedimentos.get(procId)?.nome || procId,
                    categoriaId: mapaProcedimentos.get(procId)?.categoriaId || null,
                    parceiro: mapaProcedimentos.get(procId)?.parceiro || '',
                    porteP: valorP,
                    porteM: valorM,
                    porteG: valorG,
                    repasseIdP: porteIdP ? valoresPorPorte[porteIdP]?.repasseId || null : null,
                    repasseIdM: porteIdM ? valoresPorPorte[porteIdM]?.repasseId || null : null,
                    repasseIdG: porteIdG ? valoresPorPorte[porteIdG]?.repasseId || null : null,
                    porteIdP,
                    porteIdM,
                    porteIdG,
                    diferenca,
                    custo: valorPorteSelecionado - diferenca,
                }
            })

            setLinhas(linhasMontadas)
        } catch (error) {
            setErroDetalhe(`Falha inesperada ao buscar tabela principal: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    /**
     * Filtra localmente por texto para facilitar busca por código/procedimento/parceiro.
     */
    const linhasFiltradas = useMemo(() => {
        const termo = termoBusca.trim().toLowerCase()
        if (!termo) return linhas

        return linhas.filter((linha) => {
            const codigo = String(linha.codigo || '').toLowerCase()
            const procedimento = String(linha.procedimento || '').toLowerCase()
            const parceiro = String(linha.parceiro || '').toLowerCase()
            return codigo.includes(termo) || procedimento.includes(termo) || parceiro.includes(termo)
        })
    }, [linhas, termoBusca])

    /**
     * Retorna um valor textual para input de edição do repasse.
     */
    const obterValorInputRepasse = (linha, campo, categoriaId) => {
        const chave = `${categoriaId}-${linha.codigo}-${campo}`
        if (Object.prototype.hasOwnProperty.call(edicoesLocais, chave)) {
            return edicoesLocais[chave]
        }
        return String(Number(linha[campo] || 0).toFixed(2))
    }

    /**
     * Atualiza o cache local do input enquanto o usuário digita.
     */
    const atualizarEdicaoLocal = (linha, campo, categoriaId, valor) => {
        const chave = `${categoriaId}-${linha.codigo}-${campo}`
        setEdicoesLocais((anterior) => ({
            ...anterior,
            [chave]: valor,
        }))
    }

    /**
     * Converte texto de entrada (pt-BR/en-US) em número válido.
     */
    const normalizarNumeroEntrada = (valorTexto) => {
        const texto = String(valorTexto || '').trim().replace(/\s/g, '')
        if (!texto) return NaN

        const temPonto = texto.includes('.')
        const temVirgula = texto.includes(',')
        if (temPonto && temVirgula) {
            return Number(texto.replace(/\./g, '').replace(',', '.'))
        }

        if (temVirgula) {
            return Number(texto.replace(',', '.'))
        }

        return Number(texto)
    }

    /**
     * Persiste no banco o valor de repasse para cidade/porte/procedimento e atualiza estado local.
     */
    const salvarRepasseValor = async (linha, campo, valorNumerico) => {
        const metaPorCampo = {
            porteP: { repasseId: linha.repasseIdP, porteId: linha.porteIdP },
            porteM: { repasseId: linha.repasseIdM, porteId: linha.porteIdM },
            porteG: { repasseId: linha.repasseIdG, porteId: linha.porteIdG },
        }
        const meta = metaPorCampo[campo]
        if (!meta?.porteId) {
            setErroDetalhe('Porte não identificado para salvar repasse.')
            return
        }

        let erroPersistencia = null
        let novoRepasseId = meta.repasseId

        if (meta.repasseId) {
            const { error } = await supabase
                .from('repasses')
                .update({ valor: valorNumerico })
                .eq('id', meta.repasseId)
            erroPersistencia = error
        } else {
            const { data, error } = await supabase
                .from('repasses')
                .upsert(
                    {
                        procedimento_id: linha.codigo,
                        cidade_id: Number(cidadeId),
                        porte_id: Number(meta.porteId),
                        valor: valorNumerico,
                    },
                    {
                        onConflict: 'procedimento_id,cidade_id,porte_id',
                    }
                )
                .select('id')
                .single()
            erroPersistencia = error
            novoRepasseId = data?.id || null
        }

        if (erroPersistencia) {
            setErroDetalhe(`Erro ao salvar repasse: ${erroPersistencia.message}`)
            return false
        }

        setLinhas((anteriores) =>
            anteriores.map((item) => {
                if (item.codigo !== linha.codigo) return item

                const atualizado = {
                    ...item,
                    [campo]: valorNumerico,
                    ...(campo === 'porteP' ? { repasseIdP: novoRepasseId } : {}),
                    ...(campo === 'porteM' ? { repasseIdM: novoRepasseId } : {}),
                    ...(campo === 'porteG' ? { repasseIdG: novoRepasseId } : {}),
                }

                const valorSelecionado =
                    String(porteSelecionado) === String(item.porteIdP)
                        ? atualizado.porteP
                        : String(porteSelecionado) === String(item.porteIdM)
                            ? atualizado.porteM
                            : String(porteSelecionado) === String(item.porteIdG)
                                ? atualizado.porteG
                                : 0

                atualizado.custo = Number(valorSelecionado || 0) - Number(atualizado.diferenca || 0)
                return atualizado
            })
        )

        return true
    }

    /**
     * Persiste no banco o valor de repasse editado para a cidade/porte/procedimento.
     */
    const salvarRepasseEditado = async (linha, campo, categoriaId) => {
        const chave = `${categoriaId}-${linha.codigo}-${campo}`
        const bruto = edicoesLocais[chave]
        if (bruto === undefined) return

        const valorNumerico = normalizarNumeroEntrada(bruto)
        if (Number.isNaN(valorNumerico)) {
            setErroDetalhe('Valor inválido para repasse.')
            return
        }

        const salvou = await salvarRepasseValor(linha, campo, valorNumerico)
        if (!salvou) return

        setEdicoesLocais((anterior) => {
            const copia = { ...anterior }
            delete copia[chave]
            return copia
        })
    }

    /**
     * Resolve o ID de planos_cidade para o procedimento/plano/região atuais quando não vier no estado.
     */
    const resolverPlanoCidadeId = async (linha) => {
        const cidadeSelecionada = cidades.find((cidade) => String(cidade.id) === String(cidadeId))
        if (!cidadeSelecionada?.regiao_id) return null

        const { data, error } = await supabase
            .from('planos_cidade')
            .select('id')
            .eq('regiao_id', cidadeSelecionada.regiao_id)
            .eq('plano_id', planoId)
            .eq('procedimento_cod', linha.codigo)
            .maybeSingle()

        if (error) {
            setErroDetalhe(`Erro ao localizar registro de diferença: ${error.message}`)
            return null
        }

        return data?.id ?? null
    }

    /**
     * Persiste no banco o valor de diferença e atualiza estado local.
     */
    const salvarDiferencaValor = async (linha, valorNumerico) => {
        const planoCidadeId = linha.planoCidadeId ?? await resolverPlanoCidadeId(linha)
        if (planoCidadeId == null) {
            setErroDetalhe('Registro de plano/cidade não identificado para editar diferença.')
            return false
        }

        const { error } = await supabase
            .from('planos_cidade')
            .update({ diferenca: valorNumerico })
            .eq('id', planoCidadeId)

        if (error) {
            setErroDetalhe(`Erro ao salvar diferença: ${error.message}`)
            return false
        }

        setLinhas((anteriores) =>
            anteriores.map((item) => {
                if (item.codigo !== linha.codigo) return item

                const atualizado = {
                    ...item,
                    planoCidadeId,
                    diferenca: valorNumerico,
                }
                atualizado.custo = Number(
                    String(porteSelecionado) === String(item.porteIdP)
                        ? atualizado.porteP
                        : String(porteSelecionado) === String(item.porteIdM)
                            ? atualizado.porteM
                            : String(porteSelecionado) === String(item.porteIdG)
                                ? atualizado.porteG
                                : 0
                ) - Number(valorNumerico || 0)

                return atualizado
            })
        )

        return true
    }

    /**
     * Persiste no banco o valor de diferença do plano para o procedimento da região/cidade selecionada.
     */
    const salvarDiferencaEditada = async (linha, categoriaId) => {
        const chave = `${categoriaId}-${linha.codigo}-diferenca`
        const bruto = edicoesLocais[chave]
        if (bruto === undefined) return

        const valorNumerico = normalizarNumeroEntrada(bruto)
        if (Number.isNaN(valorNumerico)) {
            setErroDetalhe('Valor inválido para diferença.')
            return
        }

        const salvou = await salvarDiferencaValor(linha, valorNumerico)
        if (!salvou) return

        setEdicoesLocais((anterior) => {
            const copia = { ...anterior }
            delete copia[chave]
            return copia
        })
    }

    /**
     * Aplica colagem de grade (horizontal e vertical) iniciando na célula selecionada.
     */
    const processarColagemRepasse = async (event, secao, linhaIndexInicial, campoInicial) => {
        event.preventDefault()

        const texto = event.clipboardData?.getData('text') || ''
        const linhasColadas = texto
            .replace(/\r/g, '')
            .split('\n')
            .filter((linha) => linha.length > 0)
            .map((linha) => linha.split('\t'))

        if (linhasColadas.length === 0) return

        const camposPorte = ['porteP', 'porteM', 'porteG']
        const colunaInicial = camposPorte.indexOf(campoInicial)
        if (colunaInicial < 0) return

        for (let i = 0; i < linhasColadas.length; i += 1) {
            const linhaTabela = secao.linhas[linhaIndexInicial + i]
            if (!linhaTabela) break

            const colunas = linhasColadas[i]
            for (let j = 0; j < colunas.length; j += 1) {
                const colunaDestino = colunaInicial + j
                if (colunaDestino > 2) break

                const campoDestino = camposPorte[colunaDestino]
                const valorBruto = String(colunas[j] || '').trim()
                if (!valorBruto) continue

                const valorNumerico = normalizarNumeroEntrada(valorBruto)
                if (Number.isNaN(valorNumerico)) {
                    setErroDetalhe(`Valor inválido na colagem: "${valorBruto}"`)
                    continue
                }

                // Persistência imediata célula a célula.
                // await em sequência evita corrida de estado/atualização.
                await salvarRepasseValor(linhaTabela, campoDestino, valorNumerico)
            }
        }
    }

    /**
     * Aplica colagem vertical na coluna de diferença (uma célula por linha).
     */
    const processarColagemDiferenca = async (event, secao, linhaIndexInicial) => {
        event.preventDefault()

        const texto = event.clipboardData?.getData('text') || ''
        const linhasColadas = texto
            .replace(/\r/g, '')
            .split('\n')
            .filter((linha) => linha.length > 0)

        if (linhasColadas.length === 0) return

        for (let i = 0; i < linhasColadas.length; i += 1) {
            const linhaTabela = secao.linhas[linhaIndexInicial + i]
            if (!linhaTabela) break

            const primeiraColuna = String(linhasColadas[i].split('\t')[0] || '').trim()
            if (!primeiraColuna) continue

            const valorNumerico = normalizarNumeroEntrada(primeiraColuna)
            if (Number.isNaN(valorNumerico)) {
                setErroDetalhe(`Valor inválido na colagem de diferença: "${primeiraColuna}"`)
                continue
            }

            await salvarDiferencaValor(linhaTabela, valorNumerico)
        }
    }

    /**
     * Alterna a ordenacao de uma categoria especifica ao clicar no header.
     */
    const handleOrdenarCategoria = (categoriaId, coluna) => {
        setOrdenacaoPorCategoria((anterior) => {
            const atual = anterior[categoriaId] || { coluna: 'codigo', direcao: 'asc' }
            const proxima =
                atual.coluna === coluna
                    ? {
                        coluna,
                        direcao: atual.direcao === 'asc' ? 'desc' : 'asc',
                    }
                    : { coluna, direcao: 'asc' }

            return {
                ...anterior,
                [categoriaId]: proxima,
            }
        })
    }

    /**
     * Retorna o indicador visual da ordenacao atual para uma coluna em uma categoria.
     */
    const obterIndicadorOrdenacao = (categoriaId, coluna) => {
        const atual = ordenacaoPorCategoria[categoriaId] || { coluna: 'codigo', direcao: 'asc' }
        if (atual.coluna !== coluna) return ''
        return atual.direcao === 'asc' ? ' ▲' : ' ▼'
    }

    /**
     * Ordena um conjunto de linhas com base na configuracao de uma categoria.
     */
    const ordenarLinhas = (linhasParaOrdenar, categoriaId) => {
        const resultado = [...linhasParaOrdenar]
        const atual = ordenacaoPorCategoria[categoriaId] || { coluna: 'codigo', direcao: 'asc' }

        resultado.sort((a, b) => {
            const valorA = a[atual.coluna]
            const valorB = b[atual.coluna]
            const fator = atual.direcao === 'asc' ? 1 : -1

            if (typeof valorA === 'number' && typeof valorB === 'number') {
                return (valorA - valorB) * fator
            }

            return String(valorA ?? '')
                .localeCompare(String(valorB ?? ''), 'pt-BR', { sensitivity: 'base' }) * fator
        })

        return resultado
    }

    /**
     * Recupera os nomes selecionados de plano e porte para exibir nos headers.
     */
    const planoSelecionadoNome = useMemo(() => {
        const plano = planos.find((item) => String(item.id) === String(planoId))
        return plano?.nome || 'Plano'
    }, [planos, planoId])

    const porteSelecionadoNome = useMemo(() => {
        const porte = portes.find((item) => String(item.id) === String(porteSelecionado))
        return porte?.nome || 'Porte'
    }, [portes, porteSelecionado])

    /**
     * Agrupa as linhas por categoria seguindo a ordem da tabela categorias (id 3..25).
     */
    const secoesPorCategoria = useMemo(() => {
        return categorias
            .map((categoria) => ({
                categoriaId: categoria.id,
                categoriaNome: categoria.nome,
                linhas: ordenarLinhas(
                    linhasFiltradas.filter((linha) => Number(linha.categoriaId) === Number(categoria.id)),
                    categoria.id
                ),
            }))
            .filter((secao) => secao.linhas.length > 0)
    }, [categorias, linhasFiltradas, ordenacaoPorCategoria])

    /**
     * Retorna classe de tamanho para procedimento longo, reduzindo fonte para caber.
     */
    const obterClasseProcedimento = (texto) => {
        const tamanho = String(texto || '').length
        if (tamanho > 42) return 'table_text_proc table_text_proc_xs'
        if (tamanho > 34) return 'table_text_proc table_text_proc_sm'
        if (tamanho > 26) return 'table_text_proc table_text_proc_md'
        return 'table_text_proc'
    }

    useEffect(() => {
        carregarFiltros()
    }, [])

    useEffect(() => {
        buscarLinhasTabela()
    }, [cidadeId, planoId, porteSelecionado, cidades, portes])

    /**
     * Fecha automaticamente mensagens de aviso/erro após 15 segundos.
     */
    useEffect(() => {
        if (!erroDetalhe) return

        const timer = setTimeout(() => {
            setErroDetalhe('')
        }, 15000)

        return () => clearTimeout(timer)
    }, [erroDetalhe])

    /**
     * Compacta o header de filtros quando a página está rolada.
     */
    useEffect(() => {
        const onScroll = () => {
            setHeaderCompacto(window.scrollY > 40)
        }

        onScroll()
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <div className='supertabelamain'>
            <h1>Supertabela</h1>
                <hr />
            <header className={`supertabelamain_header ${headerCompacto ? 'is-compact' : ''}`}>
                <h2>Filtros</h2>

                <div className='supertabelamain_filters'>
                    <div className='supertabelamain_filters_input'>
                        <p>Busca (Procedimento, Código ou Parceiro)</p>
                        <input
                            className='supertabelamain_filters_input_text'
                            type="text"
                            placeholder='Buscar por procedimento, código ou parceiro'
                            value={termoBusca}
                            onChange={(event) => setTermoBusca(event.target.value)}
                        />
                        <button className='supertabelamain_filters_input_button' type="button">
                            Buscar
                        </button>
                    </div>

                    <div className='supertabelamain_filters_select'>
                        <p>Cidade</p>
                        <select
                            className='supertabelamain_filters_select_select'
                            name="cidade"
                            id="cidade"
                            value={cidadeId}
                            onChange={(event) => setCidadeId(event.target.value)}
                        >
                            {cidades.map((cidade) => (
                                <option key={cidade.id} value={cidade.id}>
                                    {cidade.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className='supertabelamain_filters_select'>
                        <p>Plano</p>
                        <select
                            className='supertabelamain_filters_select_select'
                            name="plano"
                            id="plano"
                            value={planoId}
                            onChange={(event) => setPlanoId(event.target.value)}
                        >
                            {planos.map((plano) => (
                                <option key={plano.id} value={plano.id}>
                                    {plano.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className='supertabelamain_filters_select'>
                        <p>Tamanho</p>
                        <select
                            className='supertabelamain_filters_select_select'
                            name="porte"
                            id="porte"
                            value={porteSelecionado}
                            onChange={(event) => setPorteSelecionado(event.target.value)}
                        >
                            {portes.map((porte) => (
                                <option key={porte.id} value={porte.id}>
                                    {porte.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className='supertabelamain_filters_select'>
                        <p>Edição</p>
                        <label className='supertabelamain_filters_checkbox_wrap'>
                            <input
                                type="checkbox"
                                checked={edicaoAtiva}
                                onChange={(event) => setEdicaoAtiva(event.target.checked)}
                            />
                            <span>Ativar edição</span>
                        </label>
                    </div>
                </div>
            </header>

            {erroDetalhe && (
                <div className='supertabelamain_alert' role='alert' aria-live='assertive'>
                    <div className='supertabelamain_alert_text'>
                        <strong>Aviso</strong>
                        <span>{erroDetalhe}</span>
                    </div>
                    <button
                        type='button'
                        className='supertabelamain_alert_close'
                        onClick={() => setErroDetalhe('')}
                        aria-label='Fechar aviso'
                    >
                        x
                    </button>
                </div>
            )}

            <div className='table_container'>
                {secoesPorCategoria.length === 0 ? (
                    <p>Nenhum registro encontrado para os filtros selecionados.</p>
                ) : (
                    secoesPorCategoria.map((secao) => (
                        <section className='categoria_secao' key={secao.categoriaId}>
                            <h2 className='categoria_titulo'>{secao.categoriaNome}</h2>
                            <table className='table_main'>
                                <colgroup>
                                    <col style={{ width: '12%' }} />
                                    <col style={{ width: '34%' }} />
                                    <col style={{ width: '10.8%' }} />
                                    <col style={{ width: '10.8%' }} />
                                    <col style={{ width: '10.8%' }} />
                                    <col style={{ width: '10.8%' }} />
                                    <col style={{ width: '10.8%' }} />
                                </colgroup>
                                <thead>
                                    <tr>
                                        <th className='table_header' onClick={() => handleOrdenarCategoria(secao.categoriaId, 'codigo')}>Código{obterIndicadorOrdenacao(secao.categoriaId, 'codigo')}</th>
                                        <th className='table_header' onClick={() => handleOrdenarCategoria(secao.categoriaId, 'procedimento')}>Procedimento{obterIndicadorOrdenacao(secao.categoriaId, 'procedimento')}</th>
                                        <th className='table_header' onClick={() => handleOrdenarCategoria(secao.categoriaId, 'porteP')}>Porte P{obterIndicadorOrdenacao(secao.categoriaId, 'porteP')}</th>
                                        <th className='table_header' onClick={() => handleOrdenarCategoria(secao.categoriaId, 'porteM')}>Porte M{obterIndicadorOrdenacao(secao.categoriaId, 'porteM')}</th>
                                        <th className='table_header' onClick={() => handleOrdenarCategoria(secao.categoriaId, 'porteG')}>Porte G{obterIndicadorOrdenacao(secao.categoriaId, 'porteG')}</th>
                                        <th className='table_header' onClick={() => handleOrdenarCategoria(secao.categoriaId, 'diferenca')}>Diferença {planoSelecionadoNome}{obterIndicadorOrdenacao(secao.categoriaId, 'diferenca')}</th>
                                        <th className='table_header' onClick={() => handleOrdenarCategoria(secao.categoriaId, 'custo')}>Custo {porteSelecionadoNome}{obterIndicadorOrdenacao(secao.categoriaId, 'custo')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {secao.linhas.map((linha, linhaIndex) => (
                                        <tr key={`${secao.categoriaId}-${linha.codigo}`}>
                                            <td className='table_text_left'>{linha.codigo}</td>
                                            <td className={`table_text_left ${obterClasseProcedimento(linha.procedimento)}`}>{linha.procedimento}</td>
                                            <td>
                                                {edicaoAtiva ? (
                                                    <input
                                                        className='table_cell_input'
                                                        type="number"
                                                        step="0.01"
                                                        value={obterValorInputRepasse(linha, 'porteP', secao.categoriaId)}
                                                        onChange={(event) => atualizarEdicaoLocal(linha, 'porteP', secao.categoriaId, event.target.value)}
                                                        onBlur={() => salvarRepasseEditado(linha, 'porteP', secao.categoriaId)}
                                                        onPaste={(event) => processarColagemRepasse(event, secao, linhaIndex, 'porteP')}
                                                    />
                                                ) : (
                                                    formatarMoeda(linha.porteP)
                                                )}
                                            </td>
                                            <td>
                                                {edicaoAtiva ? (
                                                    <input
                                                        className='table_cell_input'
                                                        type="number"
                                                        step="0.01"
                                                        value={obterValorInputRepasse(linha, 'porteM', secao.categoriaId)}
                                                        onChange={(event) => atualizarEdicaoLocal(linha, 'porteM', secao.categoriaId, event.target.value)}
                                                        onBlur={() => salvarRepasseEditado(linha, 'porteM', secao.categoriaId)}
                                                        onPaste={(event) => processarColagemRepasse(event, secao, linhaIndex, 'porteM')}
                                                    />
                                                ) : (
                                                    formatarMoeda(linha.porteM)
                                                )}
                                            </td>
                                            <td>
                                                {edicaoAtiva ? (
                                                    <input
                                                        className='table_cell_input'
                                                        type="number"
                                                        step="0.01"
                                                        value={obterValorInputRepasse(linha, 'porteG', secao.categoriaId)}
                                                        onChange={(event) => atualizarEdicaoLocal(linha, 'porteG', secao.categoriaId, event.target.value)}
                                                        onBlur={() => salvarRepasseEditado(linha, 'porteG', secao.categoriaId)}
                                                        onPaste={(event) => processarColagemRepasse(event, secao, linhaIndex, 'porteG')}
                                                    />
                                                ) : (
                                                    formatarMoeda(linha.porteG)
                                                )}
                                            </td>
                                            <td>
                                                {edicaoAtiva ? (
                                                    <input
                                                        className='table_cell_input'
                                                        type="number"
                                                        step="0.01"
                                                        value={obterValorInputRepasse(linha, 'diferenca', secao.categoriaId)}
                                                        onChange={(event) => atualizarEdicaoLocal(linha, 'diferenca', secao.categoriaId, event.target.value)}
                                                        onBlur={() => salvarDiferencaEditada(linha, secao.categoriaId)}
                                                        onPaste={(event) => processarColagemDiferenca(event, secao, linhaIndex)}
                                                    />
                                                ) : (
                                                    formatarMoeda(linha.diferenca)
                                                )}
                                            </td>
                                            <td className={linha.custo < 0 ? 'table_custo_negativo' : ''}>{formatarMoeda(linha.custo)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>
                    ))
                )}
            </div>
        </div>
    )
}

export default Supertabelamain