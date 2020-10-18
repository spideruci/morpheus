import React from 'react'
import './List.scss'

const List = (props) => {
    return (
        <div className="selector">
            <span>{props.title}: </span>
            <select onChange={props.onProjectChange}>
                {props.entries.map((entry) => <option key={entry.value} value={entry.value}>{entry.display}</option>)}
            </select>
        </div>
    )
}

export default List;