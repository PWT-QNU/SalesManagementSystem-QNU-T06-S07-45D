import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Services {
  public readonly apiUrl: string = 'http://localhost:8080';
}
