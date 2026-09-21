import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { RealtimeMessage } from '../api/tms-contracts';
import { TOKEN_KEY } from './auth.service';

export const REALTIME_EVENTS = {
  TicketUpdated: 'ticket.updated',
  NotificationCreated: 'notification.created',
} as const;

const RECORD_SEPARATOR = '\u001e';

interface NegotiateResponse {
  connectionId?: string;
  connectionToken?: string;
  availableTransports?: { transport: string }[];
}

@Injectable({ providedIn: 'root' })
export class RealtimeService implements OnDestroy {
  private socket?: WebSocket;
  private readonly messages = new Subject<RealtimeMessage>();
  private joined = new Set<string>();
  private started = false;
  private invocationId = 0;

  readonly messages$ = this.messages.asObservable();

  start(): void {
    if (this.started) {
      return;
    }
    this.started = true;
    void this.connect();
  }

  stop(): void {
    this.started = false;
    this.joined.clear();
    this.socket?.close();
    this.socket = undefined;
  }

  joinTicketBoard(learningObjectiveIds: number[]): void {
    const next = new Set(learningObjectiveIds.map((id) => `tickets-lo-${id}`));
    for (const group of this.joined) {
      if (!next.has(group)) {
        this.invoke('LeaveGroup', group);
        this.joined.delete(group);
      }
    }
    for (const group of next) {
      if (!this.joined.has(group)) {
        this.invoke('JoinGroup', group);
        this.joined.add(group);
      }
    }
  }

  onTicketUpdated(): Observable<RealtimeMessage> {
    return this.ofEvent(REALTIME_EVENTS.TicketUpdated);
  }

  onNotificationCreated(): Observable<RealtimeMessage> {
    return this.ofEvent(REALTIME_EVENTS.NotificationCreated);
  }

  ngOnDestroy(): void {
    this.stop();
    this.messages.complete();
  }

  private ofEvent(eventName: string): Observable<RealtimeMessage> {
    return new Observable((subscriber) => {
      const sub = this.messages$.subscribe((message) => {
        if (message.eventName === eventName) {
          subscriber.next(message);
        }
      });
      return () => sub.unsubscribe();
    });
  }

  private async connect(): Promise<void> {
    try {
      const token = localStorage.getItem(TOKEN_KEY) ?? '';
      const negotiate = await fetch('/realtime/negotiate?negotiateVersion=1', {
        method: 'POST',
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!negotiate.ok) {
        this.started = false;
        return;
      }
      const body = (await negotiate.json()) as NegotiateResponse;
      const connectionToken = body.connectionToken ?? body.connectionId ?? '';
      const params = new URLSearchParams({ id: connectionToken });
      if (token) {
        params.set('access_token', token);
      }
      const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
      const socket = new WebSocket(`${protocol}//${location.host}/realtime?${params.toString()}`);
      this.socket = socket;
      socket.addEventListener('open', () => {
        socket.send(`{"protocol":"json","version":1}${RECORD_SEPARATOR}`);
        for (const group of this.joined) {
          this.invoke('JoinGroup', group);
        }
      });
      socket.addEventListener('message', (event) => this.handleFrame(String(event.data)));
      socket.addEventListener('close', () => {
        this.socket = undefined;
        if (this.started) {
          window.setTimeout(() => void this.connect(), 3000);
        }
      });
    } catch {
      this.started = false;
    }
  }

  private handleFrame(raw: string): void {
    for (const chunk of raw.split(RECORD_SEPARATOR)) {
      if (!chunk) {
        continue;
      }
      try {
        const frame = JSON.parse(chunk) as { type?: number; target?: string; arguments?: unknown[] };
        if (frame.type === 1 && frame.target && Array.isArray(frame.arguments) && frame.arguments[0]) {
          const payload = frame.arguments[0] as RealtimeMessage;
          if (payload?.eventName) {
            this.messages.next(payload);
          } else {
            this.messages.next({ eventName: frame.target, kind: 0, payload });
          }
        }
      } catch {
        /* ignore malformed frames */
      }
    }
  }

  private invoke(method: 'JoinGroup' | 'LeaveGroup', group: string): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }
    this.invocationId += 1;
    this.socket.send(
      `${JSON.stringify({
        type: 1,
        invocationId: String(this.invocationId),
        target: method,
        arguments: [group],
      })}${RECORD_SEPARATOR}`,
    );
  }
}
