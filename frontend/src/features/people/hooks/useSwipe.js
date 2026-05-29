import { useState, useRef } from 'react';
import { useAnimation } from 'framer-motion';

export const useSwipe = () => {
    const controls = useAnimation();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [rejectedUsers, setRejectedUsers] = useState([]);
    const [rejectedAiMatches, setRejectedAiMatches] = useState([]);
    // Guard against rapid-fire actions (double-tap, fast swipe)
    const isAnimatingRef = useRef(false);

    /**
     * After a user is removed from the availablePeople list (via reject/send),
     * the array shrinks. The element that WAS at currentIndex+1 is now at
     * currentIndex. So we must NOT increment the index — just reset the card.
     *
     * If currentIndex is now out of bounds (e.g. we rejected the last person),
     * the PeoplesPage clamp effect will reset it to 0.
     */
    const resetCard = () => {
        setTimeout(() => {
            controls.start({ x: 0, opacity: 1 });
            isAnimatingRef.current = false;
        }, 300);
    };

    const handleSwipe = async (info, id, isSent, onSendRequest, onReject, availablePeopleLength) => {
        if (isAnimatingRef.current) return;
        const threshold = 100;
        const velocity = info.velocity.x;

        if (velocity < -threshold) {
            // Swipe left → reject
            isAnimatingRef.current = true;
            await controls.start({ x: '-100%', opacity: 0, transition: { duration: 0.5 } });
            onReject(id);
            // Do NOT call goToNext — the rejected list update shrinks availablePeople,
            // so the next person naturally appears at the same index.
            resetCard();
        } else if (velocity > threshold) {
            // Swipe right → send request
            if (!isSent) {
                isAnimatingRef.current = true;
                await onSendRequest(id);
                // onSendRequest handles animation and does NOT increment index
                isAnimatingRef.current = false;
            } else {
                controls.start({ x: 0, opacity: 1, transition: { duration: 0.5 } });
            }
        } else {
            controls.start({ x: 0, opacity: 1, transition: { duration: 0.5 } });
        }
    };

    const rejectUser = (id, showAiMatches, _availablePeopleLength) => {
        if (isAnimatingRef.current) return;
        isAnimatingRef.current = true;

        if (showAiMatches) {
            setRejectedAiMatches((prev) => [...prev, id]);
        } else {
            setRejectedUsers((prev) => [...prev, id]);
        }
        controls.start({ x: '-100%', opacity: 0, transition: { duration: 0.5 } });
        // Do NOT increment currentIndex — the list shrinks, so the next person
        // naturally slides into the current index position.
        resetCard();
    };

    /**
     * Clamp currentIndex if it goes out of bounds after the list shrinks.
     * Called from PeoplesPage via useEffect.
     */
    const clampIndex = (availablePeopleLength) => {
        setCurrentIndex((prev) => {
            if (availablePeopleLength === 0) return 0;
            if (prev >= availablePeopleLength) return 0;
            return prev;
        });
    };

    return {
        controls, currentIndex, setCurrentIndex,
        rejectedUsers, setRejectedUsers,
        rejectedAiMatches, setRejectedAiMatches,
        handleSwipe, rejectUser, clampIndex,
    };
};
