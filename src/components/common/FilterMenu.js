import React from 'react';
import './FilterMenu.scss'

const filterFunction = () => {

}

const FilterMenu = (props) => {
    console.log(props)
    return (
        <div class="dropdown">
            <div id="myDropdown" class="dropdown-content">
                <input type="text" placeholder="501 Error" onkeyup={filterFunction}></input>
                <select>
                    {props.entries.map((entry) => <option key={entry.method_id} value={entry.method_id}>{entry.method_name}</option>)}
                </select>
            </div>
        </div> 
    )
}

export default FilterMenu;