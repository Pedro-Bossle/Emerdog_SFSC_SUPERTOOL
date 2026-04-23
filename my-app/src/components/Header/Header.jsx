import React from 'react'
import "./Header.css"

const Header = () => {
    return (
        <header className='header'>
            <nav  className='header_nav'>
                <img src="./src/assets/Emerdog-logo-nav.svg" alt="A" className='logo logo_header' />
                <a className='header_nav_link' href="/Home">Início</a>
                <a className='header_nav_link' href="#">SuperTabela</a>
                <a className='header_nav_link' href="#">Credenciamento</a>
                <a className='header_nav_link' href="#">Formulário</a>
            </nav>
        </header>
    )
}

export default Header;