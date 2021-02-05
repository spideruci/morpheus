import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios'
import './About.scss';

const About = () => {
    let [ content, setContent ] = useState(null)

    useEffect(() => {
        axios.get(`${process.env.PUBLIC_URL}/content/about.md`)
            .then(res => res.data)
            .then(md_content => setContent(md_content))
            .catch(console.error);
        }
    )
    return (
        <div className="content-wrapper">
            <ReactMarkdown source={content} />
        </div>
    )
}

export default About;
