import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-drawer',
  standalone: true,
  templateUrl: './drawer.component.html',
  styleUrl: './drawer.component.css',
})
export class DrawerComponent {
  open  = input(false);
  title = input('');

  closed = output<void>();

  closeHovered = signal(false);
}
