import React from 'react';
import './Footer.scss'

class Footer extends React.Component {
    render() {
        return (
            <div className='footer'>
                <div><a href="http://spideruci.org"><img alt="spideruci.org" src="spider_circle_red.svg" /></a></div>
                <div><a href="https://github.com/spideruci"><img alt="github.com/spideruci" src="./GitHub-Mark-32px.png" /></a></div>
            </div>    
        )
    }
}

export default Footer;