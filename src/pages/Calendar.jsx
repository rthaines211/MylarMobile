import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useUpcoming } from '../hooks/useMylar';
import { LoadingScreen } from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const { data: upcoming, isLoading, error, refetch } = useUpcoming();

  // Group releases by date
  const releasesByDate = useMemo(() => {
    // Ensure upcoming is an array before processing
    if (!upcoming || !Array.isArray(upcoming)) return {};

    const grouped = {};
    upcoming.forEach((issue) => {
      const date = issue.IssueDate || issue.ReleaseDate;
      if (date) {
        const dateKey = new Date(date).toDateString();
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(issue);
      }
    });
    return grouped;
  }, [upcoming]);

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toDateString();

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const days = [];

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, key: `empty-${i}`, releases: [], dateKey: null, isToday: false });
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = date.toDateString();
      const releases = releasesByDate[dateKey] || [];

      days.push({
        day,
        date,
        dateKey,
        releases,
        isToday: dateKey === today,
        key: `day-${day}`,
      });
    }

    return days;
  }, [year, month, firstDay, daysInMonth, releasesByDate, today]);

  const navigateMonth = (delta) => {
    setCurrentDate(new Date(year, month + delta, 1));
    setSelectedDay(null);
  };

  const selectedReleases = selectedDay ? releasesByDate[selectedDay] || [] : [];

  if (isLoading) {
    return (
      <Layout title="Calendar">
        <LoadingScreen message="Loading calendar..." />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Calendar">
        <ErrorMessage
          title="Failed to load calendar"
          message={error.message}
          onRetry={refetch}
        />
      </Layout>
    );
  }

  return (
    <Layout title="Calendar" onRefresh={refetch}>
      <div className="p-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 rounded-full active:bg-bg-tertiary"
          >
            <ChevronLeft className="w-6 h-6 text-text-secondary" />
          </button>

          <h2 className="text-lg font-semibold text-text-primary">
            {MONTHS[month]} {year}
          </h2>

          <button
            onClick={() => navigateMonth(1)}
            className="p-2 rounded-full active:bg-bg-tertiary"
          >
            <ChevronRight className="w-6 h-6 text-text-secondary" />
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map((day) => (
            <div key={day} className="text-center text-xs text-text-muted py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map(({ day, dateKey, releases, isToday, key }) => (
            <button
              key={key}
              onClick={() => day && setSelectedDay(dateKey)}
              disabled={!day}
              className={`
                aspect-square flex flex-col items-center justify-center rounded-lg text-sm
                ${!day ? 'invisible' : 'visible'}
                ${isToday ? 'bg-accent-primary text-white' : ''}
                ${selectedDay === dateKey && !isToday ? 'bg-bg-tertiary' : ''}
                ${releases.length > 0 && !isToday ? 'bg-bg-secondary' : ''}
                active:opacity-70
              `}
            >
              {day && (
                <>
                  <span className={isToday ? 'font-bold' : ''}>{day}</span>
                  {releases.length > 0 && (
                    <span className={`text-xs ${isToday ? 'text-white/80' : 'text-accent-primary'}`}>
                      {releases.length}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </div>

        {/* Selected Day Details */}
        {selectedDay && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-text-secondary mb-3">
              {new Date(selectedDay).toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </h3>

            {selectedReleases.length === 0 ? (
              <div className="text-center py-8 text-text-muted">
                <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No releases on this day</p>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedReleases.map((issue, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-bg-secondary rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {issue.ComicName || issue.Comic}
                      </p>
                      <p className="text-xs text-text-secondary">
                        #{issue.Issue_Number || issue.IssueNumber}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      issue.Status === 'Downloaded' ? 'bg-accent-success/20 text-accent-success' :
                      issue.Status === 'Wanted' ? 'bg-accent-primary/20 text-accent-primary' :
                      'bg-bg-tertiary text-text-muted'
                    }`}>
                      {issue.Status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
