import path from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { config as dotenvConfig } from 'dotenv'
import {
    DEFAULT_INVITED_PERMISSIONS,
    PERMISSION_KEYS,
    hasPermission,
    normalizarProfileAcesso,
} from '../src/lib/accessControl.js'

dotenvConfig({ path: path.resolve(process.cwd(), '.env.local') })
dotenvConfig()

const getJsonBody = async (req) => {
    if (req.body && typeof req.body === 'object') return req.body
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    if (!chunks.length) return {}
    try {
        return JSON.parse(Buffer.concat(chunks).toString('utf-8'))
    } catch {
        return {}
    }
}

const getHeader = (req, name) => {
    const headers = req.headers || {}
    return headers[name] || headers[name.toLowerCase()] || ''
}

const getSupabaseAdmin = () => {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY para usar o gerenciamento de acessos.')
    }

    return createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false },
    })
}

const responderErro = (res, status, mensagem) =>
    res.status(status).json({ ok: false, error: mensagem })

const buscarProfile = async (supabase, userId) => {
    const selectCompleto = await supabase
        .from('profiles')
        .select('id, name, email, credenciamento_read_only, permissions')
        .eq('id', userId)
        .maybeSingle()

    if (!selectCompleto.error) return selectCompleto

    const mensagem = String(selectCompleto.error.message || '')
    if (!mensagem.includes('email')) return selectCompleto

    const fallback = await supabase
        .from('profiles')
        .select('id, name, credenciamento_read_only, permissions')
        .eq('id', userId)
        .maybeSingle()

    return fallback
}

const listarProfiles = async (supabase) => {
    const selectCompleto = await supabase
        .from('profiles')
        .select('id, name, email, credenciamento_read_only, permissions')
        .order('name', { ascending: true })

    if (!selectCompleto.error) return selectCompleto

    const mensagem = String(selectCompleto.error.message || '')
    if (!mensagem.includes('email')) return selectCompleto

    return supabase
        .from('profiles')
        .select('id, name, credenciamento_read_only, permissions')
        .order('name', { ascending: true })
}

const upsertProfile = async (supabase, payload) => {
    const completo = await supabase.from('profiles').upsert(payload, { onConflict: 'id' }).select().single()
    if (!completo.error) return completo

    const mensagem = String(completo.error.message || '')
    if (!mensagem.includes('email')) return completo

    const semEmail = { ...payload }
    delete semEmail.email
    return supabase.from('profiles').upsert(semEmail, { onConflict: 'id' }).select().single()
}

const encontrarUsuarioPorEmail = async (supabase, email) => {
    const alvo = String(email || '').trim().toLowerCase()
    if (!alvo) return null

    for (let page = 1; page <= 20; page += 1) {
        const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 })
        if (error) throw error

        const encontrado = (data?.users || []).find((user) => String(user.email || '').toLowerCase() === alvo)
        if (encontrado) return encontrado
        if ((data?.users || []).length < 1000) break
    }

    return null
}

const validarAdmin = async (supabase, req) => {
    const authHeader = getHeader(req, 'authorization')
    const token = String(authHeader || '').replace(/^Bearer\s+/i, '').trim()
    if (!token) return { error: 'Sessão ausente.' }

    const { data: userData, error: userError } = await supabase.auth.getUser(token)
    if (userError || !userData?.user?.id) return { error: 'Sessão inválida.' }

    const { data: profileData, error: profileError } = await buscarProfile(supabase, userData.user.id)
    if (profileError || !profileData) return { error: 'Perfil administrador não encontrado.' }

    const profile = normalizarProfileAcesso(profileData)
    if (!hasPermission(profile, PERMISSION_KEYS.ACCESS_MANAGE)) {
        return { error: 'Sem permissão para gerenciar acessos.' }
    }

    return { user: userData.user, profile }
}

export default async function handler(req, res) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8')

    if (req.method !== 'POST') {
        return responderErro(res, 405, 'Método não permitido.')
    }

    try {
        const supabase = getSupabaseAdmin()
        const admin = await validarAdmin(supabase, req)
        if (admin.error) return responderErro(res, 403, admin.error)

        const body = await getJsonBody(req)
        const action = String(body.action || '').trim()

        if (action === 'list') {
            const { data, error } = await listarProfiles(supabase)
            if (error) return responderErro(res, 500, error.message)

            return res.status(200).json({
                ok: true,
                profiles: (data || []).map((profile) => normalizarProfileAcesso(profile)),
            })
        }

        if (action === 'invite') {
            const email = String(body.email || '').trim().toLowerCase()
            const name = String(body.name || '').trim()
            const permissions = body.permissions && typeof body.permissions === 'object'
                ? body.permissions
                : DEFAULT_INVITED_PERMISSIONS

            if (!email || !email.includes('@')) return responderErro(res, 400, 'Informe um email válido.')
            if (!name) return responderErro(res, 400, 'Informe o nome do usuário.')

            let user = await encontrarUsuarioPorEmail(supabase, email)
            let conviteEnviado = false

            if (!user) {
                const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
                    data: { name },
                    redirectTo: body.redirectTo || process.env.SITE_URL || undefined,
                })
                if (error) return responderErro(res, 500, error.message)
                user = data?.user || null
                conviteEnviado = true
            } else {
                await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: body.redirectTo || process.env.SITE_URL || undefined,
                })
            }

            if (!user?.id) return responderErro(res, 500, 'Não foi possível identificar o usuário criado.')

            const { data: profileData, error: profileError } = await upsertProfile(supabase, {
                id: user.id,
                name,
                email,
                permissions,
                credenciamento_read_only: !permissions[PERMISSION_KEYS.CREDENCIAMENTO_EDIT],
            })

            if (profileError) return responderErro(res, 500, profileError.message)

            return res.status(200).json({
                ok: true,
                conviteEnviado,
                profile: normalizarProfileAcesso(profileData),
            })
        }

        if (action === 'updateProfile') {
            const userId = String(body.userId || '').trim()
            const name = String(body.name || '').trim()
            const permissions = body.permissions && typeof body.permissions === 'object' ? body.permissions : null

            if (!userId) return responderErro(res, 400, 'Usuário não informado.')
            if (!name) return responderErro(res, 400, 'Informe o nome do usuário.')
            if (!permissions) return responderErro(res, 400, 'Permissões não informadas.')

            if (userId === admin.user.id && !permissions[PERMISSION_KEYS.ACCESS_MANAGE]) {
                return responderErro(res, 400, 'Você não pode remover a permissão de gerenciar acessos do seu próprio usuário.')
            }

            const { data: atual } = await buscarProfile(supabase, userId)
            const { data: profileData, error } = await upsertProfile(supabase, {
                id: userId,
                name,
                email: atual?.email || body.email || null,
                permissions,
                credenciamento_read_only: !permissions[PERMISSION_KEYS.CREDENCIAMENTO_EDIT],
            })

            if (error) return responderErro(res, 500, error.message)

            return res.status(200).json({
                ok: true,
                profile: normalizarProfileAcesso(profileData),
            })
        }

        if (action === 'reset') {
            const email = String(body.email || '').trim().toLowerCase()
            if (!email || !email.includes('@')) return responderErro(res, 400, 'Email inválido para redefinição.')

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: body.redirectTo || process.env.SITE_URL || undefined,
            })
            if (error) return responderErro(res, 500, error.message)

            return res.status(200).json({ ok: true })
        }

        return responderErro(res, 400, 'Ação inválida.')
    } catch (error) {
        return responderErro(res, 500, error?.message || 'Falha na API de usuários.')
    }
}
