import { Provider } from '@angular/core';
import { SignInRepository } from './domain/repository/sign-in.repository';
import { SignInImplementationRepository } from './data/repository/sign-in-implementation.repository';
import { SignInRemoteDataSource } from './data/data_source/remote/sign-in-remote-datasource';
import { SignInRemoteDataSourceImpl } from './data/data_source/remote/sign-in-remote-datasource-impl';
import { SignInLocalDataSource } from './data/data_source/local/sign-in-local-datasource';
import { SignInLocalDataSourceImpl } from './data/data_source/local/sign-in-local-datasource-impl';
import { SignInUseCase } from './domain/usecase/sign-in.usecase';

export const SIGN_IN_DI_CONTAINER: Provider[] = [
  { provide: SignInRepository, useClass: SignInImplementationRepository },
  { provide: SignInRemoteDataSource, useClass: SignInRemoteDataSourceImpl },
  { provide: SignInLocalDataSource, useClass: SignInLocalDataSourceImpl },
  SignInUseCase,
];
