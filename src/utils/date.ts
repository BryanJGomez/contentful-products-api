import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

export function getStartOfDayUTC(dateString: string): Date {
  return dayjs(dateString).startOf('day').utc().toDate();
}

export function getEndOfDayUTC(dateString: string): Date {
  return dayjs(dateString).endOf('day').utc().toDate();
}

export function createDateRange(startDate?: string, endDate?: string) {
  return {
    startDate: getStartOfDayUTC(startDate || new Date().toISOString()),
    endDate: getEndOfDayUTC(endDate || new Date().toISOString()),
  };
}
