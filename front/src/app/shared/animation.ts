import {
  AnimationTriggerMetadata,
  trigger,
  transition,
  style,
  animate,
  state,
  keyframes,
} from '@angular/animations';

export function FadeIn(
  timingIn: number,
  height: boolean = false
): AnimationTriggerMetadata {
  return trigger('fadeIn', [
    transition(':enter', [
      style(height ? { opacity: 0, height: 0 } : { opacity: 0 }),
      animate(
        timingIn,
        style(height ? { opacity: 1, height: 'fit-content' } : { opacity: 1 })
      ),
    ]),
  ]);
}

export function slideDown(timingIn: number): AnimationTriggerMetadata {
  return trigger('slideDown', [
    state('void', style({ height: 0, overflow: 'hidden' })),
    state('*', style({ height: '*', overflow: 'hidden' })),
    transition('void <=> *', animate(timingIn + 'ms ease-in-out')),
  ]);
}

export function backInDown(
  timing: string | number = 200
): AnimationTriggerMetadata {
  return trigger('backInDown', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translate3d(0, -30px, 0)' }),
      animate(
        timing,
        style({
          opacity: 1,
          transform: 'translate3d(0, 0, 0)',
        })
      ),
    ]),
  ]);
}
