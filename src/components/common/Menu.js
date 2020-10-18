import React from 'react'
import './Menu.scss'

const SliderFilter = (props) => {

    return (
        <div className="menu-selector">
            <span> {props.title}: </span>
            <select>
                {props.entries.map((entry) => (
                    <option onClick={props.onClick} key={entry.key} value={entry.value}>{entry.value}</option>
                ))}
            </select>
        </div>
    )
}

export default SliderFilter;