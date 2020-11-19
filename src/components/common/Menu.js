import React, {useState, useEffect} from 'react'
import Tooltip from '@material-ui/core/Tooltip';
import HelpIcon from '@material-ui/icons/Help';
import './Menu.scss'

const Menu = ({ title = "", description=[], onChange=(event) => console.log(event.target.value), entries = [], reset, updateReset}) => {
    const [value, setValue] = useState("default");

    const handleChange = e =>{
        if(reset === true){
            updateReset();
        }
        setValue(e.target.value) 
         
    }

    let tooltip = description.length === 0 ? null : (
        <Tooltip
            title={
            <div className="content"> {
                description.map((line, index) => (<div key={index}>{line}</div>))}
            </div>}>
            <HelpIcon fontSize="small" />
        </Tooltip>
    )
    useEffect(() => {
        if(reset) {
            setValue("default")
        }
      }, [reset]); // Only re-run the effect if reset changes

    return (
        <div className="menu-selector">
            <span>{title}: </span>
            {tooltip}
            <select value={value} onChange={handleChange}>
                <option value="default"> -- select an option -- </option>
                <option value="grapefruit">Grapefruit</option>
                {entries.map((entry) => (
                    <option key={entry.key} value={entry.value}>{entry.value}</option>
                    
                ))}
            </select>
        </div>
    )

}
export default Menu;