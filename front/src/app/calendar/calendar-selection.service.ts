import { Injectable, computed, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { map, shareReplay, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CalendarSelectionService {
  isActive = signal(false);

  selectionObject = signal<{ [eventId: string]: true }>({});
  selectionObject$ = toObservable(this.selectionObject).pipe(shareReplay());

  selection$ = toObservable(this.isActive).pipe(
    // tap(() => this.reset()),
    switchMap(() => this.selectionObject$),
    map((selectionObject) => Object.keys(selectionObject).sort()),
    shareReplay()
  );

  add(eventId: string) {
    this.selectionObject.update((events) => ({
      ...events,
      [eventId]: true,
    }));
  }

  remove(eventId: string) {
    this.selectionObject.update((events) => {
      delete events[eventId];

      return events;
    });
  }

  toggle(eventId: string) {
    this.selectionObject.update((events) => {
      eventId in events ? delete events[eventId] : (events[eventId] = true);

      return events;
    });
  }

  reset() {
    console.log('reset');
    this.selectionObject.set({});
  }

  setEditMode(value: boolean) {
    this.isActive.set(value);
  }

  set(value: string[]) {
    const objectValue = value.reduce((previous, current) => {
      return {
        ...previous,
        [current]: true,
      };
    }, {});

    this.selectionObject.set(objectValue);
  }
}
