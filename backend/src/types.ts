export type Status = 'OVERDUE' | 'DUE_SOON' | 'UPCOMING';

export interface InnergyProject {
  id: string;
  name?: string;
  status?: string;
  projectNumber?: string | null;
  plannedStartDate?: string | null;
  plannedEndDate?: string | null;
}

export interface InnergyWorkOrder {
  id: string;
  projectId?: string;
  name?: string;
  plannedStartDate?: string | null;
  plannedEndDate?: string | null;
}

export interface InnergyBudgetMaterial {
  workOrderId?: string | null;
  materialSku?: string;
  materialName?: string;
  quantityRequired?: number;
  unit?: string | null;
  supplier?: string | null;
  leadTimeDays?: number | null;
}

export interface InnergyMaterialLibraryItem {
  materialSku: string;
  name?: string;
  defaultLeadTimeDays?: number | null;
  unit?: string | null;
  supplier?: string | null;
}
