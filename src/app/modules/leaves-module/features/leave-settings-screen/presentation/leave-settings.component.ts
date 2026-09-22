import { Component, OnInit, inject, signal } from '@angular/core';
import { toast } from 'ngx-sonner';
import { PermissionCodes } from '@core/models/permission-codes';
import { API } from '@core/network/api/api.const';
import { NetworkService } from '@core/network/network.service';
import { AuthService } from '@core/services/auth.service';
import { PageHeaderComponent } from '@shared/component/page-header/page-header.component';
import { TableSkeletonComponent } from '@shared/component/skeleton/table-skeleton.component';

export interface LeaveSettingsView {
  fromNextBalanceMaxDays: number;
  fromNextBalanceStartDate: string;
  fromNextBalanceEndDate: string;
  emergencyBlackoutCutoffDate: string;
  resetDate: string;
  emergencyAllowedToday: boolean;
  fromNextWindowActiveToday: boolean;
}

@Component({
  selector: 'app-leave-settings',
  imports: [PageHeaderComponent, TableSkeletonComponent],
  templateUrl: './leave-settings.component.html',
})
export class LeaveSettingsComponent implements OnInit {
  private readonly network = inject(NetworkService);
  private readonly auth = inject(AuthService);

  readonly loading = signal(true);
  readonly settings = signal<LeaveSettingsView | null>(null);
  readonly canManage = this.auth.hasPermission(PermissionCodes.HrLeave.Manage);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.network.get<LeaveSettingsView>(API.Leaves.Settings).subscribe({
      next: (settings) => {
        this.settings.set(settings);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.loading.set(false);
        toast.error(err.message);
      },
    });
  }

  formatDate(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
  }
}
