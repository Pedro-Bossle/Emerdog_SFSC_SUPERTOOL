import React from 'react'
import "./Footer.css"
const Footer = () => {
    return (
        <footer>
            <div className='footer_container'>
                <div className='footer_container_left'>
                    <div className='footer_container_left_logo'>
                        <img src="./src/assets/Emerdog-logo-nav.svg" alt="A" className='logo logo_footer' />
                        <p>Sistema Facilitador do Setor de Credenciamentos</p>
                    </div>
                    <a href="https://www.youtube.com/@Emerdog"><img src="./src/assets/youtube-ico.svg" alt="Youtube" className='footer_icon' /></a>
                    <a href="https://wa.me/555499041695"><img src="./src/assets/whatsapp-ico.svg" alt="Whatsapp" className='footer_icon' /></a>
                    <a href="https://www.instagram.com/emerdogplano/"><img src="./src/assets/instagram-ico.svg" alt="Instagram" className='footer_icon' /></a>
                    <a href="https://www.tiktok.com/@emerdog"><img src="./src/assets/tiktok-ico.svg" alt="Tiktok" className='footer_icon' /></a>
                    <a href="https://emerdogplano-my.sharepoint.com/:f:/g/personal/pedro_emerdog_com_br/EhguapSFJdRLnCcY6ECXf5YBpODEspc_AXI_goxAoI3o1g?e=hFYBlm"><img src="./src/assets/cloud-ico.svg" alt="Cloud" className='footer_icon' /></a>

                </div>
                <div className='tutorial_wrapper'>
                    <div className='tutorial_container'>
                        <h3>Tutoriais Internos</h3>
                        <a href="#" className='tutorial_link' ><img src="./src/assets/youtube-ico.svg" alt="Youtube" className='tutorial_icon' />Como usar o SFSC 1</a>
                        <a href="#" className='tutorial_link' ><img src="./src/assets/youtube-ico.svg" alt="Youtube" className='tutorial_icon' />Como usar o SFSC 2</a>
                        <a href="https://youtu.be/Stan3e_LyjM" className='tutorial_link' ><img src="./src/assets/youtube-ico.svg" alt="Youtube" className='tutorial_icon' />Adicionar Clientes e Cobranças</a>
                        <a href="https://www.youtube.com/watch?v=rUNF0hKrO20" className='tutorial_link' ><img src="./src/assets/youtube-ico.svg" alt="Youtube" className='tutorial_icon' />O que é Emerdog?</a>
                    </div>

                    <div className='tutorial_container'>
                        <h3>Tutoriais Veterinários</h3>
                        <a href="https://youtu.be/xOasi7Equ_w" className='tutorial_link' ><img src="./src/assets/youtube-ico.svg" alt="Youtube" className='tutorial_icon' />Como Chamar Volantes</a>
                        <a href="https://youtu.be/Z3bn9i386Zs" className='tutorial_link' ><img src="./src/assets/youtube-ico.svg" alt="Youtube" className='tutorial_icon' />Requisições de Exames (Laboratórios)</a>
                        <a href="https://youtu.be/EPjNRcNBf1U" className='tutorial_link' ><img src="./src/assets/youtube-ico.svg" alt="Youtube" className='tutorial_icon' />Requisições de Exames (Veterinários)</a>
                        <a href="https://youtu.be/7g6EyzJ4Yx0" className='tutorial_link' ><img src="./src/assets/youtube-ico.svg" alt="Youtube" className='tutorial_icon' />Tutorial de Atendimento</a>
                    </div>

                    <div className='tutorial_container'>
                        <h3>Tutoriais Clientes</h3>
                        <a href="https://youtu.be/0q92qBVLaJI" className='tutorial_link' ><img src="./src/assets/youtube-ico.svg" alt="Youtube" className='tutorial_icon' />Como alterar a Forma de pagamento</a>
                        <a href="https://youtu.be/ftwUfQjl_eQ" className='tutorial_link' ><img src="./src/assets/youtube-ico.svg" alt="Youtube" className='tutorial_icon' />Tutorial de Primeiro Acesso</a>
                        <a href="https://youtu.be/tV7-PWHH-CE" className='tutorial_link' ><img src="./src/assets/youtube-ico.svg" alt="Youtube" className='tutorial_icon' />Tour pelo Site</a>
                        <a href="https://youtu.be/VR6N7T-A2R4" className='tutorial_link' ><img src="./src/assets/youtube-ico.svg" alt="Youtube" className='tutorial_icon' />Compra de procedimentos e carência</a>
                        <a href="https://youtu.be/37dha4CtZzU" className='tutorial_link' ><img src="./src/assets/youtube-ico.svg" alt="Youtube" className='tutorial_icon' />Tutorial de Empresas e Colaboradores</a>
                    </div>
                </div>
            </div>

            <p className='copyright'>Feito por <strong><a href="https://www.linkedin.com/in/pedro-bossle-sandi-685625277" target="_blank">Pedro Bossle</a></strong></p>

        </footer >
    )
}

export default Footer;