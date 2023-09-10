import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Subject, tap } from 'rxjs';
import { Message } from '../chat.service';

@Injectable()
export class ChatNotificationService {
  private clients: Map<string, Subject<any>> = new Map();

  addClient(id: string, req: Request) {
    const subject = new Subject<any>();

    req.on('close', () => {
      this.removeClient(id);
      subject.complete();
    });

    this.clients.set(id, subject);

    return subject.asObservable();
  }

  removeClient(id: string) {
    this.clients.delete(id);
  }

  checkUserConnected(userId: string) {
    return !!this.clients.get(userId);
  }

  sendMessageToUser(userId: string, message: Message) {
    const clientSubject = this.clients.get(userId);
    if (clientSubject) {
      clientSubject.next(JSON.stringify(message));
    }
  }
}
