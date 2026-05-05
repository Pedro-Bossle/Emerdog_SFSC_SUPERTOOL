import React, { useEffect, useState } from 'react'
import './Credenciamento_doc.css'

const Credenciamento_doc = () => {
    const [isHoveringIframe, setIsHoveringIframe] = useState(false)
    const planilhaId = '1LIKUGWPx6Dd5mjYhDIcdOHWikYDIKEyW9hxA_vHif4s'
    const planilhaPreviewUrl = `https://docs.google.com/spreadsheets/d/${planilhaId}/preview`
    const planilhaEditUrl = `https://docs.google.com/spreadsheets/d/${planilhaId}/edit`

    useEffect(() => {
        if (!isHoveringIframe) return undefined

        const previousOverflow = document.body.style.overflow
        const previousPaddingRight = document.body.style.paddingRight
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

        document.body.style.overflow = 'hidden'
        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = `${scrollbarWidth}px`
        }

        return () => {
            document.body.style.overflow = previousOverflow
            document.body.style.paddingRight = previousPaddingRight
        }
    }, [isHoveringIframe])

    return (
        <div className='documentation'>
            <h1>Credenciamento</h1>
            <div>
                <h2>Por que Existe?</h2>
                <p>Criada para facilitar o rastreio de processos do setor de credenciamento assim como auxiliar na criação de uma rotina e criação de redes credenciadas.</p>
                <h2>Como Funciona?</h2>
                <p>A credenciamento é uma ferramenta que permite você rastrear aonde parou com cada veterinário que conversa, seja se falta colocar no Site ou PDF, seja se falta ele enviar o "De acordo" para assinar o contrato.</p>
            </div>

            <h2>A Tabela de Processos Original</h2>
            <div
                className="documentation_iframe_wrapper"
                onMouseEnter={() => setIsHoveringIframe(true)}
                onMouseLeave={() => setIsHoveringIframe(false)}
            >
                <iframe
                    className="documentation_iframe"
                    src={planilhaPreviewUrl}
                    title="Super Tabela"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                />
            </div>
            <p>
                Se a pré-visualização não carregar no site, abra a planilha em uma nova aba:{' '}
                <a href={planilhaEditUrl} target="_blank" rel="noreferrer">
                    Abrir no Google Sheets
                </a>
            </p>
        </div>

    )
}

export default Credenciamento_doc




