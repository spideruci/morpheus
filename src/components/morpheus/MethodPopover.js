import React, { useState } from 'react';
import { Button } from 'rsuite';
import 'rsuite/dist/styles/rsuite-default.css';
import Popover from '@material-ui/core/Popover';
import ClearIcon from '@material-ui/icons/Clear';

const MethodPopover = ({ anchor, setAnchor, label, project, onMethodClick, onHistoryClick }) => {
    let labelName  = "";
    let packageName = "";

    if ((label !== null) && (label !== undefined)) {
        labelName = label.method_name;
        packageName = label.className;
    }

    const projectName = project === null ? "" : project.value;

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
                {labelName}
                <Button sz="xs" onClick={setAnchor}>
                    <ClearIcon fontSize="small" />
                </Button>
            </h3>
            <p>Project: {projectName} </p>
            <p>Package: {packageName}{ }</p>
            <Button appearance="default" onClick={onMethodClick}>Filter by (default)</Button>
            <Button appearance="primary" onClick={onHistoryClick}>View History</Button>

        </Popover>
    )
}

export default MethodPopover;