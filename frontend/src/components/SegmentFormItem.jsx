import React, { useState, useEffect } from 'react';

const SegmentFormItem = ({segmentObject}) => {
    return (
        <div className="univForm-container">
            <h1 className="univForm-container-title">{segmentObject.name}</h1>
        </div>
    );
}

export default SegmentFormItem;