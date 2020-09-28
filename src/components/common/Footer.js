import React from 'react';
import './Footer.scss'

class Footer extends React.Component {
    render() {
        return (
            <div class='footer'>
                <div><a href="http://spideruci.org"><img src="spider_circle_red.svg" /></a></div>
                <div><a href="https://github.com/spideruci"><img src="./GitHub-Mark-32px.png" /></a></div>
            </div>    
        )
    }
}

export default Footer;