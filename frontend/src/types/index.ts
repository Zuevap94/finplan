export type UserRole = 'consultant' | 'client';

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  is_active: boolean;
  consultant_id: number | null;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ClientListItem {
  id: number;
  email: string;
  full_name: string;
  phone: string | null;
  created_at: string;
  has_profile: boolean;
  last_report_date: string | null;
}

export type IncomeType = 'salary' | 'business' | 'rental' | 'dividends' | 'interest' | 'pension' | 'other';
export type ExpenseCategory = 'housing' | 'food' | 'transport' | 'healthcare' | 'education' | 'entertainment' | 'clothing' | 'insurance' | 'debt_payments' | 'savings' | 'other';
export type AssetType = 'deposit' | 'stocks_ru' | 'bonds_ru' | 'mutual_funds' | 'stocks_foreign' | 'bonds_foreign' | 'real_estate' | 'cash' | 'iis' | 'pension_fund' | 'crypto' | 'business_asset' | 'other';
export type LiabilityType = 'mortgage' | 'car_loan' | 'consumer_loan' | 'credit_card' | 'business_loan' | 'other';
export type GoalPriority = 'high' | 'medium' | 'low';
export type ReportType = 'net_worth' | 'portfolio' | 'income_expense' | 'goal_progress' | 'tax_summary' | 'full_plan';

export interface Income {
  id?: number;
  profile_id?: number;
  type: IncomeType;
  name: string;
  amount_monthly: number;
  is_gross: boolean;
  is_regular: boolean;
}

export interface Expense {
  id?: number;
  profile_id?: number;
  category: ExpenseCategory;
  name: string;
  amount_monthly: number;
  is_fixed: boolean;
}

export interface Asset {
  id?: number;
  profile_id?: number;
  type: AssetType;
  name: string;
  current_value: number;
  purchase_value?: number;
  purchase_date?: string;
  annual_return_rate?: number;
  currency: string;
  details?: Record<string, unknown>;
}

export interface Liability {
  id?: number;
  profile_id?: number;
  type: LiabilityType;
  name: string;
  total_amount: number;
  remaining_amount: number;
  interest_rate: number;
  monthly_payment: number;
  end_date?: string;
}

export interface FinancialGoal {
  id?: number;
  profile_id?: number;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  priority: GoalPriority;
  monthly_contribution?: number;
  description?: string;
}

export interface FinancialProfile {
  id: number;
  user_id: number;
  version: number;
  is_current: boolean;
  notes: string | null;
  created_at: string;
  created_by: number | null;
  incomes: Income[];
  expenses: Expense[];
  assets: Asset[];
  liabilities: Liability[];
  goals: FinancialGoal[];
}

export interface FinancialProfileCreate {
  notes?: string;
  incomes: Omit<Income, 'id' | 'profile_id'>[];
  expenses: Omit<Expense, 'id' | 'profile_id'>[];
  assets: Omit<Asset, 'id' | 'profile_id'>[];
  liabilities: Omit<Liability, 'id' | 'profile_id'>[];
  goals: Omit<FinancialGoal, 'id' | 'profile_id'>[];
}

export interface GoalProgress {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  progress_pct: number;
  target_date: string;
  months_remaining: number;
  required_monthly: number;
  monthly_contribution: number;
  priority: GoalPriority;
  on_track: boolean;
}

export interface FinancialSummary {
  total_monthly_income: number;
  total_monthly_income_net: number;
  total_monthly_expenses: number;
  monthly_savings: number;
  savings_rate: number;
  total_assets: number;
  total_liabilities: number;
  net_worth: number;
  asset_allocation: Record<string, number>;
  income_breakdown: Record<string, number>;
  expense_breakdown: Record<string, number>;
  goal_progress: GoalProgress[];
  tax_summary: Record<string, number>;
}

export interface Report {
  id: number;
  user_id: number;
  type: ReportType;
  title: string;
  data: FinancialSummary | null;
  pdf_path: string | null;
  created_at: string;
  created_by: number | null;
}

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}
