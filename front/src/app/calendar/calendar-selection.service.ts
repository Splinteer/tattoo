import { Injectable, computed, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { map, shareReplay, switchMap, tap } from 'rxjs';

type CalendarFilter = 'proposal' | 'selection';

@Injectable({
  providedIn: 'root',
})
export class CalendarSelectionService {
  limit: number | false = false;

  isActive = signal<CalendarFilter | false>(false);

  selectionObject = signal<{ [eventId: string]: true }>({});
  selectionObject$ = toObservable(this.selectionObject).pipe(shareReplay());

  selection$ = toObservable(this.isActive).pipe(
    // tap(() => this.reset()),
    switchMap(() => this.selectionObject$),
    map((selectionObject) => Object.keys(selectionObject).sort()),
    shareReplay()
  );

  add(eventId: string) {
    this.selectionObject.update((events) => {
      if (
        this.limit === Object.keys(events).length &&
        Object.keys(events).length
      ) {
        delete events[Object.keys(events).at(-1) as string];
      }

      return {
        ...events,
        [eventId]: true,
      };
    });
  }

  remove(eventId: string) {
    this.selectionObject.update((events) => {
      delete events[eventId];

      return events;
    });
  }

  toggle(eventId: string) {
    const events = this.selectionObject();
    if (eventId in events) {
      this.remove(eventId);
    } else {
      this.add(eventId);
    }
  }

  reset() {
    this.selectionObject.set({});
  }

  setEditMode(value: CalendarFilter | false) {
    this.isActive.set(value);

    this.limit = value === 'proposal' ? 1 : false;
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
