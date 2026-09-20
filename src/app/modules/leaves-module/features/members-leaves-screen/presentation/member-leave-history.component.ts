import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';
import { ROUTE_PATHS } from '@core/navigation/route-paths.const';
import { PageHeaderComponent } from '@shared/component/page-header/page-header.component';
import { StatCardComponent } from '@shared/component/stat-card/stat-card.component';
import { LeaveKind } from '../../my-leaves-screen/domain/entity/my-leaves.entity';
import { MemberLeaveHistory } from '../domain/entity/members-leaves.entity';
import { GetMemberLeaveHistoryUseCase } from '../domain/usecase/get-member-leave-history.usecase';

@Component({
  selector: 'app-member-leave-history',
  imports: [RouterLink, PageHeaderComponent, StatCardComponent],
  templateUrl: './member-leave-history.component.html',
})
export class MemberLeaveHistoryComponent implements OnInit {
  tab: LeaveKind = 'leave';
  readonly membersPath = ROUTE_PATHS.membersLeaves;
  readonly history = signal<MemberLeaveHistory | null>(null);

  constructor(
    private route: ActivatedRoute,
    private historyUseCase: GetMemberLeaveHistoryUseCase,
  ) {}

  ngOnInit(): void {
    const userId = Number(this.route.snapshot.paramMap.get('userId'));
    this.historyUseCase.execute(userId).subscribe({
      next: (row) => this.history.set(row),
      error: (err: Error) => toast.error(err.message),
    });
  }
}
