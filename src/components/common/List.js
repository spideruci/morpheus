import React from 'react'
import './List.scss'

const List = (props) => {
    return (
        <div className="selector">
            <span>{props.title}: </span>
            <select onChange={props.onProjectChange}>
                <option> -- select an option -- </option>
                {props.entries.map((entry) => <option key={entry.value} value={entry.value}>{entry.display}</option>)}
            </select>
        </div>
    )
}

export default List;