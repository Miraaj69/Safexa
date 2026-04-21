export const PLANTS = [
  { id: 'p1', name: 'Tank Farm A',    code: 'TFA', color: '#4F7CFF' },
  { id: 'p2', name: 'Tank Farm B',    code: 'TFB', color: '#22C55E' },
  { id: 'p3', name: 'Pump House',     code: 'PH',  color: '#F59E0B' },
  { id: 'p4', name: 'Loading Bay',    code: 'LB',  color: '#A855F7' },
  { id: 'p5', name: 'Fire Station',   code: 'FS',  color: '#EF4444' },
  { id: 'p6', name: 'Control Room',   code: 'CR',  color: '#06B6D4' },
  { id: 'p7', name: 'Utility Block',  code: 'UB',  color: '#F97316' },
];

export const FREQUENCIES = {
  DAILY:     { id: 'daily',     label: 'Daily',     days: 1   },
  WEEKLY:    { id: 'weekly',    label: 'Weekly',    days: 7   },
  MONTHLY:   { id: 'monthly',   label: 'Monthly',   days: 30  },
  QUARTERLY: { id: 'quarterly', label: 'Quarterly', days: 90  },
  YEARLY:    { id: 'yearly',    label: 'Yearly',    days: 365 },
};

export const CHECKLISTS = [
  { id: 'c1',  no: 'CL-001', name: 'Fire Extinguisher Inspection',    defaultFreq: 'monthly'   },
  { id: 'c2',  no: 'CL-002', name: 'Hydrant System Check',            defaultFreq: 'weekly'    },
  { id: 'c3',  no: 'CL-003', name: 'LOTO Procedure Audit',            defaultFreq: 'monthly'   },
  { id: 'c4',  no: 'CL-004', name: 'Confined Space Entry Permit',     defaultFreq: 'weekly'    },
  { id: 'c5',  no: 'CL-005', name: 'PPE Compliance Check',            defaultFreq: 'weekly'    },
  { id: 'c6',  no: 'CL-006', name: 'Electrical Panel Inspection',     defaultFreq: 'quarterly' },
  { id: 'c7',  no: 'CL-007', name: 'Emergency Exit Audit',            defaultFreq: 'monthly'   },
  { id: 'c8',  no: 'CL-008', name: 'Chemical Storage Inspection',     defaultFreq: 'weekly'    },
  { id: 'c9',  no: 'CL-009', name: 'Pump & Valve Integrity Check',    defaultFreq: 'monthly'   },
  { id: 'c10', no: 'CL-010', name: 'HIRA Review',                     defaultFreq: 'quarterly' },
  { id: 'c11', no: 'CL-011', name: 'Mock Drill Execution',            defaultFreq: 'quarterly' },
  { id: 'c12', no: 'CL-012', name: 'Permit to Work Audit',            defaultFreq: 'weekly'    },
  { id: 'c13', no: 'CL-013', name: 'Safety Signage Inspection',       defaultFreq: 'monthly'   },
  { id: 'c14', no: 'CL-014', name: 'Spill Kit Readiness Check',       defaultFreq: 'monthly'   },
  { id: 'c15', no: 'CL-015', name: 'Annual Safety Audit',             defaultFreq: 'yearly'    },
  { id: 'c16', no: 'CL-016', name: 'Tank Integrity Inspection',       defaultFreq: 'quarterly' },
  { id: 'c17', no: 'CL-017', name: 'Earthing & Bonding Check',        defaultFreq: 'quarterly' },
  { id: 'c18', no: 'CL-018', name: 'First Aid Kit Inspection',        defaultFreq: 'monthly'   },
];

export const TASK_STATUS = {
  PENDING:   'pending',
  COMPLETED: 'completed',
  OVERDUE:   'overdue',
};

export const WEEKS = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
export const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
