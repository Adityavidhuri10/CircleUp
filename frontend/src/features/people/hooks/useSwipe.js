import { useState } from 'react';
import { useAnimation } from 'framer-motion';

export const useSwipe = () => {
    const controls = useAnimation();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [rejectedUsers, setRejectedUsers] = useState([]);
    const [rejectedAiMatches, setRejectedAiMatches] = useState([]);

    const goToNext = (availablePeopleLength) => {
        setTimeout(() => {
            setCurrentIndex((prev) => {
                if (prev + 1 >= availablePeopleLength) return 0;
                return prev + 1;
            });
            controls.start({ x: 0, opacity: 1 });
        }, 300);
    };

    const handleSwipe = async (info, id, isSent, onSendRequest, onReject, availablePeopleLength) => {
        const threshold = 100;
        const velocity = info.velocity.x;

        if (velocity < -threshold) {
            onReject(id);
            await controls.start({ x: '-100%', opacity: 0, transition: { duration: 0.5 } });
            goToNext(availablePeopleLength);
        } else if (velocity > threshold) {
            if (!isSent) {
                await onSendRequest(id);
            } else {
                controls.start({ x: 0, opacity: 1, transition: { duration: 0.5 } });
            }
        } else {
            controls.start({ x: 0, opacity: 1, transition: { duration: 0.5 } });
        }
    };

    const rejectUser = (id, showAiMatches, availablePeopleLength) => {
        if (showAiMatches) {
            setRejectedAiMatches((prev) => [...prev, id]);
        } else {
            setRejectedUsers((prev) => [...prev, id]);
        }
        controls.start({ x: '-100%', opacity: 0, transition: { duration: 0.5 } });
        setTimeout(() => {
            setCurrentIndex((prev) => {
                if (prev + 1 >= availablePeopleLength) return 0;
                return prev + 1;
            });
            controls.start({ x: 0, opacity: 1 });
        }, 300);
    };

    return {
        controls, currentIndex, setCurrentIndex,
        rejectedUsers, setRejectedUsers,
        rejectedAiMatches, setRejectedAiMatches,
        goToNext, handleSwipe, rejectUser,
    };
};
