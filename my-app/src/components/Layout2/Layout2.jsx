import React from 'react'
import Sidebar from '../Sidebar/Sidebar'
import { Outlet } from 'react-router-dom'

const Layout2 = () => {
    return (
        <div>
            <Sidebar />
            <Outlet />
        </div>
    )
}

export default Layout2