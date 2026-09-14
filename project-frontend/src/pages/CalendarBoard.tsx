import { useEffect, useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import { api } from "../api/client";
import "../components/CalendarBoard.css";

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
      3: "#ffed48", 
      4: "#0a91ff", 
      5: "#52fd58", 
};

type CalendarBoardProps = {
  refresh: number;
};

export default function CalendarBoard({
  refresh,
}: CalendarBoardProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentMonth, setCurrentMonth] = useState(dayjs());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState("");
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState(3);
  const [status, setStatus] = useState("TODO");

  async function fetchEvents() {
    try {
      const res = await api.get<CalendarEvent[]>("/api/events");
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, [refresh]);

  const prevMonth = () => setCurrentMonth((m) => m.subtract(1, "month"));
  const nextMonth = () => setCurrentMonth((m) => m.add(1, "month"));
  const goToday = () => setCurrentMonth(dayjs());

  const openNewModal = (date: string) => {
    setEditingEventId(null);
    setSelectedDate(date);
    setTitle("");
    setTime("");
    setDescription("");
    setPriority(3);
    setStatus("TODO");
    setIsModalOpen(true);
  };

  const openEditModal = (
    e: React.MouseEvent<HTMLButtonElement>,
    event: CalendarEvent
  ) => {
    e.stopPropagation();

    const dt = dayjs(event.startTime);

    setEditingEventId(event.id);
    setSelectedDate(dt.format("YYYY-MM-DD"));
    setTitle(event.title);
    setTime(dt.format("HH:mm"));
    setDescription(event.description ?? "");
    setPriority(event.priority);
    setStatus(event.status);

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingEventId(null);
    setIsModalOpen(false);
  };

  async function saveEvent() {
    if (!title.trim()) return;

    const start_time = dayjs(
      `${selectedDate}T${time || "00:00"}`
    ).toISOString();

    try {
      if (editingEventId) {
        await api.patch(`/api/events/${editingEventId}`, {
          title,
          description,
          priority,
          status,
          start_time,
        });
      } else {
        await api.post("/api/events", {
          title,
          description,
          priority,
          status,
          start_time,
        });
      }

      await fetchEvents();
      closeModal();
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteEvent() {
    if (!editingEventId) return;

    if (!window.confirm("Delete this event?")) return;

    try {
      await api.delete(`/api/events/${editingEventId}`);
      await fetchEvents();
      closeModal();
    } catch (err) {
      console.error(err);
    }
  }

  const startOfMonth = currentMonth.startOf("month");
  const startDate = startOfMonth.subtract(startOfMonth.day(), "day");

  const calendarDays = Array.from(
    { length: 42 },
    (_, i) => startDate.add(i, "day")
  );

  const today = dayjs().format("YYYY-MM-DD");

  return (
    <main className="calendar-container">
      <header className="calendar-header">
        <h2>{currentMonth.format("MMMM YYYY")}</h2>

        <div className="calendar-actions">
          <button onClick={goToday}>Today</button>
          <button onClick={prevMonth}>◀</button>
          <button onClick={nextMonth}>▶</button>
        </div>
      </header>

      <section className="calendar-grid">

        {["SUN","MON","TUE","WED","THU","FRI","SAT"].map(day=>(
          <div
            key={day}
            className="calendar-weekday"
          >
            {day}
          </div>
        ))}

        {calendarDays.map((dayObj: Dayjs)=>{

          const dateStr = dayObj.format("YYYY-MM-DD");

          const isToday = today===dateStr;

          const inMonth = dayObj.isSame(currentMonth,"month");

          const dayEvents = events.filter(
            e=>dayjs(e.startTime).format("YYYY-MM-DD")===dateStr
          );

          return(

            <article
              key={dateStr}
              className={`calendar-cell ${
                !inMonth ? "other-month" : ""
              }`}
              onClick={()=>openNewModal(dateStr)}
            >

              <div className="calendar-date">

                <span className={isToday ? "today" : ""}>
                  {dayObj.date()}
                </span>

              </div>

              <div className="calendar-events">

                {dayEvents.map(evt=>(

                  <button
                    key={evt.id}
                    className="event-chip"
                    style={{
                      border: `2px solid ${PRIORITY_COLORS[evt.priority]}`,
                      backgroundColor: PRIORITY_COLORS[evt.priority],
                      color: evt.priority === 3 ? "#333" : "#fff",
                    }}
                    onClick={(e)=>openEditModal(e,evt)}
                  >
                    {evt.title}
                  </button>

                ))}

              </div>

            </article>

          );

        })}

      </section>
            <dialog open={isModalOpen} className="calendar-dialog">
        <article>
          <header className="dialog-header">
            <strong>
              {editingEventId ? "Edit Event" : "Add Event"}
            </strong>

            <button
              aria-label="Close"
              className="close-button"
              onClick={closeModal}
            >
              ✕
            </button>
          </header>

          <p>
            <strong>Date:</strong>{" "}
            {dayjs(selectedDate).format("dddd, MMMM D, YYYY")}
          </p>

          <label>
            Title
            <input
              type="text"
              placeholder="Event title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </label>

          <label>
            Time
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </label>

          <label>
            Priority
            <select
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Status
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </label>

          <label>
            Description
            <textarea
              rows={5}
              placeholder="Description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <footer className="dialog-footer">
            <div>
              {editingEventId && (
                <button
                  className="contrast"
                  onClick={deleteEvent}
                >
                  Delete
                </button>
              )}
            </div>

            <div className="dialog-actions">
              <button
                className="secondary"
                onClick={closeModal}
              >
                Cancel
              </button>

              <button onClick={saveEvent}>
                Save
              </button>
            </div>
          </footer>
        </article>
      </dialog>
    </main>
  );
}