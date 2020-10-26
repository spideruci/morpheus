import React from 'react'
import Tooltip from '@material-ui/core/Tooltip';
import HelpIcon from '@material-ui/icons/Help';
import './Menu.scss'

const Menu = ({ title = "", description=[], onChange=(e) => console.log(e), entries = [] }) => {
    let tooltip = description.length === 0 ? null : (
        <Tooltip
            title={
            <div className="content"> {
                description.map((line, index) => (<div key={index}>{line}</div>))}
            </div>}>
            <HelpIcon fontSize="small" />
        </Tooltip>
    )
    return (
        <div className="menu-selector">
            <span>{title}: </span>
            {tooltip}
            <select onChange={onChange}>
                <option> -- select an option -- </option>
                {entries.map((entry) => (
                    <option key={entry.key} value={entry.value}>{entry.value}</option>
                ))}
            </select>
        </div>
    )
}

export default Menu;