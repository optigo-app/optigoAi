import { useEffect, useState } from "react";

export const ContinuousTypewriter = ({ texts, delay = 0 }) => {
    const [displayText, setDisplayText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);
    const [typingSpeed, setTypingSpeed] = useState(50);

    const textArray = Array.isArray(texts) ? texts : [texts];

    useEffect(() => {
        let timer;
        const handleType = () => {
            const current = loopNum % textArray.length;
            const fullText = textArray[current];

            setDisplayText(
                isDeleting
                    ? fullText.substring(0, displayText.length - 1)
                    : fullText.substring(0, displayText.length + 1)
            );

            setTypingSpeed(isDeleting ? 30 : 50);

            if (!isDeleting && displayText === fullText) {
                setTimeout(() => setIsDeleting(true), 1600);
            } else if (isDeleting && displayText === "") {
                setIsDeleting(false);
                setLoopNum(loopNum + 1);
            }
        };

        timer = setTimeout(handleType, typingSpeed);
        return () => clearTimeout(timer);
    }, [displayText, isDeleting, loopNum, typingSpeed, textArray]);

    return (
        <span style={{ borderRight: "2px solid #7367f0", paddingRight: "4px" }}>
            {displayText}
        </span>
    );
};
