import { Provider } from '@angular/core';
import { SectionListRepository } from './domain/repository/section-list.repository';
import { SectionListImplementationRepository } from './data/repository/section-list-implementation.repository';
import { SectionListRemoteDataSource } from './data/data_source/remote/section-list-remote-datasource';
import { SectionListRemoteDataSourceImpl } from './data/data_source/remote/section-list-remote-datasource-impl';
import { SectionListLocalDataSource } from './data/data_source/local/section-list-local-datasource';
import { SectionListLocalDataSourceImpl } from './data/data_source/local/section-list-local-datasource-impl';
import { SectionListUseCase } from './domain/usecase/section-list.usecase';
import { SaveSectionUseCase } from './domain/usecase/save-section.usecase';
import { ArchiveSectionUseCase } from './domain/usecase/archive-section.usecase';
import { SectionFormOptionsUseCase } from './domain/usecase/section-form-options.usecase';

export const SECTION_LIST_DI_CONTAINER: Provider[] = [
  { provide: SectionListRepository, useClass: SectionListImplementationRepository },
  { provide: SectionListRemoteDataSource, useClass: SectionListRemoteDataSourceImpl },
  { provide: SectionListLocalDataSource, useClass: SectionListLocalDataSourceImpl },
  SectionListUseCase,
  SaveSectionUseCase,
  ArchiveSectionUseCase,
  SectionFormOptionsUseCase,
];
