import React from 'react'
import "./Login.css"

const Login = () => {
    return (
        <div className='login'>
            <div className='login_container'>
                <h1 className='login_title'>Emerdog Super Tool</h1>
                <h4 className='login_subtitle'>Para credenciamento</h4>
                <p className='login_subtitle'>Faça login para continuar</p>
                <form className='login_form'>
                    <input className='login_input' type="email" placeholder="Email" />
                    <input className='login_input' type="password" placeholder="Senha" />
                    <button className='login_button' type="submit">Login</button>
                </form>
            </div>
        </div>
    )
}
export default Login;