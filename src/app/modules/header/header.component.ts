import { Component, OnInit } from '@angular/core';
import { Auth0Service } from '../auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  constructor(public auth0: Auth0Service) {}

  ngOnInit() {}
}
