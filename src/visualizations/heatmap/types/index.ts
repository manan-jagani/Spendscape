export interface HeatmapCell {
  date: string;
  value: number;
  dayOfWeek: number;
  week: number;
  month: number;
}

export interface HeatmapMonth {
  label: string;
  weekOffset: number;
  weekCount: number;
}
