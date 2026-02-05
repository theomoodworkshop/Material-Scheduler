import { ScheduleEvent } from '../types';

interface Props {
  event: ScheduleEvent | null;
  onClose: () => void;
}

export default function EventModal({ event, onClose }: Props) {
  if (!event) return null;
  const { extendedProps } = event;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-start justify-between">
          <h2 className="text-xl font-semibold">Material Requirement</h2>
          <button className="text-gray-500" onClick={onClose}>✕</button>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <p><strong>Project:</strong> {extendedProps.projectName}</p>
          <p><strong>Work Order:</strong> {extendedProps.workOrderName || 'N/A'}</p>
          <p><strong>SKU:</strong> {extendedProps.materialSku}</p>
          <p><strong>Name:</strong> {extendedProps.materialName || 'N/A'}</p>
          <p><strong>Quantity:</strong> {extendedProps.quantityRequired} {extendedProps.unit || ''}</p>
          <p><strong>Supplier:</strong> {extendedProps.supplier || 'N/A'}</p>
          <p><strong>Lead Time:</strong> {extendedProps.leadTimeDays} days</p>
          <p><strong>Required On:</strong> {extendedProps.requiredOnDate ? new Date(extendedProps.requiredOnDate).toLocaleDateString() : 'N/A'}</p>
          <p><strong>Recommended Order:</strong> {extendedProps.recommendedOrderDate ? new Date(extendedProps.recommendedOrderDate).toLocaleDateString() : 'N/A'}</p>
          <p>
            <strong>Status:</strong>{' '}
            <span className="rounded bg-gray-100 px-2 py-1 text-xs">{extendedProps.status}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
