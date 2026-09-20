import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '@shared/component/page-header/page-header.component';
import { ProjectRootEntity } from '../domain/entity/project-list.entity';
import { ProjectListUseCase } from '../domain/usecase/project-list.usecase';

@Component({
  selector: 'app-project-list',
  imports: [FormsModule, PageHeaderComponent],
  templateUrl: './project-list.component.html',
})
export class ProjectListComponent implements OnInit {
  search = '';
  readonly rows = signal<ProjectRootEntity[]>([]);

  constructor(private projectListUseCase: ProjectListUseCase) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.projectListUseCase.execute({ search: this.search }).subscribe((rows) => this.rows.set(rows));
  }
}
