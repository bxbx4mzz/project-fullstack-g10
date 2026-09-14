    import { useEffect, useMemo, useState } from "react";
    import dayjs from "dayjs";
    import { api } from "../api/client";

    type CalendarEvent = {
    id: string;
    title: string;
    description?: string | null;
    startTime: string;
    endTime?: string | null;
    priority: number;
    status: string;
    };

    const PRIORITIES = [
    { value: 1, label: "Highest" },
    { value: 2, label: "High" },
    { value: 3, label: "Medium" },
    { value: 4, label: "Low" },
    { value: 5, label: "Lowest" },
    ];

    const PRIORITY_COLORS: Record<number, string> = {
        1: "#ff5050", 
        2: "#fcb346", 
        3: "#ffee58", 
        4: "#46a9fa", 
        5: "#52fd58", 
    };
    
    export default function OverviewBoard() {
    const [events, setEvents] = useState<CalendarEvent[]>([]);

    useEffect(() => {
        fetchEvents();
    }, []);

    async function fetchEvents() {
        try {
        const res = await api.get<CalendarEvent[]>("/api/events");
        setEvents(res.data);
        } catch (err) {
        console.error(err);
        }
    }

    const groupedEvents = useMemo(() => {
        return PRIORITIES.map((priority) => ({
        ...priority,
        events: events.filter(
            (event) =>
                event.priority === priority.value &&
                event.status !== "DONE"
        ),
        }));
    }, [events]);

    return (
        <main className="container">
        <h2>Overview Board</h2>

        <div
            style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
            gap: "1rem",
            }}
        >
            {groupedEvents.map((group) => (
            <article key={group.value}>
                <header>
                <strong>{group.label}</strong>
                <p>{group.events.length} Tasks</p>
                </header>

                {group.events.length === 0 ? (
                <small>No tasks</small>
                ) : (
                group.events.map((event) => (
                    <div
                    key={event.id}
                    style={{
                        border: `2px solid ${PRIORITY_COLORS[event.priority]}`,
                        borderRadius: "8px",
                        padding: "10px",
                        marginBottom: "10px",
                    }}
                    >
                    <strong>{event.title}</strong>

                    <p>{event.description}</p>

                    <small>
                        {dayjs(event.startTime).format(
                        "DD/MM/YYYY HH:mm"
                        )}
                    </small>

                    <br />

                    <small>Status : {event.status}</small>
                    </div>
                ))
                )}
            </article>
            ))}
        </div>
        </main>
    );
    }