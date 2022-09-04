import { Component, OnInit } from '@angular/core';
import { Auth0Service } from '../auth.service';

@Component({
  selector: 'app-firstLogin',
  templateUrl: './firstLogin.component.html',
  styleUrls: ['./firstLogin.component.scss'],
})
export class FirstLoginComponent implements OnInit {
  public profileJson: string | null = null;

  constructor(public auth0: Auth0Service) {}

  ngOnInit(): void {
    this.auth0.user$.subscribe((profile) => {
      console.log(profile);
      this.profileJson = JSON.stringify(profile, null, 2);
    });
  }
}
