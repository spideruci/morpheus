import React from 'react'
import './ResultTextBox.scss'
    
const ResultTextBox = (props) => {
    return (
        <div className="result-text-box">
            <span>{props.title}:</span>
            <textarea value={props.entries.map((entry, idx) => `${idx + 1}. ${entry.to_string()}`).join('\n')} readOnly />
        </div>
    )
}

export default ResultTextBox;