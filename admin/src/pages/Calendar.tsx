import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput, DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { Modal } from "../components/ui/modal";
import { useModal } from "../hooks/useModal";
import PageMeta from "../components/common/PageMeta";
import { useAuth } from "../context/AuthContext";

interface CalendarEvent extends EventInput {
  extendedProps: {
    calendar: string;
    description?: string;
    reminder_time?: string;
  };
}

import { API_URL } from "../config/api";
const API = API_URL;

const Calendar: React.FC = () => {
  const { token } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventLevel, setEventLevel] = useState("Primary");
  const [eventDescription, setEventDescription] = useState("");
  const [eventReminder, setEventReminder] = useState("");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();

  const calendarsEvents = {
    Danger: "danger",
    Success: "success",
    Primary: "primary",
    Warning: "warning",
  };

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/calendar-events`, { headers });
      const data = await res.json();
      const formattedEvents = data.map((ev: any) => ({
        id: ev.id.toString(),
        title: ev.title,
        start: ev.start_date,
        end: ev.end_date,
        allDay: !ev.start_date.includes('T'),
        extendedProps: {
          calendar: ev.color,
          description: ev.description,
          reminder_time: ev.reminder_time
        }
      }));
      setEvents(formattedEvents);
    } catch (err) { console.error("Fetch error:", err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    resetModalFields();
    setEventStartDate(selectInfo.startStr);
    setEventEndDate(selectInfo.endStr || selectInfo.startStr);
    openModal();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    setSelectedEvent(event);
    setEventTitle(event.title);
    setEventStartDate(event.start?.toISOString().split("T")[0] || "");
    setEventEndDate(event.end?.toISOString().split("T")[0] || "");
    setEventLevel(event.extendedProps.calendar || "Primary");
    setEventDescription(event.extendedProps.description || "");
    setEventReminder(event.extendedProps.reminder_time ? new Date(event.extendedProps.reminder_time).toISOString().slice(0, 16) : "");
    openModal();
  };

  const handleAddOrUpdateEvent = async () => {
    if (!eventTitle || !eventStartDate) return alert("Title and Start Date are required");

    const payload = {
      title: eventTitle,
      start_date: eventStartDate,
      end_date: eventEndDate || null,
      color: eventLevel,
      description: eventDescription,
      reminder_time: eventReminder || null
    };

    try {
      if (selectedEvent) {
        await fetch(`${API}/api/calendar-events/${selectedEvent.id}`, {
          method: "PUT", headers, body: JSON.stringify(payload)
        });
      } else {
        await fetch(`${API}/api/calendar-events`, {
          method: "POST", headers, body: JSON.stringify(payload)
        });
      }
      fetchEvents();
      closeModal();
      resetModalFields();
    } catch (err) { alert("Failed to save event"); }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    if (!confirm("Delete this event?")) return;
    try {
      await fetch(`${API}/api/calendar-events/${selectedEvent.id}`, {
        method: "DELETE", headers
      });
      fetchEvents();
      closeModal();
      resetModalFields();
    } catch (err) { alert("Failed to delete"); }
  };

  const resetModalFields = () => {
    setEventTitle("");
    setEventStartDate("");
    setEventEndDate("");
    setEventLevel("Primary");
    setEventDescription("");
    setEventReminder("");
    setSelectedEvent(null);
  };

  return (
    <>
      <PageMeta
        title="Calendar | Selectt Admin"
        description="Manage your schedule and reminders"
      />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="custom-calendar p-4">
          {loading && <div className="text-center py-2 text-sm text-brand-500">Syncing with server...</div>}
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next addEventButton",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={events}
            selectable={true}
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventContent={renderEventContent}
            customButtons={{
              addEventButton: {
                text: "Add Event +",
                click: openModal,
              },
            }}
          />
        </div>
        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          className="max-w-[700px] p-6 lg:p-10"
        >
          <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar max-h-[80vh]">
            <div>
              <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                {selectedEvent ? "Edit Event" : "Add Event"}
              </h5>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Plan your next big moment and set reminders.
              </p>
            </div>
            <div className="mt-8 space-y-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. Client Meeting"
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
              </div>

              <div>
                <label className="block mb-4 text-sm font-medium text-gray-700 dark:text-gray-400">
                  Event Color
                </label>
                <div className="flex flex-wrap items-center gap-4 sm:gap-5">
                  {Object.entries(calendarsEvents).map(([key, value]) => (
                    <div key={key} className="n-chk">
                      <div className={`form-check form-check-${value} form-check-inline`}>
                        <label className="flex items-center text-sm text-gray-700 form-check-label dark:text-gray-400 cursor-pointer">
                          <input
                            className="sr-only"
                            type="radio"
                            name="event-level"
                            value={key}
                            checked={eventLevel === key}
                            onChange={() => setEventLevel(key)}
                          />
                          <span className="relative flex items-center justify-center w-5 h-5 mr-2 border border-gray-300 rounded-full dark:border-gray-700">
                            <span className={`h-2.5 w-2.5 rounded-full bg-brand-500 ${eventLevel === key ? "block" : "hidden"}`}></span>
                          </span>
                          {key}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={eventStartDate}
                    onChange={(e) => setEventStartDate(e.target.value)}
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={eventEndDate}
                    onChange={(e) => setEventEndDate(e.target.value)}
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400 text-brand-500 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
                  Reminder Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={eventReminder}
                  onChange={(e) => setEventReminder(e.target.value)}
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-brand-200 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  placeholder="Additional details..."
                  className="dark:bg-dark-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 resize-none"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-8 modal-footer sm:justify-end">
              {selectedEvent && (
                <button
                  onClick={handleDeleteEvent}
                  type="button"
                  className="flex w-full justify-center rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-100 sm:w-auto"
                >
                  Delete Event
                </button>
              )}
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={closeModal}
                  type="button"
                  className="flex flex-1 justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddOrUpdateEvent}
                  type="button"
                  className="flex flex-1 justify-center rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
                >
                  {selectedEvent ? "Save Changes" : "Create Event"}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

const renderEventContent = (eventInfo: any) => {
  const calendar = eventInfo.event.extendedProps.calendar || "Primary";
  const colorClass = `fc-bg-${calendar.toLowerCase()}`;
  return (
    <div
      className={`event-fc-color flex fc-event-main ${colorClass} p-1 rounded-sm`}
    >
      <div className="fc-daygrid-event-dot"></div>
      <div className="fc-event-time">{eventInfo.timeText}</div>
      <div className="fc-event-title font-semibold">{eventInfo.event.title}</div>
    </div>
  );
};

export default Calendar;
