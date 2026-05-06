import { Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase, setReadOnlyFlag } from '../../lib/supabase'

const PrivateRoute = ({ children }) => {
    const [session, setSession] = useState(undefined)

    useEffect(() => {
        const carregarSessaoEPermissoes = async () => {
            const { data } = await supabase.auth.getSession()
            const sessaoAtual = data.session
            setSession(sessaoAtual)
            if (!sessaoAtual?.user?.id) {
                setReadOnlyFlag(false)
                return
            }
            const { data: profileData, error } = await supabase
                .from('profiles')
                .select('credenciamento_read_only')
                .eq('id', sessaoAtual.user.id)
                .single()
            if (error) {
                setReadOnlyFlag(false)
                return
            }
            setReadOnlyFlag(!!profileData?.credenciamento_read_only)
        }
        carregarSessaoEPermissoes()
    }, [])

    if (session === undefined) return <p>Carregando...</p>
    if (!session) return <Navigate to="/login" replace />

    return children
}

export default PrivateRoute