import React from 'react'
import "./Header.css"


import { supabase } from '../../lib/supabase' // ajuste o caminho se necessário
import { useNavigate } from 'react-router-dom'



const Header = () => {
    const navigate = useNavigate()
    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) {
            alert('Erro ao sair da sessão')
            return
        }
        navigate('/', { replace: true })
    }





    return (
        <header className='header'>
            <nav className='header_nav'>
                <img src="./src/assets/Emerdog-logo-nav.svg" alt="A" className='logo logo_header' />
                <a className='header_nav_link' href="/Home">Início</a>
                <a className='header_nav_link' href="#">SuperTabela</a>
                <a className='header_nav_link' href="#">Credenciamento</a>
                <a className='header_nav_link' href="#">Formulário</a>
                <a className='header_nav_link' href="#">Planos</a>
                <a className='header_nav_link' href="#">Contratos</a>
                <button className='logout_button' onClick={handleLogout}>Sair</button>

            </nav>
        </header>
    )
}

export default Header;