import React, {useEffect, useState} from 'react';
import "../../styles/containers/home.scss";
import "../../styles/containers/joinEvent.scss";

const Countdown = ({id = "event-timer", title, className = "event-header", countDownTo}) => {
    const [timeRemaining, setTimeRemaining] = useState(null);
    useEffect(() => {
        const targetTime = new Date(countDownTo).getTime();

        const updateCountdown = () => {
            const currentTime = new Date().getTime();
            const diff = targetTime - currentTime;

            if (diff <= 0 || diff > 24 * 60 * 60 * 1000) {
                setTimeRemaining(null);
                return;
            }

            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeRemaining(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
        };

        updateCountdown();
        const intervalId = setInterval(updateCountdown, 1000);

        return () => clearInterval(intervalId);
    }, [countDownTo]);

    if (timeRemaining === null) return null;

    return (
        <div id={id} className={className}>
            <span className={className+"-title"}>{title}</span>
            <span className={className+"-time"}>{timeRemaining}</span>
        </div>
    );
};

export default Countdown;