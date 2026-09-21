import { Component, OnDestroy, OnInit } from '@angular/core';
import { Event, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { RealtimeService } from '@core/services/realtime.service';
import { FooterComponent } from './components/footer/footer.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  imports: [SidebarComponent, NavbarComponent, RouterOutlet, FooterComponent],
})
export class LayoutComponent implements OnInit, OnDestroy {
  private mainContent: HTMLElement | null = null;
  private realtimeSub?: Subscription;

  constructor(
    private router: Router,
    private auth: AuthService,
    private realtime: RealtimeService,
  ) {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        if (this.mainContent) {
          this.mainContent.scrollTop = 0;
        }
      }
    });
  }

  ngOnInit(): void {
    this.mainContent = document.getElementById('main-content');
    this.realtime.start();
    this.realtimeSub = this.realtime.onNotificationCreated().subscribe(() => {
      this.auth.setUnreadNotifications(this.auth.unreadNotifications() + 1);
    });
  }

  ngOnDestroy(): void {
    this.realtimeSub?.unsubscribe();
    this.realtime.stop();
  }
}
