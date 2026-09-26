import { LoStats } from '@core/network/ticket-stats.service';

export interface ReportSubjectStatsRow {
  id: number;
  name: string;
  folderPath: string;
  year: string;
  term: string;
  idle: number;
  running: number;
  done: number;
  total: number;
  progressPercent: number;
}

export function mergeSubjectStats(
  catalog: { id: number; name: string; folderPath: string; year: string; term: string; progressPercent: number },
  loStats?: LoStats,
  progressPercent?: number,
): ReportSubjectStatsRow {
  const stats = loStats ?? { idle: 0, running: 0, done: 0, total: 0 };
  const progress = progressPercent ?? (stats.total ? Math.round((stats.done / stats.total) * 100) : catalog.progressPercent);
  return {
    id: catalog.id,
    name: catalog.name,
    folderPath: catalog.folderPath,
    year: catalog.year,
    term: catalog.term,
    idle: stats.idle,
    running: stats.running,
    done: stats.done,
    total: stats.total,
    progressPercent: progress,
  };
}
