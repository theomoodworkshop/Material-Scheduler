export type MaterialStatus = 'OVERDUE' | 'DUE_SOON' | 'UPCOMING';

export interface ScheduleEvent {
  id: number;
  title: string;
  date: string;
  backgroundColor: string;
  extendedProps: {
    projectId: string;
    projectName: string;
    workOrderName: string | null;
    materialSku: string;
    materialName: string | null;
    quantityRequired: number;
    unit: string | null;
    supplier: string | null;
    leadTimeDays: number;
    requiredOnDate: string | null;
    recommendedOrderDate: string | null;
    status: MaterialStatus;
  };
}

export interface Project {
  id: string;
  name: string;
}
