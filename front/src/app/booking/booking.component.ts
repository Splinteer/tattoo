import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  inject,
  OnInit,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FormStepperComponent } from '@app/shared/form-stepper/form-stepper.component';
import { Shop, ShopService } from '@app/shop/shop.service';
import { Observable, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingComponent implements OnInit {
  @ViewChild('stepper') stepper: FormStepperComponent | undefined;

  private readonly route = inject(ActivatedRoute);

  private readonly shopService = inject(ShopService);

  public readonly form = new FormGroup({
    'first-step': new FormGroup({
      types: new FormControl<string[]>(['flashs'], [Validators.required]),
      is_first_tattoo: new FormControl<boolean>(false),
      is_cover_up: new FormControl<boolean>(false),
      is_post_operation_or_over_scar: new FormControl<boolean>(false),
      shop_conditions:
        new FormControl<string>(`✧ Bienvenue et merci de t'intéresser à mon travail ! ✧


      Ce formulaire est une aide précieuse pour la réalisation de ton projet, réfléchis y bien et prends le temps de donner les informations les plus précises possible,

      Penses à joindre a ton projet, une photo de la zone que tu souhaites tatouer délimitée (celle ci m'aide à réaliser un dessin adapté à la zone et a la bonne taille!) ainsi que des photos d'inspiration (pour le style, la composition, et tout ce que tu peux trouver utile !)

      A noter :

      ✧ Je ne tattoo que les personnes majeures
      ✧ Je ne tattoo pas les doigts, l'intérieur des lèvres, les pieds et les parties génitales
      ✧ Les couleurs actuellement disponibles sont les noirs et gris, blanc et rouge
      ✧ Les projets sur mesure sont dessinés uniquement pour vous, je ne réalise pas de designs issus d'un autre artiste/tatoueur, à l'exception des réalisations libre de droit, culture pop ou d'un artiste ayant donné son autorisation écrite

      Je ne réalise que les projets qui rentrent dans mon univers, m'inspirent et que je me sens capable de réaliser. Tu recevras une réponse en cas de refus, avec une redirection vers un artiste qui correspond a projet si possible !


      ✧ A bientôt ! ✧`),
      conditions: new FormControl<boolean>(false, Validators.requiredTrue),
    }),
  });

  public readonly steps = [
    {
      formGroup: 'first-step',
      title: 'Premier pas',
      stepControl: this.form.get('first-step')!.get('is_first_tattoo')!, // dumb to avoid template complexity
    },
    {
      formGroup: 'first-second',
      title: 'Détails',
      stepControl: this.form.get('first-step')!,
    },
    {
      formGroup: 'first-second',
      title: 'Emplacement',
      stepControl: this.form.get('first-step')!,
    },
    {
      formGroup: 'first-second',
      title: 'Flashs',
      stepControl: this.form.get('first-step')!,
    },
    {
      formGroup: 'first-second',
      title: 'Information personnelles',
      stepControl: this.form.get('first-step')!,
    },
  ];

  public readonly shop$: Observable<Shop> = this.route.params.pipe(
    switchMap(({ shopUrl }) => this.shopService.getByUrl(shopUrl)),
    tap((shop) => {
      this.form
        .get('first-step')
        ?.get('shop_conditions')
        ?.setValue(shop.description, { emitEvent: false }); // TODO
    })
  );

  ngOnInit() {
    this.form
      .get('first-step')
      ?.valueChanges.subscribe((value) => console.log(value));
  }

  onSubmit() {
    if (
      !this.stepper?.steps.get(this.stepper.selectedIndex + 1) ||
      this.stepper.steps.get(this.stepper.selectedIndex + 1)?.stepControl.valid
    ) {
      this.stepper?.next();
    }
  }
}
