import React, { useEffect, useState } from 'react'
import './Sidebar.css'
import iconShow from "../../assets/sidepanel-ico-show.png";
import iconHide from "../../assets/sidepanel-ico-hide.png";
import logoBranco from "../../assets/logo_branco.png";
import logoE from "../../assets/logo_E.png";
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

/**
 * Como adicionar novos grupos:
 * 1) Adicione um objeto no array `menuItems` com:
 *    - id: identificador único
 *    - label: texto do item pai
 *    - children: array com os subitens
 *
 * Exemplo:
 * {
 *   id: 'financeiro',
 *   label: 'Financeiro',
 *   children: [
 *     { label: 'Faturas', href: '/financeiro/faturas' },
 *     { label: 'Reembolsos', href: '/financeiro/reembolsos' },
 *   ],
 * }
 */
const menuItems = [
    {
        id: 'inicio',
        label: 'Início',
        children: [
            { label: 'Dashboard', href: '/home' }
        ],
    },
    {
        id: 'supertabela',
        label: 'Super-Tabela',
        children: [
            { label: 'Visão geral', href: '/supertabelamain' },
            { label: 'Cidades', href: '/supertabela/cidades' },
            { label: 'Planos', href: '/supertabela/planos' },
            { label: 'Procedimentos', href: '/supertabela/procedimentos' },
            { label: 'Negociações', href: '/supertabela/negociacoes' },
            { label: 'Documentação', href: '/supertabeladoc' },
        ],
    },
    {
        id: 'credenciamento',
        label: 'Credenciamento',
        children: [
            { label: 'Principal', href: '/credenciamento/principal' },
            { label: 'Documentação', href: '/credenciamentodoc' },

        ],
    },
    {
        id: 'formulario',
        label: 'Formulário',
        children: [
            { label: 'Respostas', href: '/formulario/respostas' },
            { label: 'Editor', href: '/formulario/Editor' },
            { label: 'Preencher', href: '/formulario/preencher' },
            { label: 'Documentação', href: '#' },

        ],
    },
    {
        id: 'planos',
        label: 'Planos',
        children: [
            { label: 'Editor', href: '/editor' },
            { label: 'Publico', href: '/planos/publico' },
            { label: 'Documentação', href: '#' },

        ],
    },
    {
        id: 'contratos',
        label: 'Contratos',
        children: [
            { label: 'Criar', href: '/contratos/Criar' },
            { label: 'Histórico', href: '/contratos/historico' },
            { label: 'Assinar', href: '/contratos/assinar' },
            { label: 'Documentação', href: '#' },

        ],
    },
    {
        id: 'pagamentos',
        label: 'Pagamentos',
        children: [
            { label: 'Cadastrar', href: '/pagamentos/cadastro' },
            { label: 'Todos', href: '/pagamentos/todos' },
            { label: 'Pendências', href: '/pagamentos/pendencias' },
            { label: 'Documentação', href: '#' },

        ],
    },
    {
        id: 'emercast',
        label: 'Emer-Cast',
        children: [
            { label: 'Visualizar', href: '/emercast/visualizar' },
            { label: 'Publico', href: '/emercast/Publico' },
            { label: 'Documentação', href: '#' },

        ],
    },
    {
        id: 'sair',
        label: 'Sair',
        children: [
            { label: 'Redefinir senha', action: 'reset-password' },
            { label: 'Encerrar sessão', href: '/logout' },
        ],
    },
]

const Sidebar = ({ open, onToggleManual, isPinned }) => {
    const navigate = useNavigate()
    const [darkModeAtivo, setDarkModeAtivo] = useState(() => {
        if (typeof window === 'undefined') return false
        return window.localStorage.getItem('sfsc-dark-mode') === '1'
    })
    /**
     * Estado de submenus:
     * { [idDoMenu]: true/false }
     */
    const [openMenus, setOpenMenus] = useState({})

    // Inicializa todos fechados ao montar
    useEffect(() => {
        const initial = {}
        menuItems.forEach((item) => {
            initial[item.id] = false
        })
        setOpenMenus(initial)
    }, [])

    // Se fechar a sidebar, fecha todos os submenus também
    useEffect(() => {
        if (!open) {
            const reset = {}
            menuItems.forEach((item) => {
                reset[item.id] = false
            })
            setOpenMenus(reset)
        }
    }, [open])

    const toggleMenu = (id) => {
        setOpenMenus((prev) => {
            const wasOpen = !!prev[id]
            const next = {}
            menuItems.forEach((item) => {
                next[item.id] = false
            })
            if (!wasOpen) {
                next[id] = true
            }
            return next
        })
    }

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) {
            alert('Erro ao sair da sessão')
            return
        }
        navigate('/', { replace: true })
    }

    const handleResetPassword = async () => {
        const { data: userData, error: userError } = await supabase.auth.getUser()

        if (userError || !userData?.user?.email) {
            alert('Não foi possível identificar o usuário logado')
            return
        }

        const { error } = await supabase.auth.resetPasswordForEmail(userData.user.email, {
            redirectTo: window.location.origin,
        })

        if (error) {
            alert('Erro ao enviar redefinição de senha')
            return
        }

        alert('E-mail de redefinição enviado com sucesso')
    }

    const handleAction = async (child) => {
        if (child.action === 'reset-password') {
            await handleResetPassword()
            return
        }

        if (child.href === '/logout') {
            await handleLogout()
        }
    }

    useEffect(() => {
        if (darkModeAtivo) {
            document.body.classList.add('dark-mode')
            window.localStorage.setItem('sfsc-dark-mode', '1')
        } else {
            document.body.classList.remove('dark-mode')
            window.localStorage.setItem('sfsc-dark-mode', '0')
        }
    }, [darkModeAtivo])

    return (
        <div className='layout'>
            <aside className={`sidebar ${open ? 'open' : 'closed'}`}>
                <div className="sidebar_logo_wrap">
                    <img
                        src={open ? logoBranco : logoE}
                        alt="Emerdog"
                        className='logo logo_sidebar'
                    />
                </div>

                <nav className='sidebar_nav'>
                    {menuItems.map((item) => (
                        <div key={item.id} className="sidebar_group">
                            <button
                                className="sidebar_group_btn"
                                onClick={() => toggleMenu(item.id)}
                            >
                                <span>{item.label}</span>
                                <span>{openMenus[item.id] ? '▾' : '▸'}</span>
                            </button>

                            <div className={`sidebar_submenu ${openMenus[item.id] ? 'open' : ''}`}>
                                {item.children.map((child) => (
                                    child.action || child.href === '/logout' ? (
                                        <button
                                            key={child.action || child.href}
                                            type="button"
                                            className="sidebar_submenu_action"
                                            onClick={() => handleAction(child)}
                                        >
                                            {child.label}
                                        </button>
                                    ) : (
                                        <Link key={child.href} to={child.href}>
                                            {child.label}
                                        </Link>
                                    )
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className='sidebar_footer'>
                    <button onClick={onToggleManual} className="toggle_btn" title={isPinned ? 'Desafixar sidebar' : 'Fixar sidebar'}>
                        <img
                            src={open ? iconHide : iconShow}
                            alt={isPinned ? "Desafixar Sidebar" : "Fixar Sidebar"}
                            className="toggle_icon"
                        />
                        <span className='toggle_text'>{isPinned ? 'Desafixar menu' : 'Fixar menu'}</span>
                    </button>

                    <button
                        type='button'
                        className='sidebar_darkmode_btn'
                        onClick={() => setDarkModeAtivo((anterior) => !anterior)}
                        title={darkModeAtivo ? 'Desativar modo escuro' : 'Ativar modo escuro'}
                    >
                        <span className='sidebar_darkmode_icon'>{darkModeAtivo ? '☀️' : '🌙'}</span>
                        <span className='sidebar_darkmode_text'>
                            {darkModeAtivo ? 'Modo claro' : 'Modo escuro'}
                        </span>
                    </button>
                </div>
            </aside>
        </div>
    )
}

export default Sidebar