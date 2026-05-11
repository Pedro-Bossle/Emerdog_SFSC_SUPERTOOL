import React, { useEffect, useMemo, useState } from 'react'
import {
    DEFAULT_INVITED_PERMISSIONS,
    PERMISSOES,
    PERMISSION_KEYS,
    hasPermission,
    normalizarProfileAcesso,
    setStoredAccessProfile,
} from '../../../lib/accessControl'
import { supabase } from '../../../lib/supabase'
import './GerenciamentoAcessos.css'

const permissoesPadraoNovoUsuario = () => ({ ...DEFAULT_INVITED_PERMISSIONS })

const GerenciamentoAcessos = () => {
    const [usuarios, setUsuarios] = useState([])
    const [usuarioSelecionadoId, setUsuarioSelecionadoId] = useState('')
    const [usuarioAtualId, setUsuarioAtualId] = useState('')
    const [loading, setLoading] = useState(false)
    const [mensagem, setMensagem] = useState('')
    const [erro, setErro] = useState('')
    const [busca, setBusca] = useState('')
    const [convite, setConvite] = useState({
        name: '',
        email: '',
        permissions: permissoesPadraoNovoUsuario(),
    })
    const [edicao, setEdicao] = useState(null)

    const usuarioSelecionado = useMemo(
        () => usuarios.find((usuario) => String(usuario.id) === String(usuarioSelecionadoId)) || null,
        [usuarios, usuarioSelecionadoId]
    )

    const usuariosFiltrados = useMemo(() => {
        const termo = String(busca || '').trim().toLowerCase()
        if (!termo) return usuarios
        return usuarios.filter((usuario) => {
            const nome = String(usuario.name || '').toLowerCase()
            const email = String(usuario.email || '').toLowerCase()
            return nome.includes(termo) || email.includes(termo)
        })
    }, [busca, usuarios])

    const chamarAdminUsers = async (payload) => {
        const { data } = await supabase.auth.getSession()
        const token = data?.session?.access_token
        if (!token) throw new Error('Sessão expirada. Faça login novamente.')

        const resp = await fetch('/api/admin-users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                ...payload,
                redirectTo: window.location.origin,
            }),
        })

        const json = await resp.json().catch(() => ({}))
        if (!resp.ok || json?.ok === false) {
            throw new Error(json?.error || 'Falha na operação administrativa.')
        }
        return json
    }

    const mostrarMensagem = (texto) => {
        setErro('')
        setMensagem(texto)
    }

    const mostrarErro = (texto) => {
        setMensagem('')
        setErro(texto)
    }

    const carregarUsuarios = async () => {
        setLoading(true)
        try {
            const { data: userData } = await supabase.auth.getUser()
            setUsuarioAtualId(userData?.user?.id || '')

            const json = await chamarAdminUsers({ action: 'list' })
            const lista = (json.profiles || []).map((profile) => normalizarProfileAcesso(profile))
            setUsuarios(lista)
            setUsuarioSelecionadoId((prev) => prev || lista[0]?.id || '')
        } catch (error) {
            mostrarErro(error.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        carregarUsuarios()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (!usuarioSelecionado) {
            setEdicao(null)
            return
        }
        setEdicao({
            id: usuarioSelecionado.id,
            name: usuarioSelecionado.name || '',
            email: usuarioSelecionado.email || '',
            permissions: { ...usuarioSelecionado.permissions },
        })
    }, [usuarioSelecionado])

    const alterarPermissaoConvite = (chave) => {
        setConvite((atual) => ({
            ...atual,
            permissions: {
                ...atual.permissions,
                [chave]: !atual.permissions[chave],
            },
        }))
    }

    const alterarPermissaoEdicao = (chave) => {
        setEdicao((atual) => {
            if (!atual) return atual
            if (String(atual.id) === String(usuarioAtualId) && chave === PERMISSION_KEYS.ACCESS_MANAGE) {
                return atual
            }
            return {
                ...atual,
                permissions: {
                    ...atual.permissions,
                    [chave]: !atual.permissions[chave],
                },
            }
        })
    }

    const convidarUsuario = async (event) => {
        event.preventDefault()
        setLoading(true)
        try {
            const json = await chamarAdminUsers({
                action: 'invite',
                name: convite.name,
                email: convite.email,
                permissions: convite.permissions,
            })
            const profile = normalizarProfileAcesso(json.profile)
            setUsuarios((atuais) => {
                const semDuplicado = atuais.filter((item) => String(item.id) !== String(profile.id))
                return [...semDuplicado, profile].sort((a, b) => String(a.name).localeCompare(String(b.name), 'pt-BR'))
            })
            setUsuarioSelecionadoId(profile.id)
            setConvite({ name: '', email: '', permissions: permissoesPadraoNovoUsuario() })
            mostrarMensagem(json.conviteEnviado ? 'Convite enviado e usuário criado.' : 'Usuário já existia; reset enviado e perfil atualizado.')
        } catch (error) {
            mostrarErro(error.message)
        } finally {
            setLoading(false)
        }
    }

    const salvarUsuario = async () => {
        if (!edicao) return
        setLoading(true)
        try {
            const json = await chamarAdminUsers({
                action: 'updateProfile',
                userId: edicao.id,
                name: edicao.name,
                email: edicao.email,
                permissions: edicao.permissions,
            })
            const profile = normalizarProfileAcesso(json.profile)
            setUsuarios((atuais) => atuais.map((item) => (String(item.id) === String(profile.id) ? profile : item)))
            if (String(profile.id) === String(usuarioAtualId)) setStoredAccessProfile(profile)
            mostrarMensagem('Perfil e permissões salvos.')
        } catch (error) {
            mostrarErro(error.message)
        } finally {
            setLoading(false)
        }
    }

    const reenviarAcesso = async () => {
        if (!edicao?.email) {
            mostrarErro('Este perfil não possui email salvo.')
            return
        }
        setLoading(true)
        try {
            await chamarAdminUsers({ action: 'reset', email: edicao.email })
            mostrarMensagem('Email de redefinição enviado.')
        } catch (error) {
            mostrarErro(error.message)
        } finally {
            setLoading(false)
        }
    }

    const renderPermissoes = (permissions, onToggle, prefixo, usuarioId = '') => (
        <div className='gerenciamento_acessos_permissoes'>
            {PERMISSOES.map((grupo) => (
                <section key={`${prefixo}-${grupo.grupo}`} className='gerenciamento_acessos_permissao_grupo'>
                    <h4>{grupo.grupo}</h4>
                    {grupo.itens.map((permissao) => {
                        const bloqueiaSelfAdmin =
                            String(usuarioId) === String(usuarioAtualId) &&
                            permissao.chave === PERMISSION_KEYS.ACCESS_MANAGE
                        return (
                            <label key={`${prefixo}-${permissao.chave}`} className='gerenciamento_acessos_permissao_item'>
                                <input
                                    type='checkbox'
                                    checked={hasPermission(permissions, permissao.chave)}
                                    disabled={loading || bloqueiaSelfAdmin}
                                    onChange={() => onToggle(permissao.chave)}
                                />
                                <span>
                                    <strong>{permissao.rotulo}</strong>
                                    <small>{permissao.descricao}</small>
                                </span>
                            </label>
                        )
                    })}
                </section>
            ))}
        </div>
    )

    return (
        <main className='gerenciamento_acessos'>
            <header className='gerenciamento_acessos_header'>
                <div>
                    <p className='gerenciamento_acessos_kicker'>Administrativo</p>
                    <h1>Gerenciamento de Acessos</h1>
                    <p>Convide usuários, ajuste nomes de perfil e controle permissões por ferramenta.</p>
                </div>
                <button type='button' onClick={carregarUsuarios} disabled={loading}>
                    Atualizar
                </button>
            </header>

            {(mensagem || erro) && (
                <div className={`gerenciamento_acessos_alerta ${erro ? 'is-error' : 'is-success'}`}>
                    {erro || mensagem}
                </div>
            )}

            <section className='gerenciamento_acessos_grid'>
                <aside className='gerenciamento_acessos_card'>
                    <h2>Novo usuário</h2>
                    <form className='gerenciamento_acessos_form' onSubmit={convidarUsuario}>
                        <label>
                            Nome
                            <input
                                type='text'
                                value={convite.name}
                                onChange={(event) => setConvite((atual) => ({ ...atual, name: event.target.value }))}
                                placeholder='Nome do usuário'
                                disabled={loading}
                            />
                        </label>
                        <label>
                            Email
                            <input
                                type='email'
                                value={convite.email}
                                onChange={(event) => setConvite((atual) => ({ ...atual, email: event.target.value }))}
                                placeholder='usuario@emerdog.com.br'
                                disabled={loading}
                            />
                        </label>
                        {renderPermissoes(convite.permissions, alterarPermissaoConvite, 'convite')}
                        <button type='submit' disabled={loading}>
                            Convidar usuário
                        </button>
                    </form>
                </aside>

                <section className='gerenciamento_acessos_card gerenciamento_acessos_lista_card'>
                    <div className='gerenciamento_acessos_lista_header'>
                        <h2>Usuários</h2>
                        <input
                            type='search'
                            value={busca}
                            onChange={(event) => setBusca(event.target.value)}
                            placeholder='Buscar por nome ou email'
                        />
                    </div>
                    <div className='gerenciamento_acessos_lista'>
                        {usuariosFiltrados.map((usuario) => (
                            <button
                                key={usuario.id}
                                type='button'
                                className={`gerenciamento_acessos_usuario ${String(usuario.id) === String(usuarioSelecionadoId) ? 'is-active' : ''}`}
                                onClick={() => setUsuarioSelecionadoId(usuario.id)}
                            >
                                <strong>{usuario.name || 'Sem nome'}</strong>
                                <span>{usuario.email || usuario.id}</span>
                            </button>
                        ))}
                        {!loading && usuariosFiltrados.length === 0 && (
                            <p className='gerenciamento_acessos_vazio'>Nenhum usuário encontrado.</p>
                        )}
                    </div>
                </section>

                <section className='gerenciamento_acessos_card gerenciamento_acessos_detalhe'>
                    <h2>Permissões do usuário</h2>
                    {!edicao ? (
                        <p className='gerenciamento_acessos_vazio'>Selecione um usuário para editar.</p>
                    ) : (
                        <>
                            <div className='gerenciamento_acessos_form'>
                                <label>
                                    Nome em Profiles
                                    <input
                                        type='text'
                                        value={edicao.name}
                                        onChange={(event) => setEdicao((atual) => ({ ...atual, name: event.target.value }))}
                                        disabled={loading}
                                    />
                                </label>
                                <label>
                                    Email
                                    <input type='email' value={edicao.email || ''} disabled />
                                </label>
                            </div>
                            {renderPermissoes(edicao.permissions, alterarPermissaoEdicao, 'edicao', edicao.id)}
                            <div className='gerenciamento_acessos_acoes'>
                                <button type='button' onClick={reenviarAcesso} disabled={loading || !edicao.email}>
                                    Reenviar acesso
                                </button>
                                <button type='button' className='is-primary' onClick={salvarUsuario} disabled={loading}>
                                    Salvar alterações
                                </button>
                            </div>
                        </>
                    )}
                </section>
            </section>
        </main>
    )
}

export default GerenciamentoAcessos
