import { Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AppStateService, formatBRL, formatDate } from '../../core/services/app-state.service';
import { BadgeComponent } from '../../shared/badge/badge.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { DeleteModalComponent } from '../../shared/delete-modal/delete-modal.component';
import { PaginationComponent } from '../../shared/pagination/pagination.component';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-account-detail',
  standalone: true,
  imports: [BadgeComponent, ButtonComponent, DeleteModalComponent, PaginationComponent],
  templateUrl: './account-detail.component.html',
  styleUrl: './account-detail.component.css',
})
export class AccountDetailComponent {
  id = input<string>('');

  state          = inject(AppStateService);
  private router = inject(Router);

  readonly formatBRL  = formatBRL;
  readonly formatDate = formatDate;

  account = computed(() => this.state.accounts().find(a => a.id === this.id()));

  accountTxs = computed(() =>
    [...this.state.transactions()]
      .filter(t => t.accountId === this.id())
      .sort((a, b) => b.date.localeCompare(a.date))
  );

  totalPages = computed(() => Math.max(1, Math.ceil(this.accountTxs().length / PAGE_SIZE)));

  page = signal(1);

  pageData = computed(() => {
    const p = this.page();
    return this.accountTxs().slice((p - 1) * PAGE_SIZE, p * PAGE_SIZE);
  });

  deleteAccountModal = signal(false);
  deleteTxId         = signal<string | null>(null);

  deleteTxTarget = computed(() =>
    this.state.transactions().find(t => t.id === this.deleteTxId())
  );

  showingStart = computed(() =>
    Math.min((this.page() - 1) * PAGE_SIZE + 1, this.accountTxs().length)
  );
  showingEnd = computed(() =>
    Math.min(this.page() * PAGE_SIZE, this.accountTxs().length)
  );

  getCategoryName(catId: string): string {
    return this.state.categories().find(c => c.id === catId)?.name || '—';
  }

  formatIndex(n: number): string {
    return String(n).padStart(2, '0');
  }

  rowIndex(i: number): number {
    return (this.page() - 1) * PAGE_SIZE + i + 1;
  }

  goToAccounts() {
    this.router.navigate(['/accounts']);
  }

  confirmDeleteAccount() {
    const acc = this.account();
    if (!acc) return;
    this.state.deleteAccount(acc.id);
    this.router.navigate(['/accounts']);
  }

  confirmDeleteTx() {
    const id = this.deleteTxId();
    if (!id) return;
    this.state.deleteTransaction(id);
    this.deleteTxId.set(null);
  }
}
