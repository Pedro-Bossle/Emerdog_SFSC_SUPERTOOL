import React from 'react'
import "./Header.css"
import logoNav from '../../assets/Emerdog-logo-nav.svg'


import { supabase } from '../../lib/supabase' // ajuste o caminho se necessário
import { Link, useNavigate } from 'react-router-dom'



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
                <img src={logoNav} alt="A" className='logo logo_header' />
                <Link className='header_nav_link' to="/home">Início</Link>
                <Link className='header_nav_link' to="/supertabeladoc">Super-Tabela</Link>
                <a className='header_nav_link' href="#">Credenciamento</a>
                <a className='header_nav_link' href="#">Formulário</a>
                <a className='header_nav_link' href="#">Planos</a>
                <a className='header_nav_link' href="#">Contratos</a>
                <a className='header_nav_link' href="#">Pagamentos</a>
                <a className='header_nav_link' href="#">Emer-Cast</a>
                <button className='logout_button' onClick={handleLogout}>Sair</button>
            </nav>
        </header>
    )
}

export default Header;