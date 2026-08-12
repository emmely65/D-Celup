import {
  initialMockUsers,
  initialMockProducts,
  initialMockVariants,
  initialMockRawMaterials,
  initialMockTransactions
} from './mockData'

// State storage helper dengan localStorage agar data CRUD tersimpan saat direfresh di Vercel Demo
function loadStorage(key, defaultData) {
  try {
    const saved = localStorage.getItem(key)
    if (saved) return JSON.parse(saved)
  } catch (e) {
    console.error('Error loading mock storage:', e)
  }
  localStorage.setItem(key, JSON.stringify(defaultData))
  return defaultData
}

function saveStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.error('Error saving mock storage:', e)
  }
}

export function setupMockAdapter(httpInstance) {
  const originalAdapter = httpInstance.defaults.adapter

  // Inisialisasi Mock State Stateful
  let users = loadStorage('dcelup_mock_users', initialMockUsers)
  let products = loadStorage('dcelup_mock_products', initialMockProducts)
  let variants = loadStorage('dcelup_mock_variants', initialMockVariants)
  let rawMaterials = loadStorage('dcelup_mock_raw_materials', initialMockRawMaterials)
  let transactions = loadStorage('dcelup_mock_transactions', initialMockTransactions)
  let expenseCategories = loadStorage('dcelup_mock_expense_categories', [
    { id: 1, name: 'Bahan Baku', is_active: 1, created_at: '2026-07-24 14:11:08' },
    { id: 2, name: 'Operasional Toko', is_active: 1, created_at: '2026-07-24 14:11:08' },
    { id: 3, name: 'Gaji & Bonus', is_active: 1, created_at: '2026-07-24 14:11:08' }
  ])
  let expenses = loadStorage('dcelup_mock_expenses', [
    { id: 1, category_id: 1, category: { id: 1, name: 'Bahan Baku' }, amount: '120000.00', description: 'Pembelian Daging Ayam 10kg', expense_date: '2026-08-10', created_by: 1 },
    { id: 2, category_id: 2, category: { id: 2, name: 'Operasional Toko' }, amount: '35000.00', description: 'Gas LPG 3kg & Plastik', expense_date: '2026-08-11', created_by: 1 }
  ])
  let stockMovements = loadStorage('dcelup_mock_stock_movements', [
    { id: 1, material_id: 1, type: 'in', qty: '10.000', balance_before: '5.500', balance_after: '15.500', note: 'Restock bahan baku harian', created_at: '2026-08-10 10:00:00', material: { id: 1, name: 'Daging Ayam Fillet', unit: 'kg' } }
  ])
  let activityLogs = loadStorage('dcelup_mock_activity_logs', [
    { id: 1, user_id: 1, action: 'login', module: 'auth', detail: { login: 'admin' }, ip_address: '127.0.0.1', created_at: new Date().toISOString() }
  ])

  function logActivity(action, module, detail = {}) {
    const newLog = {
      id: activityLogs.length + 1,
      user_id: 1,
      user: { name: 'Administrator' },
      action,
      module,
      detail,
      ip_address: '127.0.0.1',
      created_at: new Date().toISOString()
    }
    activityLogs.unshift(newLog)
    saveStorage('dcelup_mock_activity_logs', activityLogs)
  }

  httpInstance.defaults.adapter = async (config) => {
    const isVercelEnv = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')
    const useMock = import.meta.env.VITE_USE_MOCK_API === 'true' || import.meta.env.VITE_USE_MOCK_API === true || isVercelEnv
    if (!useMock) {
      return originalAdapter(config)
    }

    const url = config.url || ''
    const method = (config.method || 'get').toLowerCase()
    
    const parseBody = () => {
      if (typeof config.data === 'object' && config.data !== null) return config.data
      try {
        return JSON.parse(config.data || '{}')
      } catch (e) {
        return {}
      }
    }

    const jsonResponse = (data, message = 'Success', status = 200, meta = null) => {
      const body = {
        success: status >= 200 && status < 300,
        message,
        data,
      }
      if (meta) body.meta = meta

      return Promise.resolve({
        data: body,
        status,
        statusText: status >= 200 && status < 300 ? 'OK' : 'Error',
        headers: { 'content-type': 'application/json' },
        config
      })
    }

    // Extract ID if URL has path parameter e.g. /products/5 or /product-variants/2/deactivate
    const matchId = (pattern) => {
      const regex = new RegExp(pattern)
      const found = url.match(regex)
      return found ? parseInt(found[1], 10) : null
    }

    // ==========================================
    // 1. AUTHENTICATION
    // ==========================================
    if (url.includes('/auth/login') && method === 'post') {
      const body = parseBody()
      const loginId = (body.login || body.username || body.email || '').toLowerCase()
      const user = users.find(u => u.username.toLowerCase() === loginId || u.email.toLowerCase() === loginId) || users[0]
      
      logActivity('login', 'auth', { login: user.username })
      return jsonResponse({ token: 'mock-jwt-token-dcelup-demo', user }, 'Login berhasil (Mock Mode)')
    }

    if (url.includes('/auth/logout') && method === 'post') {
      logActivity('logout', 'auth')
      return jsonResponse(null, 'Logout berhasil')
    }

    if (url.includes('/auth/me') && method === 'get') {
      return jsonResponse(users[0], 'User profile diambil')
    }

    // ==========================================
    // 2. MASTER PRODUK (CRUD)
    // ==========================================
    const prodDeactivateId = matchId('/products/(\\d+)/deactivate')
    if (prodDeactivateId && method === 'patch') {
      const prod = products.find(p => p.id === prodDeactivateId)
      if (prod) {
        prod.is_active = prod.is_active ? 0 : 1
        saveStorage('dcelup_mock_products', products)
        logActivity('deactivate', 'products', { product_id: prod.id })
        return jsonResponse(prod, 'Status produk berhasil diperbarui')
      }
    }

    const prodId = matchId('/products/(\\d+)$')
    if (prodId && method === 'put') {
      const body = parseBody()
      const index = products.findIndex(p => p.id === prodId)
      if (index !== -1) {
        products[index] = { ...products[index], ...body, updated_at: new Date().toISOString() }
        saveStorage('dcelup_mock_products', products)
        logActivity('update', 'products', { product_id: prodId })
        return jsonResponse(products[index], 'Produk berhasil diperbarui')
      }
    }

    if (prodId && method === 'get') {
      const prod = products.find(p => p.id === prodId)
      if (prod) {
        const prodVariants = variants.filter(v => v.product_id === prod.id)
        return jsonResponse({ ...prod, variants: prodVariants }, 'Detail produk diambil')
      }
    }

    if (url.includes('/products') && !url.includes('/product-variants') && method === 'post') {
      const body = parseBody()
      const newProduct = {
        id: products.length ? Math.max(...products.map(p => p.id)) + 1 : 1,
        name: body.name || 'Produk Baru',
        category: body.category || 'original',
        description: body.description || '',
        image_path: body.image_path || null,
        is_active: 1,
        created_at: new Date().toISOString()
      }
      products.push(newProduct)
      saveStorage('dcelup_mock_products', products)
      logActivity('create', 'products', { product_id: newProduct.id })
      return jsonResponse(newProduct, 'Produk berhasil dibuat', 201)
    }

    if (url.includes('/products') && !url.includes('/product-variants') && method === 'get') {
      const fullProducts = products.map(p => ({
        ...p,
        variants: variants.filter(v => v.product_id === p.id && v.is_active === 1)
      }))
      return jsonResponse(fullProducts, 'Daftar produk berhasil diambil', 200, { current_page: 1, per_page: 100, total: fullProducts.length, last_page: 1 })
    }

    // ==========================================
    // 3. VARIAN PRODUK (CRUD)
    // ==========================================
    const variantDeactivateId = matchId('/product-variants/(\\d+)/deactivate')
    if (variantDeactivateId && method === 'patch') {
      const v = variants.find(item => item.id === variantDeactivateId)
      if (v) {
        v.is_active = v.is_active ? 0 : 1
        saveStorage('dcelup_mock_variants', variants)
        logActivity('deactivate', 'product_variants', { variant_id: v.id })
        return jsonResponse(v, 'Status varian berhasil diperbarui')
      }
    }

    const variantId = matchId('/product-variants/(\\d+)$')
    if (variantId && method === 'put') {
      const body = parseBody()
      const index = variants.findIndex(v => v.id === variantId)
      if (index !== -1) {
        variants[index] = { ...variants[index], ...body, updated_at: new Date().toISOString() }
        saveStorage('dcelup_mock_variants', variants)
        logActivity('update', 'product_variants', { variant_id: variantId })
        return jsonResponse(variants[index], 'Varian produk berhasil diperbarui')
      }
    }

    if (url.includes('/product-variants') && method === 'post') {
      const body = parseBody()
      const prod = products.find(p => p.id === Number(body.product_id)) || products[0]
      const newVariant = {
        id: variants.length ? Math.max(...variants.map(v => v.id)) + 1 : 1,
        product_id: Number(body.product_id) || prod.id,
        sauce_name: body.sauce_name || 'Saus Baru',
        type: body.type || prod.category || 'original',
        price: String(body.price || '6000.00'),
        qty_per_pack: Number(body.qty_per_pack || 4),
        is_active: 1,
        created_at: new Date().toISOString()
      }
      variants.push(newVariant)
      saveStorage('dcelup_mock_variants', variants)
      logActivity('create', 'product_variants', { variant_id: newVariant.id })
      return jsonResponse(newVariant, 'Varian produk berhasil dibuat', 201)
    }

    if (url.includes('/product-variants') && method === 'get') {
      const activeVariants = variants
        .filter(v => v.is_active === 1)
        .map(v => {
          const prod = products.find(p => p.id === v.product_id)
          return { ...v, product: prod || { id: v.product_id, name: 'Sempol' } }
        })
      return jsonResponse(activeVariants, 'Daftar varian produk berhasil diambil', 200, { current_page: 1, per_page: 100, total: activeVariants.length, last_page: 1 })
    }

    // ==========================================
    // 4. BAHAN BAKU / RAW MATERIALS (CRUD)
    // ==========================================
    const matDeactivateId = matchId('/raw-materials/(\\d+)/deactivate')
    if (matDeactivateId && method === 'patch') {
      const mat = rawMaterials.find(m => m.id === matDeactivateId)
      if (mat) {
        mat.is_active = mat.is_active ? 0 : 1
        saveStorage('dcelup_mock_raw_materials', rawMaterials)
        logActivity('deactivate', 'raw_materials', { material_id: mat.id })
        return jsonResponse(mat, 'Status bahan baku diperbarui')
      }
    }

    const matId = matchId('/raw-materials/(\\d+)$')
    if (matId && method === 'put') {
      const body = parseBody()
      const index = rawMaterials.findIndex(m => m.id === matId)
      if (index !== -1) {
        rawMaterials[index] = { ...rawMaterials[index], ...body, updated_at: new Date().toISOString() }
        saveStorage('dcelup_mock_raw_materials', rawMaterials)
        logActivity('update', 'raw_materials', { material_id: matId })
        return jsonResponse(rawMaterials[index], 'Bahan baku berhasil diperbarui')
      }
    }

    if (url.includes('/raw-materials') && method === 'post') {
      const body = parseBody()
      const newMat = {
        id: rawMaterials.length ? Math.max(...rawMaterials.map(m => m.id)) + 1 : 1,
        name: body.name || 'Bahan Baku Baru',
        unit: body.unit || 'kg',
        current_stock: String(body.current_stock || '0.000'),
        min_stock: String(body.min_stock || '1.000'),
        is_active: 1,
        created_at: new Date().toISOString()
      }
      rawMaterials.push(newMat)
      saveStorage('dcelup_mock_raw_materials', rawMaterials)
      logActivity('create', 'raw_materials', { material_id: newMat.id })
      return jsonResponse(newMat, 'Bahan baku berhasil ditambahkan', 201)
    }

    if (url.includes('/raw-materials') && method === 'get') {
      return jsonResponse(rawMaterials, 'Daftar bahan baku diambil', 200, { current_page: 1, per_page: 100, total: rawMaterials.length, last_page: 1 })
    }

    // ==========================================
    // 5. STOK MOVEMENTS
    // ==========================================
    if (url.includes('/stock-movements/in') && method === 'post') {
      const body = parseBody()
      const mat = rawMaterials.find(m => m.id === Number(body.raw_material_id || body.material_id))
      const qty = parseFloat(body.qty || 0)
      const before = mat ? parseFloat(mat.current_stock) : 0
      const after = before + qty
      if (mat) mat.current_stock = String(after.toFixed(3))
      saveStorage('dcelup_mock_raw_materials', rawMaterials)

      const movement = {
        id: stockMovements.length + 1,
        material_id: body.raw_material_id,
        type: 'in',
        qty: String(qty.toFixed(3)),
        balance_before: String(before.toFixed(3)),
        balance_after: String(after.toFixed(3)),
        note: body.note || 'Stok Masuk',
        created_at: new Date().toISOString(),
        material: mat
      }
      stockMovements.unshift(movement)
      saveStorage('dcelup_mock_stock_movements', stockMovements)
      return jsonResponse(movement, 'Stok masuk berhasil dicatat', 201)
    }

    if (url.includes('/stock-movements/out') && method === 'post') {
      const body = parseBody()
      const mat = rawMaterials.find(m => m.id === Number(body.raw_material_id || body.material_id))
      const qty = parseFloat(body.qty || 0)
      const before = mat ? parseFloat(mat.current_stock) : 0
      const after = Math.max(0, before - qty)
      if (mat) mat.current_stock = String(after.toFixed(3))
      saveStorage('dcelup_mock_raw_materials', rawMaterials)

      const movement = {
        id: stockMovements.length + 1,
        material_id: body.raw_material_id,
        type: 'out',
        qty: String(qty.toFixed(3)),
        balance_before: String(before.toFixed(3)),
        balance_after: String(after.toFixed(3)),
        note: body.note || 'Stok Keluar',
        created_at: new Date().toISOString(),
        material: mat
      }
      stockMovements.unshift(movement)
      saveStorage('dcelup_mock_stock_movements', stockMovements)
      return jsonResponse(movement, 'Stok keluar berhasil dicatat', 201)
    }

    if (url.includes('/stock-movements') && method === 'get') {
      return jsonResponse(stockMovements, 'Riwayat stok diambil', 200, { current_page: 1, per_page: 100, total: stockMovements.length, last_page: 1 })
    }

    // ==========================================
    // 6. TRANSAKSI / POS (CHECKOUT & CANCEL)
    // ==========================================
    const cancelTrxId = matchId('/transactions/(\\d+)/cancel')
    if (cancelTrxId && method === 'post') {
      const trx = transactions.find(t => t.id === cancelTrxId)
      if (trx) {
        trx.status = 'cancelled'
        saveStorage('dcelup_mock_transactions', transactions)
        logActivity('cancel', 'transactions', { transaction_id: trx.id })
        return jsonResponse(trx, 'Transaksi berhasil dibatalkan')
      }
    }

    if (url.includes('/transactions') && method === 'post') {
      const body = parseBody()
      const newTrx = {
        id: transactions.length ? Math.max(...transactions.map(t => t.id)) + 1 : 1,
        trx_code: `TRX-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(transactions.length + 1).padStart(4, '0')}`,
        user_id: 3,
        customer_name: body.customer_name || 'Pelanggan POS',
        total_amount: String(body.total_amount || body.grand_total || '0.00'),
        payment_method: body.payment_method || 'cash',
        paid_amount: String(body.paid_amount || '0.00'),
        change_amount: String(body.change_amount || '0.00'),
        status: 'completed',
        created_at: new Date().toISOString(),
        user: { id: 3, name: 'Kasir Utama' },
        items: body.items || []
      }
      transactions.unshift(newTrx)
      saveStorage('dcelup_mock_transactions', transactions)
      logActivity('create', 'transactions', { trx_code: newTrx.trx_code, total_amount: newTrx.total_amount })
      return jsonResponse(newTrx, 'Transaksi berhasil disimpan', 201)
    }

    if (url.includes('/transactions') && method === 'get') {
      return jsonResponse(transactions, 'Daftar transaksi berhasil diambil', 200, { current_page: 1, per_page: 100, total: transactions.length, last_page: 1 })
    }

    // ==========================================
    // 7. PENGELUARAN / EXPENSES (CRUD)
    // ==========================================
    if (url.includes('/expense-categories') && method === 'get') {
      return jsonResponse(expenseCategories, 'Kategori pengeluaran diambil')
    }

    const expId = matchId('/expenses/(\\d+)$')
    if (expId && method === 'delete') {
      expenses = expenses.filter(e => e.id !== expId)
      saveStorage('dcelup_mock_expenses', expenses)
      logActivity('delete', 'expenses', { expense_id: expId })
      return jsonResponse(null, 'Pengeluaran dihapus')
    }

    if (url.includes('/expenses') && method === 'post') {
      const body = parseBody()
      const cat = expenseCategories.find(c => c.id === Number(body.category_id)) || expenseCategories[0]
      const newExp = {
        id: expenses.length ? Math.max(...expenses.map(e => e.id)) + 1 : 1,
        category_id: cat.id,
        category: cat,
        amount: String(body.amount || '0.00'),
        description: body.description || '',
        expense_date: body.expense_date || new Date().toISOString().slice(0, 10),
        created_by: 1
      }
      expenses.unshift(newExp)
      saveStorage('dcelup_mock_expenses', expenses)
      logActivity('create', 'expenses', { expense_id: newExp.id })
      return jsonResponse(newExp, 'Pengeluaran berhasil dicatat', 201)
    }

    if (url.includes('/expenses') && method === 'get') {
      return jsonResponse(expenses, 'Daftar pengeluaran diambil', 200, { current_page: 1, per_page: 100, total: expenses.length, last_page: 1 })
    }

    // ==========================================
    // 8. USERS (CRUD)
    // ==========================================
    const userDeactivateId = matchId('/users/(\\d+)/deactivate')
    if (userDeactivateId && method === 'patch') {
      const u = users.find(usr => usr.id === userDeactivateId)
      if (u) {
        u.is_active = u.is_active ? 0 : 1
        saveStorage('dcelup_mock_users', users)
        logActivity('deactivate', 'users', { user_id: u.id })
        return jsonResponse(u, 'Status user diperbarui')
      }
    }

    const userResetPwId = matchId('/users/(\\d+)/reset-password')
    if (userResetPwId && method === 'patch') {
      logActivity('reset_password', 'users', { user_id: userResetPwId })
      return jsonResponse(null, 'Password user berhasil di-reset')
    }

    const userId = matchId('/users/(\\d+)$')
    if (userId && method === 'put') {
      const body = parseBody()
      const index = users.findIndex(u => u.id === userId)
      if (index !== -1) {
        users[index] = { ...users[index], ...body }
        saveStorage('dcelup_mock_users', users)
        logActivity('update', 'users', { user_id: userId })
        return jsonResponse(users[index], 'User berhasil diperbarui')
      }
    }

    if (url.includes('/users') && method === 'post') {
      const body = parseBody()
      const newUser = {
        id: users.length ? Math.max(...users.map(u => u.id)) + 1 : 1,
        name: body.name || 'User Baru',
        username: body.username || `user${users.length + 1}`,
        email: body.email || `user${users.length + 1}@dcelup.local`,
        role: body.role || 'kasir',
        is_active: 1
      }
      users.push(newUser)
      saveStorage('dcelup_mock_users', users)
      logActivity('create', 'users', { user_id: newUser.id })
      return jsonResponse(newUser, 'User berhasil dibuat', 201)
    }

    if (url.includes('/users') && method === 'get') {
      return jsonResponse(users, 'Daftar user diambil', 200, { current_page: 1, per_page: 100, total: users.length, last_page: 1 })
    }

    // ==========================================
    // 9. DASHBOARD & REPORTS
    // ==========================================
    if (url.includes('/dashboard/cashier-summary')) {
      return jsonResponse({
        today_transactions_count: transactions.length,
        today_revenue: transactions.reduce((acc, t) => acc + parseFloat(t.total_amount || 0), 0),
        cashier_name: 'Kasir Utama'
      }, 'Ringkasan kasir diambil')
    }

    if (url.includes('/dashboard/weekly-sales')) {
      return jsonResponse([
        { date: 'Senin', total: 150000 },
        { date: 'Selasa', total: 180000 },
        { date: 'Rabu', total: 210000 },
        { date: 'Kamis', total: 190000 },
        { date: 'Jumat', total: 260000 },
        { date: 'Sabtu', total: 320000 },
        { date: 'Minggu', total: 290000 }
      ], 'Penjualan mingguan diambil')
    }

    if (url.includes('/dashboard/top-products')) {
      return jsonResponse([
        { name: 'Sempol Crispy - Saus Barbeque', total_qty: 120 },
        { name: 'Sempol Original - Saus Teriyaki', total_qty: 95 },
        { name: 'Sempol Bakar - Saus BBQ Mentai', total_qty: 70 },
        { name: 'Twin Cup - Saus Teriyaki + Kacang', total_qty: 45 }
      ], 'Produk terlaris diambil')
    }

    if (url.includes('/dashboard/low-stock-materials')) {
      return jsonResponse(rawMaterials, 'Stok bahan baku diambil')
    }

    if (url.includes('/dashboard/admin-summary')) {
      return jsonResponse({
        total_revenue: transactions.reduce((acc, t) => acc + parseFloat(t.total_amount || 0), 0),
        total_transactions: transactions.length,
        total_products: products.length,
        total_raw_materials: rawMaterials.length
      }, 'Ringkasan admin diambil')
    }

    if (url.includes('/activity-logs') && method === 'get') {
      return jsonResponse(activityLogs, 'Activity logs diambil', 200, { current_page: 1, per_page: 100, total: activityLogs.length, last_page: 1 })
    }

    // Fallback attempt original adapter
    try {
      return await originalAdapter(config)
    } catch (err) {
      return jsonResponse([], 'Mock response fallback')
    }
  }
}
