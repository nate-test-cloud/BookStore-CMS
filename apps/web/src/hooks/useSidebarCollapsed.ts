import { useState, useEffect } from "react";

let subscribers: ((value: boolean) => void)[] = [];
let sidebarCollapsed = true;

export const setSidebarCollapsed = (value: boolean) => {
    sidebarCollapsed = value;
    subscribers.forEach((cb) => cb(value));
};

export const useSidebarCollapsed = () => {
    const [isCollapsed, setIsCollapsed] = useState(sidebarCollapsed);

    useEffect(() => {
        const handleUpdate = (value: boolean) => setIsCollapsed(value);
        subscribers.push(handleUpdate);

        return () => {
            subscribers = subscribers.filter((cb) => cb !== handleUpdate);
        };
    }, []);

    return isCollapsed;
};
