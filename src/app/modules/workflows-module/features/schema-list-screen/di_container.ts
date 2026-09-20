import { Provider } from '@angular/core';
import { SchemaListRepository } from './domain/repository/schema-list.repository';
import { SchemaListImplementationRepository } from './data/repository/schema-list-implementation.repository';
import { SchemaListRemoteDataSource } from './data/data_source/remote/schema-list-remote-datasource';
import { SchemaListRemoteDataSourceImpl } from './data/data_source/remote/schema-list-remote-datasource-impl';
import { SchemaListLocalDataSource } from './data/data_source/local/schema-list-local-datasource';
import { SchemaListLocalDataSourceImpl } from './data/data_source/local/schema-list-local-datasource-impl';
import { SchemaListUseCase } from './domain/usecase/schema-list.usecase';
import { SaveSchemaUseCase } from './domain/usecase/save-schema.usecase';
import { ArchiveSchemaUseCase } from './domain/usecase/archive-schema.usecase';
import { SchemaTypesUseCase } from './domain/usecase/schema-types.usecase';
import { SchemaTaskBankUseCase } from './domain/usecase/schema-task-bank.usecase';
import { SchemaGraphUseCase } from './domain/usecase/schema-graph.usecase';
import { SaveNodeUseCase } from './domain/usecase/save-node.usecase';
import { ArchiveNodeUseCase } from './domain/usecase/archive-node.usecase';
import { SaveStepUseCase } from './domain/usecase/save-step.usecase';
import { ArchiveStepUseCase } from './domain/usecase/archive-step.usecase';

export const SCHEMA_LIST_DI_CONTAINER: Provider[] = [
  { provide: SchemaListRepository, useClass: SchemaListImplementationRepository },
  { provide: SchemaListRemoteDataSource, useClass: SchemaListRemoteDataSourceImpl },
  { provide: SchemaListLocalDataSource, useClass: SchemaListLocalDataSourceImpl },
  SchemaListUseCase,
  SaveSchemaUseCase,
  ArchiveSchemaUseCase,
  SchemaTypesUseCase,
  SchemaTaskBankUseCase,
  SchemaGraphUseCase,
  SaveNodeUseCase,
  ArchiveNodeUseCase,
  SaveStepUseCase,
  ArchiveStepUseCase,
];
