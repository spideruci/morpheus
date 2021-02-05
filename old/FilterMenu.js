import React, { Component } from 'react'
import './FilterMenu.scss'

class FilterMenu extends Component {

    constructor(props) {
        super();

        this.state = {
            entries: props.entries,
            display: props.entries,
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot){
        if (prevProps.entries !== this.props.entries) {
            this.setState({
                entries: this.props.entries,
                display: this.props.entries,
            })
        }
    }

    filterFunction(event) {
        // Get entry list
        const { entries } = this.state;

        // Get typed input
        const user_input = event.target.value;
        if (user_input === "") {
            this.setState({
                display: this.state.entries,
            })
            return;
        }

        // Filter entry list based on what hsa been typed
        const display = entries.filter(item => {
            const method_str = item.to_string().toLowerCase();
            return method_str.includes(user_input.toLowerCase());
        })

        // Repopulate the list based on what was typed.
        this.setState({
            display: display
        })
    }

    render () {
        return (
            <div>
                <span> {this.props.title} </span>
                <div className="filtermenu">
                    <div className="dropdown-content">
                        <input type="text" placeholder={"Search..."} onKeyUp={this.filterFunction.bind(this)}></input>
                        <select onChange={this.props.onClick}>
                            <option> -- select an option -- </option>
                            {this.state.display.map((entry) => (
                                <option key={entry.get_id()} value={entry.get_id()}>{entry.to_string()}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div> 
        )
    }
}

export default FilterMenu;