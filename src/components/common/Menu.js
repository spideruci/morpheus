import React from 'react'
import './Menu.scss'

const Menu = (props) => {
    return (
        <div className="menu-selector">
            <span> {props.title}: </span>
            <select onChange={props.onChange}>
                <option> -- select an option -- </option>
                {props.entries.map((entry) => (
                    <option key={entry.key} value={entry.key}>{entry.value}</option>
                ))}
            </select>
        </div>
    )
}

export default Menu;