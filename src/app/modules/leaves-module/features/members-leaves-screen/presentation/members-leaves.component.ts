import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ROUTE_PATHS } from '@core/navigation/route-paths.const';
import { PageHeaderComponent } from '@shared/component/page-header/page-header.component';
import { MemberLeaveRow } from '../domain/entity/members-leaves.entity';
import { GetMembersLeavesUseCase } from '../domain/usecase/get-members-leaves.usecase';

@Component({
  selector: 'app-members-leaves',
  imports: [PageHeaderComponent],
  templateUrl: './members-leaves.component.html',
})
export class MembersLeavesComponent implements OnInit {
  readonly rows = signal<MemberLeaveRow[]>([]);

  constructor(
    private router: Router,
    private listUseCase: GetMembersLeavesUseCase,
  ) {}

  ngOnInit(): void {
    this.listUseCase.execute().subscribe((rows) => this.rows.set(rows));
  }

  open(row: MemberLeaveRow): void {
    void this.router.navigateByUrl(ROUTE_PATHS.memberLeaveHistory(row.id));
  }
}
