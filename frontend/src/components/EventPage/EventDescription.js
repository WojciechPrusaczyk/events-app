import React, { useEffect, useState } from 'react';
import "../../styles/containers/home.scss";
import "../../styles/containers/joinEvent.scss";
import DataLoader from "../../components/loader";
import DateTimePresenter from "../DateTimePresenter";
import CrownIcon from "../../images/icons/crownIcon.svg";
import EventImage from "../EventImage";
import LocationPin from "../../images/icons/locationPinIcon.svg";
import {formatForBackend, getAddressByLaLng, quillToHtml} from "../Helpers";
import { atcb_action } from "add-to-calendar-button";

const EventHeader = ({id = "event-desc", className = "event-desc", desc, rules}) => {

    const [isDescShown, showDesc] = useState(true);

    return (
        <div id={id}>
            <p className={className+"-controls"}>
                <span>Rules</span>
                <div className={className+"-controls-wrapper"}>
                    <input className={className+"-controls-input tgl tgl-light"} id="isActive"
                           type="checkbox"
                           aria-label="show description, or rules"
                           title="show description, or rules"
                           onChange={ () => showDesc(!isDescShown)}
                           defaultChecked={isDescShown}/>
                    <label title="is active" aria-hidden="true" className="tgl-btn" htmlFor="isActive"/>
                </div>
                <span>Description</span>
            </p>
            <div className={className+"-content"}>
                {(isDescShown &&  null != desc && desc.length > 0) && <div className={className+"-content-desc"} dangerouslySetInnerHTML={{ __html: quillToHtml(desc) }} />}
                {!(isDescShown &&  null != desc && desc.length > 0) && isDescShown && <div className={className+"-content-desc"}>No description described.</div>}
                {(!isDescShown &&  null != rules && rules.length > 0) && <div className={className+"-content-rules"} dangerouslySetInnerHTML={{ __html: quillToHtml(rules) }} />}
                {!(!isDescShown &&  null != rules && rules.length > 0) && !isDescShown && <div className={className+"-content-rules"}>No specific rules described.</div>}
            </div>
        </div>
    );
};

export default EventHeader;
