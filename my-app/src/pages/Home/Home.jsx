import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import './Home.css'

const Home = () => {
  const [name, setName] = useState('Usuário')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError || !userData?.user) {
        setLoading(false)
        return
      }

      const userId = userData.user.id

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', userId) // normalmente profiles.id = auth.users.id
        .single()

      if (!profileError && profiles?.name) {
        setName(profiles.name)
      }

      setLoading(false)
    }

    loadProfile()
  }, [])

  return (
    <div className='home'>
      <div >
        <h1>Olá {loading ? '...' : name}</h1>
        <p>Bem-vindo ao Sistema Facilitador do Setor de Credenciamentos (SFSC)</p>
      </div>

      <div className='home_cards_container'>
        <div className='home_card'>
          <h2 className='card_nome'>Super Tabela</h2>
          <p className='card_texto'>Gerencie as tabelas de preços dos seus procedimentos e as negociações com os parceiros;</p>
          <a className='card_link' href="#">Conheça essa Ferramenta</a>
        </div>

        <div className='home_card'>
          <h2 className='card_nome'>Credenciamento</h2>
          <p className='card_texto'>Mantenha o processo de credenciamento dos parceiros a um toque de distância;</p>
          <a className='card_link' href="#">Conheça essa Ferramenta</a>
        </div>

        <div className='home_card'>
          <h2 className='card_nome'>Formulário</h2>
          <p className='card_texto'>Cadastre os perfis de veterinários de maneira rápida e fácil com apenas um link individual;</p>
          <a className='card_link' href="#">Conheça essa Ferramenta</a>
        </div>

        <div className='home_card'>
          <h2 className='card_nome'>Planos</h2>
          <p className='card_texto'>Gerencie os planos, visualize as tabelas OnLine e edite-as sem necessidade de abrir o Canva;</p>
          <a className='card_link' href="#">Conheça essa Ferramenta</a>
        </div>

        <div className='home_card'>
          <h2 className='card_nome'>Contratos</h2>
          <p className='card_texto'>Crie contratos de forma rápida e fácil, visualize os existentes e veja o status de cada um sem abrir o Clicksign (API);</p>
          <a className='card_link' href="#">Conheça essa Ferramenta</a>
        </div>

        <div className='home_card'>
          <h2 className='card_nome'>Em breve...</h2>
          <p className='card_texto'>Em breve mais ferramentas serão adicionadas...</p>
        </div>
      </div>
    </div>
  )
}


//pesquisar como integrar o Clicksign (API) na plataforma, se isso funcionar vai ser muito bom pra todo mundo.


export default Home