import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AppStateService, formatBRL, formatDate } from '../../core/services/app-state.service';
import { SectionHeaderComponent } from '../../shared/section-header/section-header.component';
import { ProgressBarComponent } from '../../shared/progress-bar/progress-bar.component';
import { BadgeComponent } from '../../shared/badge/badge.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SectionHeaderComponent, ProgressBarComponent, BadgeComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  private router = inject(Router);
  state = inject(AppStateService);

  formatBRL = formatBRL;
  formatDate = formatDate;

  totalBalance = computed(() =>
    this.state.accounts().reduce((s, a) => s + a.balance, 0)
  );

  private aprilTxs = computed(() =>
    this.state.transactions().filter(t => t.date.startsWith('2026-04'))
  );

  monthIncome = computed(() =>
    this.aprilTxs().filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0)
  );

  monthExpense = computed(() =>
    this.aprilTxs().filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0)
  );

  recent = computed(() =>
    [...this.state.transactions()]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5)
  );

  getCat(id: string) {
    return this.state.categories().find(c => c.id === id);
  }

  getAcc(id: string) {
    return this.state.accounts().find(a => a.id === id);
  }

  getAccLabel(id: string): string {
    const acc = this.state.accounts().find(a => a.id === id);
    return acc ? acc.name.split(' ')[0].toUpperCase() : '—';
  }

  goToTransactions() {
    this.router.navigate(['/transactions']);
  }

  goToBudgets() {
    this.router.navigate(['/budgets']);
  }
}
