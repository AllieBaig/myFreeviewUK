import { get, set } from 'idb-keyval';
import { Programme, generateMockSchedule } from '../types';

const SCHEDULE_KEY = 'freeview_schedule_cache';
const CACHE_DATE_KEY = 'freeview_cache_date';

export const getTodaysSchedule = async (): Promise<Programme[]> => {
  const today = new Date().toDateString();
  const cachedDate = await get<string>(CACHE_DATE_KEY);
  
  if (cachedDate === today) {
    const cachedData = await get<Programme[]>(SCHEDULE_KEY);
    if (cachedData) {
      console.log('Serving schedule from offline cache');
      return cachedData;
    }
  }

  // If no cache or cache is old, fetch/generate new data
  console.log('Fetching new schedule data');
  const newSchedule = generateMockSchedule();
  
  // Save to cache
  await set(SCHEDULE_KEY, newSchedule);
  await set(CACHE_DATE_KEY, today);
  
  return newSchedule;
};

export const clearCache = async () => {
  await set(SCHEDULE_KEY, null);
  await set(CACHE_DATE_KEY, null);
};
