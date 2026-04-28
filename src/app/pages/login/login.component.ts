import { Component, signal, computed, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { NgStyle } from '@angular/common';
import { AppStateService } from '../../core/services/app-state.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, NgStyle],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private router = inject(Router);
  private state = inject(AppStateService);

  email = signal('');
  password = signal('');
  emailFocused = signal(false);
  passFocused = signal(false);
  submitHovered = signal(false);

  emailInputStyle = computed(() => ({
    width: '100%',
    boxSizing: 'border-box',
    background: '#0a0a0a',
    border: `1px solid ${this.emailFocused() ? '#ffffff' : '#2a2a2a'}`,
    color: '#ffffff',
    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
    fontSize: '13px',
    padding: '8px 10px',
    outline: 'none',
    letterSpacing: '0.04em',
    transition: 'border-color 100ms',
  }));

  passInputStyle = computed(() => ({
    width: '100%',
    boxSizing: 'border-box',
    background: '#0a0a0a',
    border: `1px solid ${this.passFocused() ? '#ffffff' : '#2a2a2a'}`,
    color: '#ffffff',
    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
    fontSize: '13px',
    padding: '8px 10px',
    outline: 'none',
    letterSpacing: '0.04em',
    transition: 'border-color 100ms',
  }));

  submitBtnStyle = computed(() => ({
    width: '100%',
    background: this.submitHovered() ? '#e0e0e0' : '#ffffff',
    border: '1px solid #ffffff',
    color: '#000000',
    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
    fontSize: '13px',
    padding: '10px 0',
    cursor: 'pointer',
    letterSpacing: '0.15em',
    transition: 'background 100ms',
  }));

  handleSubmit(e: Event) {
    e.preventDefault();
    if (this.email() && this.password()) {
      const username = this.email().split('@')[0] || 'user';
      this.state.login(username);
      this.router.navigate(['/dashboard']);
    }
  }
}
