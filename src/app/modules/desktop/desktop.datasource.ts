import { DropListOrientation } from "@angular/cdk/drag-drop";
import { Injectable, signal } from "@angular/core";


@Injectable({ providedIn: 'root' })
export class DesktopDataSource {

  public homeSectionLayout = signal<DropListOrientation>('horizontal');
  public farmSectionLayout = signal<DropListOrientation>('horizontal');

  public selectedTeam = signal('');

  public resetLayouts() {
    this.homeSectionLayout.set('horizontal');
    this.farmSectionLayout.set('horizontal');
  }
}
