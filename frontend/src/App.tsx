import { useEffect, useMemo, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import EventModal from './components/EventModal';
import { api } from './api/client';
import { MaterialStatus, Project, ScheduleEvent } from './types';

const statusOptions: Array<MaterialStatus | ''> = ['', 'OVERDUE', 'DUE_SOON', 'UPCOMING'];

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<MaterialStatus | ''>('');
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);

  const fetchProjects = async () => {
    const { data } = await api.get<Project[]>('/projects');
    setProjects(data);
  };

  const fetchSchedule = async () => {
    const { data } = await api.get<ScheduleEvent[]>('/schedule', {
      params: {
        projectId: selectedProject || undefined,
        status: selectedStatus || undefined,
        search: search || undefined
      }
    });
    setEvents(data);
  };

  const sync = async () => {
    await api.post('/sync/projects');
    await Promise.all([fetchProjects(), fetchSchedule()]);
  };

  useEffect(() => {
    void Promise.all([fetchProjects(), fetchSchedule()]);
  }, []);

  useEffect(() => {
    void fetchSchedule();
  }, [selectedProject, selectedStatus, search]);

  const rows = useMemo(() => events.map((event) => ({ ...event, ...event.extendedProps })), [events]);

  return (
    <div className="flex min-h-screen">
      <aside className="w-80 space-y-4 border-r bg-white p-4">
        <h1 className="text-2xl font-bold">Material Scheduler</h1>
        <button onClick={sync} className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Sync from INNERGY
        </button>

        <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} className="w-full rounded border p-2">
          <option value="">All Projects</option>
          {projects.map((project) => (
            <option value={project.id} key={project.id}>{project.name}</option>
          ))}
        </select>

        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value as MaterialStatus | '')} className="w-full rounded border p-2">
          {statusOptions.map((status) => (
            <option key={status || 'all'} value={status}>{status || 'All Statuses'}</option>
          ))}
        </select>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded border p-2"
          placeholder="Search SKU or material"
        />
      </aside>

      <main className="flex-1 space-y-6 p-6">
        <div className="rounded bg-white p-4 shadow">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            height={550}
            eventClick={(info) => setSelectedEvent(info.event.toPlainObject() as ScheduleEvent)}
          />
        </div>

        <div className="overflow-hidden rounded bg-white shadow">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2">Project</th>
                <th className="px-3 py-2">Material</th>
                <th className="px-3 py-2">Qty</th>
                <th className="px-3 py-2">Order Date</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="px-3 py-2">{row.projectName}</td>
                  <td className="px-3 py-2">{row.materialSku} {row.materialName ? `- ${row.materialName}` : ''}</td>
                  <td className="px-3 py-2">{row.quantityRequired} {row.unit || ''}</td>
                  <td className="px-3 py-2">{row.recommendedOrderDate ? new Date(row.recommendedOrderDate).toLocaleDateString() : 'N/A'}</td>
                  <td className="px-3 py-2">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
}
