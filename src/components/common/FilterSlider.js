import React from 'react';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';

const FilterSlider = (props) => {
    const { title, defaultValue, min, max, onChange } = props;

    return (
        <div className="filter-slider">
            <Typography>{ title }</Typography>
            <Slider
                defaultValue={defaultValue}
                min={min}
                max={max}
                aria-labelledby="continuous-slider"
                onChange={onChange}
                valueLabelDisplay="auto"
            />
        </div>
    )
}

export default FilterSlider;