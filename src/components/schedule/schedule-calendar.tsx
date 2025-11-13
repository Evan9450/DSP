'use client';

import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Schedule } from '@/types/schedule';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Badge } from '@/components/ui/badge';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface ScheduleCalendarProps {
  schedules: Schedule[];
  onSelectSchedule: (schedule: Schedule) => void;
  view: View;
  onViewChange: (view: View) => void;
  date: Date;
  onNavigate: (date: Date) => void;
}

export function ScheduleCalendar({
  schedules,
  onSelectSchedule,
  view,
  onViewChange,
  date,
  onNavigate,
}: ScheduleCalendarProps) {
  const events = schedules.map((schedule) => ({
    id: schedule.id,
    title: schedule.driverName,
    start: schedule.startTime,
    end: schedule.endTime,
    resource: schedule,
  }));

  const eventStyleGetter = (event: any) => {
    const schedule: Schedule = event.resource;
    let backgroundColor = '#6b7280'; // gray for pending
    
    if (schedule.status === 'confirmed') {
      backgroundColor = '#2563eb'; // blue
    } else if (schedule.status === 'completed') {
      backgroundColor = '#16a34a'; // green
    }

    const style = {
      backgroundColor,
      borderRadius: '6px',
      opacity: 0.9,
      color: 'white',
      border: schedule.isNew || schedule.isModified ? '2px solid #f97316' : 'none',
      display: 'block',
      padding: '4px 8px',
    };

    return { style };
  };

  const CustomEvent = ({ event }: any) => {
    const schedule: Schedule = event.resource;
    return (
      <div className="text-xs">
        <div className="font-semibold truncate">{schedule.driverName}</div>
        <div className="text-[10px] opacity-90">{schedule.amazonId}</div>
        {schedule.vehicleNumber && (
          <div className="text-[10px] opacity-90">🚗 {schedule.vehicleNumber}</div>
        )}
      </div>
    );
  };

  return (
    <div className="h-[600px] bg-white rounded-lg border border-gray-200 p-4">
      <style jsx global>{`
        .rbc-calendar {
          font-family: inherit;
        }
        .rbc-header {
          padding: 12px 4px;
          font-weight: 600;
          color: #1e40af;
          background-color: #eff6ff;
          border-bottom: 2px solid #2563eb;
        }
        .rbc-today {
          background-color: #fef3c7;
        }
        .rbc-toolbar {
          padding: 12px 0;
          margin-bottom: 16px;
        }
        .rbc-toolbar button {
          padding: 8px 16px;
          border-radius: 6px;
          border: 1px solid #d1d5db;
          background-color: white;
          color: #374151;
          font-weight: 500;
          transition: all 0.2s;
        }
        .rbc-toolbar button:hover {
          background-color: #f3f4f6;
          border-color: #9ca3af;
        }
        .rbc-toolbar button.rbc-active {
          background-color: #1e40af;
          color: white;
          border-color: #1e40af;
        }
        .rbc-event {
          padding: 4px 8px;
          cursor: pointer;
        }
        .rbc-event:hover {
          opacity: 1 !important;
        }
        .rbc-time-slot {
          min-height: 40px;
        }
        .rbc-day-slot .rbc-time-slot {
          border-top: 1px solid #f3f4f6;
        }
      `}</style>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        view={view}
        onView={onViewChange}
        date={date}
        onNavigate={onNavigate}
        onSelectEvent={(event) => onSelectSchedule(event.resource)}
        eventPropGetter={eventStyleGetter}
        components={{
          event: CustomEvent,
        }}
        views={['month', 'week', 'day']}
        step={60}
        showMultiDayTimes
        style={{ height: '100%' }}
      />
    </div>
  );
}
