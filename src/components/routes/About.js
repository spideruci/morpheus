import React, { Component } from 'react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios'
import './About.scss';

class About extends Component {
    constructor() {
        super();
        this.state = { content: ""}
    }

    componentDidMount() {
        axios.get(`${process.env.PUBLIC_URL}/content/about.md`)
            .then(res => res.data)
            .then(md_content => this.setState({ content: md_content})) 
    }

    render() {
        return (
            <div class="content-wrapper">
                <ReactMarkdown source={this.state.content} />
            </div>
        );
    }
}

export default About;
