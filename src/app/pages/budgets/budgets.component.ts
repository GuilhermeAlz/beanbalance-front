import { Component, computed, inject, signal } from '@angular/core';
import { AppStateService, formatBRL } from '../../core/services/app-state.service';
import { Budget } from '../../core/models/app.models';
import { ButtonComponent } from '../../shared/button/button.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { DrawerComponent } from '../../shared/drawer/drawer.component';
import { FormFieldComponent } from '../../shared/form-field/form-field.component';
import { InputComponent } from '../../shared/input/input.component';
import { SelectComponent } from '../../shared/select/select.component';
import { DeleteModalComponent } from '../../shared/delete-modal/delete-modal.component';
import { ProgressBarComponent } from '../../shared/progress-bar/progress-bar.component';

const MONTH_NAMES = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
];

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [
    ButtonComponent, EmptyStateComponent,
    DrawerComponent, FormFieldComponent, InputComponent, SelectComponent,
    DeleteModalComponent, ProgressBarComponent,
  ],
  templateUrl: './budgets.component.html',
  styleUrl: './budgets.component.css',
})
export class BudgetsComponent {
  state = inject(AppStateService);

  readonly formatBRL = formatBRL;

  currentMonth = signal('2026-04');

  monthBudgets = computed(() =>
    this.state.budgets().filter(b => b.month === this.currentMonth())
  );

  categoryOptions = computed(() =>
    this.state.categories().map(c => ({ value: c.id, label: c.name.toUpperCase() }))
  );

  monthLabel = computed(() => this.formatMonthLabel(this.currentMonth()));

  drawerOpen = signal(false);
  editId     = signal<string | null>(null);
  deleteId   = signal<string | null>(null);

  formCategoryId = signal('');
  formLimit      = signal('');
  formMonth      = signal('2026-04');

  deleteTarget = computed(() =>
    this.state.budgets().find(b => b.id === this.deleteId())
  );

  deleteTargetCatName = computed(() => {
    const cat = this.state.categories().find(c => c.id === this.deleteTarget()?.categoryId);
    return cat ? cat.name.toUpperCase() : '';
  });

  prevMonth() {
    const [y, m] = this.currentMonth().split('-').map(Number);
    const d = new Date(y, m - 2, 1);
    this.currentMonth.set(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  nextMonth() {
    const [y, m] = this.currentMonth().split('-').map(Number);
    const d = new Date(y, m, 1);
    this.currentMonth.set(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  formatMonthLabel(month: string): string {
    const [y, mo] = month.split('-').map(Number);
    return `${MONTH_NAMES[mo - 1]} ${y}`;
  }

  openCreate() {
    this.editId.set(null);
    this.formCategoryId.set('');
    this.formLimit.set('');
    this.formMonth.set(this.currentMonth());
    this.drawerOpen.set(true);
  }

  openEdit(b: Budget) {
    this.editId.set(b.id);
    this.formCategoryId.set(b.categoryId);
    this.formLimit.set(b.limit.toString());
    this.formMonth.set(b.month);
    this.drawerOpen.set(true);
  }

  handleSave() {
    if (!this.formCategoryId() || !this.formLimit()) return;
    const id = this.editId();
    if (id) {
      this.state.updateBudget(id, {
        categoryId: this.formCategoryId(),
        limit: parseFloat(this.formLimit()) || 0,
        month: this.formMonth(),
      });
    } else {
      this.state.addBudget({
        categoryId: this.formCategoryId(),
        limit:      parseFloat(this.formLimit()) || 0,
        spent:      0,
        month:      this.formMonth(),
      });
    }
    this.drawerOpen.set(false);
  }

  confirmDelete() {
    const id = this.deleteId();
    if (!id) return;
    this.state.deleteBudget(id);
    this.deleteId.set(null);
  }

  getCategoryName(catId: string): string {
    return this.state.categories().find(c => c.id === catId)?.name || '—';
  }

  isOver(b: Budget): boolean {
    return b.spent > b.limit;
  }

  remaining(b: Budget): number {
    return b.limit - b.spent;
  }
}
