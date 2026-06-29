import { createRouter, createWebHistory } from 'vue-router'
import { setupGuards } from './guards'

const LoginView = () => import('@/views/auth/LoginView.vue')
const DashboardView = () => import('@/views/dashboard/DashboardView.vue')
const CashierView = () => import('@/views/transactions/CashierView.vue')
const TransactionHistoryView = () => import('@/views/transactions/TransactionHistoryView.vue')
const TransactionDetailView = () => import('@/views/transactions/TransactionDetailView.vue')
const ProductListView = () => import('@/views/products/ProductListView.vue')
const ProductVariantListView = () => import('@/views/products/ProductVariantListView.vue')
const RawMaterialListView = () => import('@/views/stocks/RawMaterialListView.vue')
const StockInView = () => import('@/views/stocks/StockInView.vue')
const StockOutView = () => import('@/views/stocks/StockOutView.vue')
const StockAdjustmentView = () => import('@/views/stocks/StockAdjustmentView.vue')
const StockMovementHistoryView = () => import('@/views/stocks/StockMovementHistoryView.vue')
const ExpenseListView = () => import('@/views/finance/ExpenseListView.vue')
const ExpenseCategoryView = () => import('@/views/finance/ExpenseCategoryView.vue')
const ReportView = () => import('@/views/reports/ReportView.vue')
const UserManagementView = () => import('@/views/users/UserManagementView.vue')
const ActivityLogView = () => import('@/views/activity-logs/ActivityLogView.vue')
const ForbiddenView = () => import('@/views/errors/ForbiddenView.vue')
const NotFoundView = () => import('@/views/errors/NotFoundView.vue')

const routes = [
  { path: '/login', name: 'login', component: LoginView, meta: { requiresAuth: false } },
  { path: '/403', name: 'forbidden', component: ForbiddenView, meta: { requiresAuth: false } },
  { path: '/', redirect: '/dashboard' },

  { path: '/dashboard', name: 'dashboard', component: DashboardView, meta: { requiresAuth: true, roles: ['admin', 'kasir'] } },
  { path: '/cashier', name: 'cashier', component: CashierView, meta: { requiresAuth: true, roles: ['admin', 'kasir'] } },
  { path: '/transactions', name: 'transactions', component: TransactionHistoryView, meta: { requiresAuth: true, roles: ['admin', 'kasir'] } },
  { path: '/transactions/:id', name: 'transaction-detail', component: TransactionDetailView, meta: { requiresAuth: true, roles: ['admin', 'kasir'] } },
  { path: '/raw-materials', name: 'raw-materials', component: RawMaterialListView, meta: { requiresAuth: true, roles: ['admin', 'kasir'] } },
  { path: '/stock/movements', name: 'stock-movements', component: StockMovementHistoryView, meta: { requiresAuth: true, roles: ['admin', 'kasir'] } },

  { path: '/products', name: 'products', component: ProductListView, meta: { requiresAuth: true, roles: ['admin'] } },
  { path: '/product-variants', name: 'product-variants', component: ProductVariantListView, meta: { requiresAuth: true, roles: ['admin'] } },
  { path: '/stock/in', name: 'stock-in', component: StockInView, meta: { requiresAuth: true, roles: ['admin'] } },
  { path: '/stock/out', name: 'stock-out', component: StockOutView, meta: { requiresAuth: true, roles: ['admin'] } },
  { path: '/stock/adjustment', name: 'stock-adjustment', component: StockAdjustmentView, meta: { requiresAuth: true, roles: ['admin'] } },
  { path: '/expenses', name: 'expenses', component: ExpenseListView, meta: { requiresAuth: true, roles: ['admin'] } },
  { path: '/expense-categories', name: 'expense-categories', component: ExpenseCategoryView, meta: { requiresAuth: true, roles: ['admin'] } },
  { path: '/reports', name: 'reports', component: ReportView, meta: { requiresAuth: true, roles: ['admin'] } },
  { path: '/users', name: 'users', component: UserManagementView, meta: { requiresAuth: true, roles: ['admin'] } },
  { path: '/activity-logs', name: 'activity-logs', component: ActivityLogView, meta: { requiresAuth: true, roles: ['admin'] } },

  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView, meta: { requiresAuth: false } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

setupGuards(router)

export default router
