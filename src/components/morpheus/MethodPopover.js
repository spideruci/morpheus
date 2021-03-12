import React from 'react';
import { Button } from 'rsuite';
import 'rsuite/dist/styles/rsuite-default.css';
import Popover from '@material-ui/core/Popover';
import ClearIcon from '@material-ui/icons/Clear';

const CustomPopover = (props) => {
    const { 
        children,
        anchor,
        setAnchor,
        title,
        onFilterClick,
        onHistoryClick,
        secondaryBtn='Filter by (default)',
        primaryBtn='Filter'} = props;

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
                {title}
                <Button sz="xs" onClick={setAnchor}>
                    <ClearIcon fontSize="small" />
                </Button>
            </h3>
            {children}
            <Button appearance="default" onClick={onFilterClick}>{secondaryBtn}</Button>
            <Button appearance="primary" onClick={onHistoryClick}>{primaryBtn}</Button>
        </Popover>
    )
}

export const CommitPopover = ({ commit, anchor, setAnchor, onFilterClick, onHistoryClick }) => {
    
    return (
        <CustomPopover
            anchor={anchor}
            setAnchor={setAnchor}
            title={commit.toString()}
            onFilterClick={onFilterClick}
            onHistoryClick={onHistoryClick}
            primaryBtn='View Coverage'
            >
            <p>Author: {commit.getAuthor()} </p>
            <p>Date: {commit.getDate().toDateString()} </p>
            <p>SHA: {commit.getSHA()} </p>
        </CustomPopover>
    )
}

export const MethodPopover = ({ anchor, setAnchor, method, project, onFilterClick, onHistoryClick }) => {

    const methodName = method.getMethodName();
    const packageName = method.getPackageName();
    const projectName = project.getProjectName();

    return (
        <CustomPopover
            anchor={anchor}
            setAnchor={setAnchor}
            title={methodName}
            onFilterClick={onFilterClick}
            onHistoryClick={onHistoryClick}
            primaryBtn='View History'
        >
            <p>Project: {projectName} </p>
            <p>Package: {packageName}{ }</p>
        </CustomPopover>
    )
}