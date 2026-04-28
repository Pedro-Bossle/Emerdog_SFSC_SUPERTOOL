import React, { useState } from 'react'
import Sidebar from '../Sidebar/Sidebar'
import { Outlet } from 'react-router-dom'
import './Layout2.css'

const Layout2 = () => {
    const [open, setOpen] = useState(true)

    return (
        <div className="app-shell">
            <Sidebar open={open} setOpen={setOpen} />
            <main className={`content ${open ? 'open' : 'closed'}`}>
                <Outlet />
            </main>
        </div>
    )
}

export default Layout2