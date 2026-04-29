import React from 'react'
import './Supertabelamain.css'
const Supertabelamain = () => {
    return (
        <div className='supertabelamain'>

            <h1>Supertabela</h1>
            <hr />
            <h2>Filtros</h2>
            <div className='supertabelamain_filters'>
                <div className='supertabelamain_filters_input'>
                    <p>Veterinário</p>
                    <input className='supertabelamain_filters_input_text' type="text" placeholder='Buscar veterinário' />
                    <button className='supertabelamain_filters_input_button'>Buscar</button>
                </div>
                <div className='supertabelamain_filters_select'>
                    <p>Cidade</p>
                    <select className='supertabelamain_filters_select_select' name="filtro" id="filtro">
                        <option value="1">Caxias do Sul</option>
                        <option value="2">Porto Alegre</option>
                        <option value="3">Curitiba</option>
                    </select>
                </div>
                <div className='supertabelamain_filters_select'>
                    <p>Plano</p>
                    <select className='supertabelamain_filters_select_select' name="filtro" id="filtro">
                        <option value="1">Básico</option>
                        <option value="2">Clássico</option>
                        <option value="3">Avançado</option>
                        <option value="4">Ultra</option>
                    </select>
                </div>
                <div className='supertabelamain_filters_select'>
                    <p>Tamanho</p>
                    <select className='supertabelamain_filters_select_select' name="filtro" id="filtro">
                        <option value="1">P</option>
                        <option value="2">M</option>
                        <option value="3">G</option>
                    </select>
                </div>
            </div>

            <hr />
            <div className='table_container'>
                <table className='table_main'>
                    <thead>
                        <tr>
                            <th>Prcocedimento</th>
                            <th>Porte P</th>
                            <th>Porte M</th>
                            <th>Porte G</th>
                            <th>Diferença</th>
                            <th>Custo</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Veterinário 1</td>
                            <td>Cidade 1</td>
                            <td>Plano 1</td>
                            <td>Tamanho 1</td>
                        </tr>
                    </tbody>
                </table>
            </div>


        </div>
    )
}

export default Supertabelamain