import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  learningObjectivesForAssignment,
  pruneLearningObjectiveIds,
  taskMatchesAssignment,
} from './board-assignment-scope.ts';

const objectives = [
  { id: 1, name: 'Fractions' },
  { id: 2, name: 'Decimals' },
  { id: 3, name: 'Geometry' },
];

const links = [
  { userId: 10, learningObjectiveId: 1 },
  { userId: 11, learningObjectiveId: 2 },
  { userId: 10, learningObjectiveId: 2 },
  { userId: null, learningObjectiveId: 3 },
];

const tasks = [
  { id: 1, userId: 10 },
  { id: 2, userId: 11 },
  { id: 3, userId: null },
];

describe('learning objective assignment scope', () => {
  it('shows every objective when nobody and Unassigned are selected', () => {
    assert.deepEqual(
      learningObjectivesForAssignment(objectives, links, [], false).map((objective) => objective.id),
      [1, 2, 3],
    );
  });

  it('shows only the objectives related to one person', () => {
    assert.deepEqual(
      learningObjectivesForAssignment(objectives, links, [10], false).map((objective) => objective.id),
      [1, 2],
    );
  });

  it('shows the union of objectives for two people', () => {
    assert.deepEqual(
      learningObjectivesForAssignment(objectives, links, [10, 11], false).map((objective) => objective.id),
      [1, 2],
    );
  });

  it('shows objectives that have an unassigned task', () => {
    assert.deepEqual(
      learningObjectivesForAssignment(objectives, links, [], true).map((objective) => objective.id),
      [3],
    );
  });

  it('unions a person with Unassigned', () => {
    assert.deepEqual(
      learningObjectivesForAssignment(objectives, links, [10], true).map((objective) => objective.id),
      [1, 2, 3],
    );
  });

  it('keeps every objective when the task links have not loaded', () => {
    assert.deepEqual(
      learningObjectivesForAssignment(objectives, null, [10], false).map((objective) => objective.id),
      [1, 2, 3],
    );
  });

  it('drops a selected objective the chosen people do not have', () => {
    const visible = learningObjectivesForAssignment(objectives, links, [10], false);
    assert.deepEqual(pruneLearningObjectiveIds([1, 3], visible), [1]);
  });
});

describe('task assignment matching', () => {
  it('keeps every task when nobody and Unassigned are selected', () => {
    assert.deepEqual(
      tasks.filter((task) => taskMatchesAssignment(task, [], false)).map((task) => task.id),
      [1, 2, 3],
    );
  });

  it('keeps only tasks for the selected people', () => {
    assert.deepEqual(
      tasks.filter((task) => taskMatchesAssignment(task, [10, 11], false)).map((task) => task.id),
      [1, 2],
    );
  });

  it('keeps selected people and unassigned tasks when Unassigned is on', () => {
    assert.deepEqual(
      tasks.filter((task) => taskMatchesAssignment(task, [10], true)).map((task) => task.id),
      [1, 3],
    );
  });
});
