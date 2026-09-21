import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = resolve(
  here,
  '../../TaskManagementSystem_Refactor/TaskManagementSystem/src/Api/TaskManagementSystem.Api/openapi/tms-openapi.json',
);
const targetDir = resolve(here, '../src/app/core/api');
const target = resolve(targetDir, 'tms-openapi.json');

mkdirSync(targetDir, { recursive: true });
copyFileSync(source, target);
console.log(`Synced OpenAPI contract to ${target}`);
