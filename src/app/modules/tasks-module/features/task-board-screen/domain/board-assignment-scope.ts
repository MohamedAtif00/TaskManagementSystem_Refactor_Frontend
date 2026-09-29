export interface AssignmentLink {
  userId: number | null;
  learningObjectiveId: number;
}

export interface AssignmentObjective {
  id: number;
  name: string;
}

export interface AssignmentTask {
  userId: number | null;
}

export function learningObjectivesForAssignment<T extends AssignmentObjective>(
  objectives: T[],
  links: AssignmentLink[] | null,
  assigneeIds: number[],
  unassigned: boolean,
): T[] {
  if ((!assigneeIds.length && !unassigned) || links == null) {
    return objectives;
  }
  const related = new Set<number>();
  for (const link of links) {
    const matchesPerson = link.userId != null && assigneeIds.includes(link.userId);
    const matchesOpen = unassigned && link.userId == null;
    if (matchesPerson || matchesOpen) {
      related.add(link.learningObjectiveId);
    }
  }
  return objectives.filter((objective) => related.has(objective.id));
}

export function pruneLearningObjectiveIds(selected: number[], visible: AssignmentObjective[]): number[] {
  const visibleIds = new Set(visible.map((objective) => objective.id));
  return selected.filter((id) => visibleIds.has(id));
}

export function taskMatchesAssignment(task: AssignmentTask, assigneeIds: number[], unassigned: boolean): boolean {
  if (!assigneeIds.length && !unassigned) {
    return true;
  }
  const assigned = task.userId != null && assigneeIds.includes(task.userId);
  return assigned || (unassigned && task.userId == null);
}
