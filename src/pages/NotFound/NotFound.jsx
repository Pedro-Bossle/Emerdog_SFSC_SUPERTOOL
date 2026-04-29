import React from 'react'
import { Link } from 'react-router-dom'
import './NotFound.css'



const NotFound = () => {
    return (
        <div className='not-found'>

            <div className='nf_card_header'>
                <h1>404 - Página não encontrada</h1>
                <p>A página que você está procurando não existe.</p>
                <p>Mas abaixo segue algumas opções para você:</p>
                <hr />
                <div className='nf_cards_container'>
                    <div className='nf_card'>
                        <h2 className='nf_card_nome'>Super Tabela</h2>
                        <Link className='nf_card_link' to="/supertabelamain">Acessar</Link>
                    </div>
                    <div className='nf_card'>
                        <h2 className='nf_card_nome'>Credenciamento</h2>
                        <Link className='nf_card_link' to="/credenciamento">Acessar</Link>
                    </div>
                    <div className='nf_card'>
                        <h2 className='nf_card_nome'>Formulários</h2>
                        <Link className='nf_card_link' to="/formulario">Acessar</Link>
                    </div>
                    <div className='nf_card'>
                        <h2 className='nf_card_nome'>Planos</h2>
                        <Link className='nf_card_link' to="/planos">Acessar</Link>
                    </div>
                    <div className='nf_card'>
                        <h2 className='nf_card_nome'>Contratos</h2>
                        <Link className='nf_card_link' to="/contratos">Acessar</Link>
                    </div>
                    <div className='nf_card'>
                        <h2 className='nf_card_nome'>Pagamentos</h2>
                        <Link className='nf_card_link' to="/pagamentos">Acessar</Link>
                    </div>
                    <div className='nf_card'>
                        <h2 className='nf_card_nome'>Emer-Cast</h2>
                        <Link className='nf_card_link' to="/emercast">Acessar</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NotFound