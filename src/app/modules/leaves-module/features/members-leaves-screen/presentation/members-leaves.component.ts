import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';
import { ROUTE_PATHS } from '@core/navigation/route-paths.const';
import { PageHeaderComponent } from '@shared/component/page-header/page-header.component';
import { TableSkeletonComponent } from '@shared/component/skeleton/table-skeleton.component';
import { MemberLeaveRow } from '../domain/entity/members-leaves.entity';
import { GetMembersLeavesUseCase } from '../domain/usecase/get-members-leaves.usecase';

@Component({
  selector: 'app-members-leaves',
  imports: [PageHeaderComponent, TableSkeletonComponent],
  templateUrl: './members-leaves.component.html',
})
export class MembersLeavesComponent implements OnInit {
  readonly loading = signal(true);
  readonly rows = signal<MemberLeaveRow[]>([]);

  constructor(
    private router: Router,
    private listUseCase: GetMembersLeavesUseCase,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.listUseCase.execute().subscribe({
      next: (rows) => {
        this.rows.set(rows);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.loading.set(false);
        toast.error(err.message);
      },
    });
  }

  open(row: MemberLeaveRow): void {
    void this.router.navigateByUrl(ROUTE_PATHS.memberLeaveHistory(row.id));
  }
}
