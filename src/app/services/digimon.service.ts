import { Injectable } from "@angular/core";
import { Digimon } from "../core/interfaces/digimon.interface";

@Injectable({
  providedIn: 'root'
})
export class DigimonService {

  baseDigimonData!: Digimon[];

  constructor() {
    this.initializeBaseDigimonData();
  }

  private async initializeBaseDigimonData() {
    this.baseDigimonData = await fetch('database/base-digimon-list.json').then(res => res.json());
  }

  getBaseDigimonDataBySeed(seed: string) {
    return this.baseDigimonData.find(digimon => digimon.seed === seed);
  }
}
