import React, { useState } from 'react';
import { Button } from 'rsuite';
import 'rsuite/dist/styles/rsuite-default.css';
import Popover from '@material-ui/core/Popover';
import ClearIcon from '@material-ui/icons/Clear';

const MethodPopover = ({anchor, setAnchor, currentMethod, currentProject, onMethodClick, onHistoryClick }) => {


    const methodName = currentMethod === null ? "": currentMethod;
    const projectName = currentProject === null ? "" : currentProject.value;

    return (
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
                {currentMethod.split(' ').slice(2)}
                <Button sz="xs" onClick={setAnchor}>
                    <ClearIcon fontSize="small" />
                </Button>
            </h3>
            <p>Project: {projectName} </p>
            <p>Package: {methodName.split(' ')[0]}{ }</p>
            <Button appearance="default" onClick={onMethodClick}>Filter by Method (default)</Button>
            <Button appearance="primary" onClick={onHistoryClick}>View Method History</Button>

        </Popover>
    )
}

export default MethodPopover;