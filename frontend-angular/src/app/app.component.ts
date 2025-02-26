import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {CarouselComponent} from "./carousel/carousel.component";
import {AddAssignmentModalComponent} from "./add-assignment-modal/add-assignment-modal.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CarouselComponent, AddAssignmentModalComponent,RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'frontend-angular';
}
