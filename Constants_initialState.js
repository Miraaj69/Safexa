import { CHECKLISTS, PLANTS, TASK_STATUS } from './Constants_data';
import dayjs from 'dayjs';

// Build default schedule config: each plant x each checklist
export const buildDefaultScheduleConfig = () => {
  const configs = [];
  PLANTS.forEach(plant => {
    CHECKLISTS.forEach(cl => {
      configs.push({
        id:                `sc_${plant.id}_${cl.id}`,
        plantId:           plant.id,
        checklistId:       cl.id,
        frequencyOverride: null,       // null = use default
        customMonth:       null,
        customWeek:        null,
        isAuto:            true,
      });
    });
  });
  return configs;
};

export const initialState = {
  tasks:           [],
  scheduleConfigs: buildDefaultScheduleConfig(),
  plants:          PLANTS,
  checklists:      CHECKLISTS,
  lastSynced:      null,
};
