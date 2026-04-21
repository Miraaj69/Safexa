// Equipment Master Data - PM Schedule
// Source: Firefighting and Safety Equipment PM Schedule AVTL 2, 3 & CRL 3

export const EQUIPMENTS = [
  { id: 'E01', name: 'DCP Extinguisher BC Type 10KG', checklistNo: 'PM/CHKLST/SHE/001', freq: 'Q', icon: '🧯', category: 'Fire' },
  { id: 'E02', name: 'CO2 Extinguisher BC Type 4.5KG', checklistNo: 'PM/CHKLST/SHE/002', freq: 'Q', icon: '🧯', category: 'Fire' },
  { id: 'E03', name: 'Water Foam Monitor', checklistNo: 'PM/CHKLST/SHE/003', freq: 'Q', icon: '💧', category: 'Fire' },
  { id: 'E04', name: 'Double Hydrant', checklistNo: 'PM/CHKLST/SHE/004', freq: 'Q', icon: '🚿', category: 'Fire' },
  { id: 'E05', name: 'Hose Box', checklistNo: 'PM/CHKLST/SHE/005', freq: 'Q', icon: '📦', category: 'Fire' },
  { id: 'E06', name: 'Sprinkler System', checklistNo: 'PM/CHKLST/SHE/006', freq: 'Q', icon: '💦', category: 'Fire' },
  { id: 'E07', name: 'Foam System', checklistNo: 'PM/CHKLST/SHE/007', freq: 'Y', icon: '🫧', category: 'Fire' },
  { id: 'E08', name: 'Emergency Siren', checklistNo: 'PM/CHKLST/SHE/008', freq: 'M', icon: '🚨', category: 'Emergency' },
  { id: 'E09', name: 'First Aid Box', checklistNo: 'PM/CHKLST/SHE/009', freq: 'M', icon: '🏥', category: 'Medical' },
  { id: 'E10', name: 'Emergency Safety Shower', checklistNo: 'PM/CHKLST/SHE/010', freq: 'W', icon: '🚿', category: 'Emergency' },
  { id: 'E11', name: 'Manual Call Point Zone', checklistNo: 'PM/CHKLST/SHE/011', freq: 'W', icon: '📞', category: 'Fire' },
  { id: 'E12', name: 'Fall Arrester System', checklistNo: 'PM/CHKLST/SHE/012', freq: 'M', icon: '🔒', category: 'Safety' },
  { id: 'E13', name: 'Safety Harness', checklistNo: 'PM/CHKLST/SHE/013', freq: 'M', icon: '🦺', category: 'Safety' },
  { id: 'E14', name: 'Self Contained Breathing Apparatus', checklistNo: 'PM/CHKLST/SHE/014', freq: 'M', icon: '😷', category: 'Safety' },
  { id: 'E15', name: 'Wind Indicator', checklistNo: 'PM/CHKLST/SHE/015', freq: 'M', icon: '🌬️', category: 'Environment' },
];

// Frequency labels
export const FREQ_LABELS = {
  W: 'Weekly',
  M: 'Monthly',
  Q: 'Quarterly',
  Y: 'Yearly',
};

// Task status
export const TASK_STATUS = {
  PENDING: 'pending',
  DONE: 'done',
  OVERDUE: 'overdue',
};
