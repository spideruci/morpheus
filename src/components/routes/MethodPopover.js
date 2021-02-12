import React from 'react';
import {Button} from 'rsuite';
import 'rsuite/dist/styles/rsuite-default.css';
import Popover from '@material-ui/core/Popover';
import ClearIcon from '@material-ui/icons/Clear';
// import Button from '@material-ui/core/Button';

const MethodPopover = ({anchor, setAnchor, current_method, current_project, onMethodClick}) => {
  return(
    <Popover
        id={Boolean(anchor) ? 'simple-popover' : undefined}
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={setAnchor}
        anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
        }}
        transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
        }}
    >
        <h3>
          {current_method.split(' ')[2]}
           <Button sz="xs" onClick={setAnchor}>
              <ClearIcon fontSize="small" />
          </Button> 
        </h3>
        <p>Project: {current_project} </p>
        <p>Package: {current_method.split(' ')[0]}{   }</p>
        {/* <div>
          <Button variant ="contained" color="primary">Filter by Method (default)</Button>
        </div>
        <div>
          <Button variant="contained" color="primary">View Method History</Button>
        </div> */}
        <Button appearance="default" onClick={onMethodClick}>Filter by Method (default)</Button>
        <Button appearance="primary">View Method History</Button>
        
    </Popover>
  )
}

export default MethodPopover;