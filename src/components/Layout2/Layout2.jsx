import React, { useState } from 'react'
import Sidebar from '../Sidebar/Sidebar'
import { Outlet } from 'react-router-dom'
import './Layout2.css'

const Layout2 = () => {
  const [openManual, setOpenManual] = useState(false) // botão
  const [isHovering, setIsHovering] = useState(false) // mouse

  const open = openManual || isHovering

  const handleToggleManual = () => {
    setOpenManual((prev) => !prev)
  }

  return (
    <div className="app-shell">
      <div
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <Sidebar
          open={open}
          onToggleManual={handleToggleManual}
          isPinned={openManual}
        />
      </div>

      <main className={`content ${open ? 'open' : 'closed'}`}>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout2