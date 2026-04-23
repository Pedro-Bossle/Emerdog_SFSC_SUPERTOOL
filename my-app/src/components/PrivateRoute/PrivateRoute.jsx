import { Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const PrivateRoute = ({ children }) => {
    const [session, setSession] = useState(undefined)

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => setSession(data.session))
    }, [])

    if (session === undefined) return <p>Carregando...</p>
    if (!session) return <Navigate to="/login" replace />

    return children
}

export default PrivateRoute