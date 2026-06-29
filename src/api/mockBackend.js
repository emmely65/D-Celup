const STORAGE_KEY = 'dcelup_mock_backend_v1'
const MOCK_DELAY_MS = 180

const now = () => new Date()
const today = () => toDateOnly(now())

function toDateOnly(value) {
  return new Date(value).toISOString().slice(0, 10)
}

function daysAgo(days, hour = 9, minute = 0) {
  const date = now()
  date.setDate(date.getDate() - days)
  date.setHours(hour, minute, 0, 0)
  return date.toISOString()
}

function recentMinutesAgo(minutes) {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString()
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function seedDb() {
  const users = [
    { id: 1, name: 'Admin DCelup', username: 'admin', email: 'admin@dcelup.test', role: 'admin', is_active: true, created_at: daysAgo(20) },
    { id: 2, name: 'Kasir Pagi', username: 'kasir', email: 'kasir@dcelup.test', role: 'kasir', is_active: true, created_at: daysAgo(15) },
    { id: 3, name: 'Kasir Sore', username: 'kasir2', email: 'kasir2@dcelup.test', role: 'kasir', is_active: true, created_at: daysAgo(10) }
  ]

  const products = [
    { id: 1, name: 'Sempol Ayam Classic', category: 'original', description: 'Sempol ayam lembut untuk menu reguler.', is_active: true, created_at: daysAgo(18) },
    { id: 2, name: 'Sempol Ayam Crispy', category: 'crispy', description: 'Sempol dengan balutan renyah.', is_active: true, created_at: daysAgo(16) },
    { id: 3, name: 'Paket Mix DCelup', category: 'paket', description: 'Paket campuran untuk transaksi cepat.', is_active: true, created_at: daysAgo(14) }
  ]

  const productVariants = [
    { id: 1, product_id: 1, sauce_name: 'Saus Original', type: 'original', price: 6000, qty_per_pack: 4, is_active: true, created_at: daysAgo(12) },
    { id: 2, product_id: 1, sauce_name: 'Saus Pedas Manis', type: 'original', price: 7000, qty_per_pack: 4, is_active: true, created_at: daysAgo(12) },
    { id: 3, product_id: 2, sauce_name: 'Saus Keju', type: 'crispy', price: 9000, qty_per_pack: 5, is_active: true, created_at: daysAgo(11) },
    { id: 4, product_id: 2, sauce_name: 'Saus BBQ', type: 'crispy', price: 9000, qty_per_pack: 5, is_active: true, created_at: daysAgo(11) },
    { id: 5, product_id: 3, sauce_name: 'Twin Cup Mix', type: 'twin_cup', price: 15000, qty_per_pack: 8, is_active: true, created_at: daysAgo(9) },
    { id: 6, product_id: 3, sauce_name: 'Sempol Bakar Pedas', type: 'bakar', price: 12000, qty_per_pack: 6, is_active: true, created_at: daysAgo(8) }
  ]

  const rawMaterials = [
    { id: 1, name: 'Ayam giling', unit: 'kg', current_stock: 12, min_stock: 5, is_active: true, created_at: daysAgo(18) },
    { id: 2, name: 'Tepung tapioka', unit: 'kg', current_stock: 7, min_stock: 4, is_active: true, created_at: daysAgo(18) },
    { id: 3, name: 'Tusuk sempol', unit: 'pcs', current_stock: 420, min_stock: 200, is_active: true, created_at: daysAgo(18) },
    { id: 4, name: 'Saus DCelup', unit: 'liter', current_stock: 2.5, min_stock: 3, is_active: true, created_at: daysAgo(18) },
    { id: 5, name: 'Minyak goreng', unit: 'liter', current_stock: 1.5, min_stock: 3, is_active: true, created_at: daysAgo(18) }
  ]

  const expenseCategories = [
    { id: 1, name: 'Bahan Baku', is_default: true, is_active: true, created_at: daysAgo(20) },
    { id: 2, name: 'Operasional Outlet', is_default: true, is_active: true, created_at: daysAgo(20) },
    { id: 3, name: 'Kemasan', is_default: false, is_active: true, created_at: daysAgo(12) },
    { id: 4, name: 'Listrik dan Air', is_default: false, is_active: true, created_at: daysAgo(12) }
  ]

  const expenses = [
    { id: 1, category_id: 1, amount: 325000, expense_date: toDateOnly(daysAgo(1)), description: 'Belanja ayam dan tepung', source_type: 'manual', created_at: daysAgo(1, 8, 30) },
    { id: 2, category_id: 3, amount: 68000, expense_date: today(), description: 'Kemasan cup dan plastik', source_type: 'manual', created_at: daysAgo(0, 10, 20) },
    { id: 3, category_id: 1, amount: 180000, expense_date: today(), description: 'Barang masuk Ayam giling', source_type: 'auto_stock', created_at: daysAgo(0, 8, 5) }
  ]

  const stockMovements = [
    { id: 1, raw_material_id: 1, material_id: 1, type: 'in', qty: 6, balance_before: 6, balance_after: 12, price_per_unit: 30000, total_price: 180000, movement_date: today(), note: 'Restock pagi', created_at: daysAgo(0, 8, 5) },
    { id: 2, raw_material_id: 4, material_id: 4, type: 'out', qty: 1, balance_before: 3.5, balance_after: 2.5, price_per_unit: 0, total_price: 0, movement_date: today(), note: 'Dipakai produksi', created_at: daysAgo(0, 9, 10) },
    { id: 3, raw_material_id: 5, material_id: 5, type: 'adjustment', qty: 0.5, balance_before: 2, balance_after: 1.5, price_per_unit: 0, total_price: 0, movement_date: toDateOnly(daysAgo(1)), note: 'Koreksi opname', created_at: daysAgo(1, 17, 0) }
  ]

  const transactions = [
    buildSeedTransaction(1, 'TRX-' + today().replaceAll('-', '') + '-001', users[1], recentMinutesAgo(35), 'Rina', 'cash', 'paid', [
      { variant: productVariants[1], qty: 2 },
      { variant: productVariants[2], qty: 1 }
    ]),
    buildSeedTransaction(2, 'TRX-' + today().replaceAll('-', '') + '-002', users[1], daysAgo(0, 12, 15), 'Pembeli Umum', 'qris', 'paid', [
      { variant: productVariants[4], qty: 1 },
      { variant: productVariants[0], qty: 3 }
    ]),
    buildSeedTransaction(3, 'TRX-' + toDateOnly(daysAgo(1)).replaceAll('-', '') + '-001', users[2], daysAgo(1, 13, 20), 'Dewi', 'transfer', 'paid', [
      { variant: productVariants[3], qty: 2 }
    ]),
    buildSeedTransaction(4, 'TRX-' + toDateOnly(daysAgo(2)).replaceAll('-', '') + '-001', users[1], daysAgo(2, 10, 0), 'Andi', 'cash', 'canceled', [
      { variant: productVariants[5], qty: 1 }
    ], 'Pesanan dibatalkan pelanggan')
  ]

  return {
    users,
    products,
    productVariants,
    rawMaterials,
    expenseCategories,
    expenses,
    stockMovements,
    transactions,
    activityLogs: [
      { id: 1, user_id: 1, action: 'login', module: 'auth', detail: 'Admin dummy login', created_at: daysAgo(0, 8, 0) },
      { id: 2, user_id: 2, action: 'create', module: 'transactions', detail: 'Transaksi dummy berhasil dibuat', created_at: recentMinutesAgo(35) },
      { id: 3, user_id: 1, action: 'stock_in', module: 'stock', detail: 'Restock Ayam giling', created_at: daysAgo(0, 8, 5) }
    ]
  }
}

function buildSeedTransaction(id, trxCode, user, createdAt, customerName, paymentMethod, status, lines, cancelReason = null) {
  const items = lines.map((line, index) => {
    const unitPrice = Number(line.variant.price)
    const qty = Number(line.qty)
    return {
      id: id * 100 + index + 1,
      product_variant_id: line.variant.id,
      variant_id: line.variant.id,
      product_variant: clone(line.variant),
      variant: clone(line.variant),
      qty,
      unit_price: unitPrice,
      subtotal: unitPrice * qty
    }
  })
  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0)

  return {
    id,
    trx_code: trxCode,
    customer_name: customerName,
    payment_method: paymentMethod,
    paid_amount: paymentMethod === 'cash' ? totalAmount + 10000 : totalAmount,
    change_amount: paymentMethod === 'cash' ? 10000 : 0,
    total_amount: totalAmount,
    status,
    cancel_reason: cancelReason,
    canceled_at: cancelReason ? daysAgo(2, 10, 25) : null,
    user_id: user.id,
    user: clone(user),
    items,
    transaction_items: items,
    trx_date: toDateOnly(createdAt),
    created_at: createdAt
  }
}

function loadDb() {
  if (typeof window === 'undefined') return seedDb()

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch (_) {
    // Ignore broken browser storage and fall back to fresh dummy data.
  }

  const db = seedDb()
  persistDb(db)
  return db
}

function persistDb(db) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch (_) {
    // Mock data persistence is best effort only.
  }
}

let db = loadDb()

export function createMockAdapter() {
  return async function mockAdapter(config) {
    await delay(MOCK_DELAY_MS)

    try {
      const result = handleRequest(config)
      return makeResponse(config, result.data, result.status, result.headers)
    } catch (error) {
      return Promise.reject(toAxiosError(error, config))
    }
  }
}

function delay(ms) {
  return new Promise((resolve) => globalThis.setTimeout(resolve, ms))
}

function handleRequest(config) {
  const method = (config.method || 'get').toLowerCase()
  const url = new URL(config.url || '/', 'http://mock.local')
  const path = url.pathname.replace(/^\/api\/v\d+/, '') || '/'
  const params = { ...Object.fromEntries(url.searchParams.entries()), ...(config.params || {}) }
  const payload = parsePayload(config.data)
  const segments = path.split('/').filter(Boolean)

  if (segments[0] === 'auth') return handleAuth(method, segments, payload, config)
  if (segments[0] === 'dashboard') return handleDashboard(method, segments, params, config)
  if (segments[0] === 'products') return handleCrud(method, segments, payload, params, 'products', withProductDefaults)
  if (segments[0] === 'product-variants') return handleCrud(method, segments, payload, params, 'productVariants', withVariantRelations)
  if (segments[0] === 'raw-materials') return handleCrud(method, segments, payload, params, 'rawMaterials', withIdentity)
  if (segments[0] === 'expense-categories') return handleCrud(method, segments, payload, params, 'expenseCategories', withIdentity)
  if (segments[0] === 'expenses') return handleExpenses(method, segments, payload, params)
  if (segments[0] === 'stock-movements') return handleStockMovements(method, segments, payload, params, config)
  if (segments[0] === 'transactions') return handleTransactions(method, segments, payload, params, config)
  if (segments[0] === 'reports') return handleReports(method, segments, params)
  if (segments[0] === 'users') return handleUsers(method, segments, payload, params)
  if (segments[0] === 'activity-logs') return handleActivityLogs(method, params)

  throw httpError(404, 'Endpoint dummy belum tersedia.')
}

function parsePayload(data) {
  if (!data) return {}
  if (typeof data === 'string') {
    try {
      return JSON.parse(data)
    } catch (_) {
      return {}
    }
  }
  return data
}

function handleAuth(method, segments, payload, config) {
  const action = segments[1]

  if (method === 'post' && action === 'login') {
    const login = String(payload.login || payload.username || payload.email || '').toLowerCase().trim()
    const user = db.users.find((item) => item.is_active && [item.username, item.email].includes(login)) || db.users[0]

    if (!login) throw httpError(422, 'Login wajib diisi.', { login: ['Login wajib diisi.'] })

    addActivity(user, 'login', 'auth', 'Login dummy berhasil')
    persistDb(db)

    return ok({
      token: `mock-token-${user.id}`,
      user: publicUser(user)
    }, 'Login dummy berhasil')
  }

  if (method === 'post' && action === 'logout') {
    return ok(null, 'Logout dummy berhasil')
  }

  if (method === 'get' && action === 'me') {
    return ok(publicUser(currentUser(config)), 'User dummy aktif')
  }

  throw httpError(404, 'Endpoint auth dummy tidak ditemukan.')
}

function handleDashboard(method, segments, params, config) {
  if (method !== 'get') throw httpError(405, 'Method tidak didukung.')

  const action = segments[1]
  if (action === 'admin-summary') return ok(buildSummary())
  if (action === 'cashier-summary') return ok(buildSummary(currentUser(config).id))
  if (action === 'weekly-sales') return ok(buildWeeklySales(params))
  if (action === 'top-products') return ok(buildTopProducts(params))
  if (action === 'low-stock-materials') {
    return ok(db.rawMaterials.filter((item) => item.is_active && Number(item.current_stock) <= Number(item.min_stock)).map(withIdentity))
  }

  throw httpError(404, 'Endpoint dashboard dummy tidak ditemukan.')
}

function handleCrud(method, segments, payload, params, collectionName, relationMapper) {
  const collection = db[collectionName]

  if (method === 'get' && segments.length === 1) {
    const items = filterActive(collection, params).map(relationMapper)
    return listOk(items, params)
  }

  const id = Number(segments[1])
  const item = collection.find((entry) => Number(entry.id) === id)

  if (method === 'get' && segments.length === 2) {
    if (!item) throw httpError(404, 'Data tidak ditemukan.')
    return ok(relationMapper(item))
  }

  if (method === 'post' && segments.length === 1) {
    const created = {
      id: nextId(collection),
      ...normalizeCrudPayload(collectionName, payload),
      is_active: payload.is_active ?? true,
      created_at: now().toISOString()
    }
    collection.push(created)
    addActivity(currentUser(), 'create', collectionName, `Tambah data ${collectionName}`)
    persistDb(db)
    return ok(relationMapper(created), 'Data dummy berhasil dibuat', null, 201)
  }

  if (method === 'put' && segments.length === 2) {
    if (!item) throw httpError(404, 'Data tidak ditemukan.')
    Object.assign(item, normalizeCrudPayload(collectionName, payload), { updated_at: now().toISOString() })
    addActivity(currentUser(), 'update', collectionName, `Update data ${collectionName} #${id}`)
    persistDb(db)
    return ok(relationMapper(item), 'Data dummy berhasil diperbarui')
  }

  if (method === 'patch' && segments[2] === 'deactivate') {
    if (!item) throw httpError(404, 'Data tidak ditemukan.')
    item.is_active = false
    item.updated_at = now().toISOString()
    addActivity(currentUser(), 'deactivate', collectionName, `Nonaktifkan data ${collectionName} #${id}`)
    persistDb(db)
    return ok(relationMapper(item), 'Data dummy berhasil dinonaktifkan')
  }

  throw httpError(404, 'Endpoint CRUD dummy tidak ditemukan.')
}

function handleExpenses(method, segments, payload, params) {
  if (method === 'get' && segments.length === 1) {
    const items = db.expenses.map(withExpenseRelations).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    return listOk(items, params)
  }

  const id = Number(segments[1])
  const expense = db.expenses.find((item) => Number(item.id) === id)

  if (method === 'get' && segments.length === 2) {
    if (!expense) throw httpError(404, 'Pengeluaran tidak ditemukan.')
    return ok(withExpenseRelations(expense))
  }

  if (method === 'post' && segments.length === 1) {
    const category = findById(db.expenseCategories, payload.category_id)
    if (!category) throw httpError(422, 'Kategori wajib dipilih.', { category_id: ['Kategori wajib dipilih.'] })

    const created = {
      id: nextId(db.expenses),
      category_id: Number(payload.category_id),
      amount: Number(payload.amount || 0),
      expense_date: payload.expense_date || today(),
      description: payload.description || 'Pengeluaran manual',
      source_type: payload.source_type || 'manual',
      created_at: now().toISOString()
    }
    db.expenses.push(created)
    addActivity(currentUser(), 'create', 'expenses', `Tambah pengeluaran ${created.description}`)
    persistDb(db)
    return ok(withExpenseRelations(created), 'Pengeluaran dummy berhasil dibuat', null, 201)
  }

  if (method === 'put' && segments.length === 2) {
    if (!expense) throw httpError(404, 'Pengeluaran tidak ditemukan.')
    Object.assign(expense, {
      category_id: Number(payload.category_id || expense.category_id),
      amount: Number(payload.amount ?? expense.amount),
      expense_date: payload.expense_date || expense.expense_date,
      description: payload.description ?? expense.description,
      updated_at: now().toISOString()
    })
    persistDb(db)
    return ok(withExpenseRelations(expense), 'Pengeluaran dummy berhasil diperbarui')
  }

  throw httpError(404, 'Endpoint pengeluaran dummy tidak ditemukan.')
}

function handleStockMovements(method, segments, payload, params, config) {
  if (method === 'get' && segments.length === 1) {
    const items = db.stockMovements.map(withStockRelations).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    return listOk(items, params)
  }

  if (method === 'post' && ['in', 'out', 'adjustment'].includes(segments[1])) {
    return ok(createStockMovement(segments[1], payload, currentUser(config)), 'Mutasi stok dummy berhasil dibuat', null, 201)
  }

  throw httpError(404, 'Endpoint mutasi stok dummy tidak ditemukan.')
}

function handleTransactions(method, segments, payload, params, config) {
  if (method === 'get' && segments.length === 1) {
    const items = filterByDateRange(db.transactions, params, 'trx_date')
      .map(withTransactionRelations)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    return listOk(items, params)
  }

  const id = Number(segments[1])
  const transaction = db.transactions.find((item) => Number(item.id) === id)

  if (method === 'get' && segments.length === 2) {
    if (!transaction) throw httpError(404, 'Transaksi tidak ditemukan.')
    return ok(withTransactionRelations(transaction))
  }

  if (method === 'post' && segments.length === 1) {
    return ok(createTransaction(payload, currentUser(config)), 'Transaksi dummy berhasil dibuat', null, 201)
  }

  if (method === 'post' && segments[2] === 'cancel') {
    if (!transaction) throw httpError(404, 'Transaksi tidak ditemukan.')
    if (transaction.status === 'canceled') throw httpError(422, 'Transaksi sudah dibatalkan.')

    transaction.status = 'canceled'
    transaction.cancel_reason = payload.reason || payload.cancel_reason || 'Dibatalkan dari mode dummy'
    transaction.canceled_at = now().toISOString()
    transaction.updated_at = now().toISOString()
    addActivity(currentUser(config), 'cancel', 'transactions', `Batalkan transaksi ${transaction.trx_code}`)
    persistDb(db)
    return ok(withTransactionRelations(transaction), 'Transaksi dummy berhasil dibatalkan')
  }

  throw httpError(404, 'Endpoint transaksi dummy tidak ditemukan.')
}

function handleReports(method, segments, params) {
  if (method !== 'get') throw httpError(405, 'Method tidak didukung.')

  const report = buildReport(params)
  const reportType = segments[1]
  const format = segments[2]

  if (['weekly', 'custom'].includes(reportType) && !format) return ok(report)
  if (['weekly', 'custom'].includes(reportType) && ['pdf', 'excel'].includes(format)) {
    return fileOk(buildReportBlob(report, format), format)
  }

  throw httpError(404, 'Endpoint laporan dummy tidak ditemukan.')
}

function handleUsers(method, segments, payload, params) {
  if (method === 'get' && segments.length === 1) {
    return listOk(filterActive(db.users, params).map(publicUser), params)
  }

  const id = Number(segments[1])
  const user = db.users.find((item) => Number(item.id) === id)

  if (method === 'get' && segments.length === 2) {
    if (!user) throw httpError(404, 'User tidak ditemukan.')
    return ok(publicUser(user))
  }

  if (method === 'post' && segments.length === 1) {
    const created = {
      id: nextId(db.users),
      name: payload.name || 'User Dummy',
      username: payload.username || `user${Date.now()}`,
      email: payload.email || `user${Date.now()}@dcelup.test`,
      password: payload.password || 'password123',
      role: payload.role || 'kasir',
      is_active: payload.is_active ?? true,
      created_at: now().toISOString()
    }
    db.users.push(created)
    addActivity(currentUser(), 'create', 'users', `Tambah user ${created.username}`)
    persistDb(db)
    return ok(publicUser(created), 'User dummy berhasil dibuat', null, 201)
  }

  if (method === 'put' && segments.length === 2) {
    if (!user) throw httpError(404, 'User tidak ditemukan.')
    Object.assign(user, {
      name: payload.name ?? user.name,
      username: payload.username ?? user.username,
      email: payload.email ?? user.email,
      role: payload.role ?? user.role,
      is_active: payload.is_active ?? user.is_active,
      updated_at: now().toISOString()
    })
    persistDb(db)
    return ok(publicUser(user), 'User dummy berhasil diperbarui')
  }

  if (method === 'patch' && segments[2] === 'deactivate') {
    if (!user) throw httpError(404, 'User tidak ditemukan.')
    user.is_active = false
    user.updated_at = now().toISOString()
    persistDb(db)
    return ok(publicUser(user), 'User dummy berhasil dinonaktifkan')
  }

  if (method === 'patch' && segments[2] === 'reset-password') {
    if (!user) throw httpError(404, 'User tidak ditemukan.')
    user.password = payload.password || user.password || 'password123'
    user.updated_at = now().toISOString()
    addActivity(currentUser(), 'reset_password', 'users', `Reset password ${user.username}`)
    persistDb(db)
    return ok(publicUser(user), 'Password dummy berhasil direset')
  }

  throw httpError(404, 'Endpoint user dummy tidak ditemukan.')
}

function handleActivityLogs(method, params) {
  if (method !== 'get') throw httpError(405, 'Method tidak didukung.')
  const items = db.activityLogs
    .map((log) => ({ ...log, user: publicUser(findById(db.users, log.user_id)) }))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  return listOk(items, params)
}

function normalizeCrudPayload(collectionName, payload) {
  if (collectionName === 'products') {
    return {
      name: payload.name || 'Produk Dummy',
      category: payload.category || 'original',
      description: payload.description || ''
    }
  }

  if (collectionName === 'productVariants') {
    return {
      product_id: Number(payload.product_id),
      sauce_name: payload.sauce_name || 'Saus Dummy',
      type: payload.type || 'original',
      price: Number(payload.price || 0),
      qty_per_pack: Number(payload.qty_per_pack || 1)
    }
  }

  if (collectionName === 'rawMaterials') {
    return {
      name: payload.name || 'Bahan Dummy',
      unit: payload.unit || 'kg',
      current_stock: Number(payload.current_stock || 0),
      min_stock: Number(payload.min_stock || 0)
    }
  }

  if (collectionName === 'expenseCategories') {
    return {
      name: payload.name || 'Kategori Dummy',
      is_default: payload.is_default ?? false
    }
  }

  return { ...payload }
}

function createStockMovement(type, payload, user) {
  const materialId = payload.material_id ?? payload.raw_material_id
  const material = findById(db.rawMaterials, materialId)
  if (!material) throw httpError(422, 'Bahan wajib dipilih.', { material_id: ['Bahan wajib dipilih.'] })

  const before = Number(material.current_stock || 0)
  const qtyInput = Number(payload.qty || 0)
  const actualStock = Number(payload.actual_stock ?? before)
  let after = before
  let qty = qtyInput

  if (type === 'in') after = before + qtyInput
  if (type === 'out') after = before - qtyInput
  if (type === 'adjustment') {
    after = actualStock
    qty = Math.abs(after - before)
  }

  if (qty <= 0 && type !== 'adjustment') throw httpError(422, 'Qty harus lebih dari 0.', { qty: ['Qty harus lebih dari 0.'] })
  if (after < 0) throw httpError(422, 'Stok tidak boleh negatif.', { qty: ['Stok tidak cukup.'] })

  const pricePerUnit = Number(payload.price_per_unit || 0)
  const movement = {
    id: nextId(db.stockMovements),
    raw_material_id: material.id,
    material_id: material.id,
    type,
    qty,
    balance_before: before,
    balance_after: after,
    price_per_unit: pricePerUnit,
    total_price: type === 'in' ? pricePerUnit * qty : 0,
    movement_date: payload.movement_date || today(),
    note: payload.note || '',
    user_id: user.id,
    created_at: now().toISOString()
  }

  material.current_stock = Number(after.toFixed(3))
  material.updated_at = now().toISOString()
  db.stockMovements.push(movement)

  if (type === 'in' && movement.total_price > 0) {
    db.expenses.push({
      id: nextId(db.expenses),
      category_id: 1,
      amount: movement.total_price,
      expense_date: movement.movement_date,
      description: `Barang masuk ${material.name}`,
      source_type: 'auto_stock',
      stock_movement_id: movement.id,
      created_at: now().toISOString()
    })
  }

  addActivity(user, `stock_${type}`, 'stock', `${type} ${material.name}`)
  persistDb(db)
  return withStockRelations(movement)
}

function createTransaction(payload, user) {
  const lines = Array.isArray(payload.items) ? payload.items : []
  if (!lines.length) throw httpError(422, 'Item transaksi wajib diisi.', { items: ['Item transaksi wajib diisi.'] })

  const id = nextId(db.transactions)
  const items = lines.map((line, index) => {
    const variantId = Number(line.variant_id ?? line.product_variant_id)
    const variant = db.productVariants.find((item) => item.is_active && Number(item.id) === variantId)
    if (!variant) throw httpError(422, 'Varian produk tidak ditemukan.', { items: ['Varian produk tidak ditemukan.'] })

    const qty = Number(line.qty || 1)
    const unitPrice = Number(variant.price || 0)
    const variantWithRelation = withVariantRelations(variant)
    return {
      id: id * 100 + index + 1,
      product_variant_id: variant.id,
      variant_id: variant.id,
      product_variant: variantWithRelation,
      variant: variantWithRelation,
      qty,
      unit_price: unitPrice,
      subtotal: unitPrice * qty
    }
  })

  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0)
  const paidAmount = Number(payload.paid_amount || totalAmount)
  const trxDate = today()
  const transaction = {
    id,
    trx_code: `TRX-${trxDate.replaceAll('-', '')}-${String(id).padStart(3, '0')}`,
    customer_name: payload.customer_name || 'Pembeli Umum',
    payment_method: payload.payment_method || 'cash',
    paid_amount: paidAmount,
    change_amount: Math.max(0, paidAmount - totalAmount),
    total_amount: totalAmount,
    status: 'paid',
    user_id: user.id,
    user: publicUser(user),
    items,
    transaction_items: items,
    trx_date: trxDate,
    created_at: now().toISOString()
  }

  db.transactions.push(transaction)
  addActivity(user, 'create', 'transactions', `Buat transaksi ${transaction.trx_code}`)
  persistDb(db)
  return withTransactionRelations(transaction)
}

function buildSummary(userId = null) {
  const currentDate = today()
  const transactions = db.transactions.filter((item) => {
    if (item.status !== 'paid') return false
    if (item.trx_date !== currentDate) return false
    if (userId && Number(item.user_id) !== Number(userId)) return false
    return true
  })
  const expenses = db.expenses.filter((item) => item.expense_date === currentDate)
  const totalIncome = sumBy(transactions, 'total_amount')
  const totalExpense = sumBy(expenses, 'amount')

  return {
    total_income: totalIncome,
    total_sales: totalIncome,
    total_expense: totalExpense,
    total_expenses: totalExpense,
    cash_difference: totalIncome - totalExpense,
    estimated_cash_difference: totalIncome - totalExpense,
    total_transactions: transactions.length
  }
}

function buildWeeklySales(params = {}) {
  const period = params.period || 'weekly'
  const days = period === 'monthly' ? 30 : 7
  return Array.from({ length: days }).map((_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - ((days - 1) - index))
    const dateOnly = toDateOnly(date)
    const transactions = db.transactions.filter((item) => item.status === 'paid' && item.trx_date === dateOnly)
    const expenses = db.expenses.filter((item) => item.expense_date === dateOnly)
    const totalIncome = sumBy(transactions, 'total_amount')
    const totalExpense = sumBy(expenses, 'amount')
    return {
      date: dateOnly,
      label: dateOnly.slice(5),
      total_amount: totalIncome,
      total_income: totalIncome,
      total_expense: totalExpense,
      total: totalIncome,
      amount: totalIncome,
      total_sales: totalIncome,
      total_transactions: transactions.length
    }
  })
}

function buildTopProducts(params) {
  const totals = new Map()
  db.transactions
    .filter((transaction) => transaction.status === 'paid')
    .forEach((transaction) => {
      transaction.items.forEach((item) => {
        const key = item.product_variant_id
        const previous = totals.get(key) || { product_variant_id: key, total_qty: 0, total_amount: 0 }
        previous.total_qty += Number(item.qty || 0)
        previous.qty = previous.total_qty
        previous.total_amount += Number(item.subtotal || 0)
        totals.set(key, previous)
      })
    })

  const limit = Number(params.limit || 5)
  return Array.from(totals.values())
    .map((item) => ({ ...item, product_variant: withVariantRelations(findById(db.productVariants, item.product_variant_id)), name: withVariantRelations(findById(db.productVariants, item.product_variant_id))?.sauce_name }))
    .sort((a, b) => b.total_qty - a.total_qty)
    .slice(0, limit)
}

function buildReport(params) {
  const from = params.date_from || params.from || today()
  const to = params.date_to || params.to || today()
  const transactions = filterByDateRange(db.transactions.filter((item) => item.status === 'paid'), { date_from: from, date_to: to }, 'trx_date')
  const expenses = db.expenses.filter((item) => item.expense_date >= from && item.expense_date <= to)
  const stockMovements = db.stockMovements.filter((item) => item.movement_date >= from && item.movement_date <= to)
  const totalIncome = sumBy(transactions, 'total_amount')
  const totalExpense = sumBy(expenses, 'amount')

  return {
    date_from: from,
    date_to: to,
    total_income: totalIncome,
    total_sales: totalIncome,
    total_expense: totalExpense,
    total_expenses: totalExpense,
    cash_difference: totalIncome - totalExpense,
    estimated_cash_difference: totalIncome - totalExpense,
    total_transactions: transactions.length,
    product_sales: buildReportProductSales(transactions),
    expense_categories: buildReportExpenseCategories(expenses),
    stock_movements: stockMovements.map(withStockRelations)
  }
}

function buildReportProductSales(transactions) {
  const groups = new Map()

  transactions.forEach((transaction) => {
    ;(transaction.items || []).forEach((item) => {
      const variant = withVariantRelations(findById(db.productVariants, item.product_variant_id) || item.product_variant || item.variant)
      const key = item.product_variant_id
      const previous = groups.get(key) || {
        product_name: variant?.product?.name || 'Produk',
        variant_name: `${variant?.sauce_name || 'Varian'} - ${variant?.type || '-'}`,
        qty: 0,
        total_amount: 0
      }
      previous.qty += Number(item.qty || 0)
      previous.total_amount += Number(item.subtotal || 0)
      groups.set(key, previous)
    })
  })

  return Array.from(groups.values())
}

function buildReportExpenseCategories(expenses) {
  const groups = new Map()

  db.expenseCategories
    .filter((category) => category.is_active !== false)
    .forEach((category) => {
      groups.set(category.id, { category_name: category.name, total: 0 })
    })

  expenses.forEach((expense) => {
    const category = findById(db.expenseCategories, expense.category_id)
    const key = category?.id || expense.category_id || 'lainnya'
    const previous = groups.get(key) || { category_name: category?.name || 'Lainnya', total: 0 }
    previous.total += Number(expense.amount || 0)
    groups.set(key, previous)
  })

  return Array.from(groups.values())
}

function buildReportBlob(report, format) {
  if (format === 'pdf') {
    return new Blob([buildReportPdf(report)], { type: 'application/pdf' })
  }

  return new Blob([buildReportXlsx(report)], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
}

function buildReportPdf(report) {
  const stream = createPdfStream()
  const margin = 34
  const tableWidth = 526
  let y = 774

  stream.text("Laporan D'Celup Sempol Ayam", margin, y, 18, true)
  y -= 26
  stream.text(`Periode: ${report.date_from} s/d ${report.date_to}`, margin, y, 9)
  y -= 32

  stream.heading('Ringkasan Kas', margin, y)
  y -= 36
  y = stream.keyValueRow(margin + 0.75, y, 361.282, 'Total Penjualan', rupiah(report.total_income))
  y = stream.keyValueRow(margin + 0.75, y, 361.282, 'Total Pengeluaran', rupiah(report.total_expense))
  y = stream.keyValueRow(margin + 0.75, y, 361.282, 'Estimasi Selisih Kas', rupiah(report.cash_difference))
  y -= 8
  stream.text('Laporan ini bukan laporan laba rugi formal. HPP belum dihitung.', margin, y, 8.2, false, 'muted')
  y -= 34

  stream.heading('Penjualan per Produk', margin, y)
  y -= 36
  y = stream.table(margin + 0.75, y, [
    { label: 'Produk', width: 154.1 },
    { label: 'Varian', width: 186.8 },
    { label: 'Qty', width: 52.1 },
    { label: 'Pendapatan', width: 132.9 }
  ], report.product_sales?.length ? report.product_sales.map((item) => [
    item.product_name,
    item.variant_name,
    formatQty(item.qty),
    rupiah(item.total_amount)
  ]) : [['Belum ada penjualan', '-', '0', rupiah(0)]])
  y -= 34

  stream.heading('Pengeluaran per Kategori', margin, y)
  y -= 36
  y = stream.table(margin + 0.75, y, [
    { label: 'Kategori', width: 338.2 },
    { label: 'Total', width: 188.3 }
  ], report.expense_categories?.length ? report.expense_categories.map((item) => [
    item.category_name,
    rupiah(item.total)
  ]) : [['Bahan Baku', rupiah(0)]])
  y -= 34

  stream.heading('Mutasi Stok', margin, y)
  y -= 36
  stream.table(margin + 0.75, y, [
    { label: 'Tanggal', width: 126.8 },
    { label: 'Bahan', width: 85.1 },
    { label: 'Jenis', width: 69.6 },
    { label: 'Qty', width: 72.6 },
    { label: 'Saldo Sesudah', width: 172.5 }
  ], report.stock_movements?.length ? report.stock_movements.slice(0, 12).map((item) => [
    item.movement_date,
    item.raw_material?.name || item.material?.name || '-',
    item.type,
    formatQty(item.qty),
    formatQty(item.balance_after)
  ]) : [[report.date_from, '-', '-', '0', '0']])

  const content = stream.toString()

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`
  ]

  let pdf = '%PDF-1.4\n'
  const offsets = [0]

  objects.forEach((object, index) => {
    offsets.push(pdf.length)
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
  })

  const xrefOffset = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n`
  pdf += '0000000000 65535 f \n'
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`
  })
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`

  return pdf
}

function buildReportXlsx(report) {
  const rows = [
    ['Laporan Dummy DCelup', ''],
    ['Periode', `${report.date_from} s/d ${report.date_to}`],
    ['Pemasukan', Number(report.total_income || 0)],
    ['Pengeluaran', Number(report.total_expense || 0)],
    ['Estimasi Selisih Kas', Number(report.cash_difference || 0)],
    ['Total Transaksi', Number(report.total_transactions || 0)]
  ]

  const files = {
    '[Content_Types].xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`,
    '_rels/.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`,
    'xl/workbook.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Laporan" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`,
    'xl/_rels/workbook.xml.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`,
    'xl/worksheets/sheet1.xml': buildWorksheetXml(rows)
  }

  return buildZip(files)
}

function createPdfStream() {
  const ops = []
  const colors = {
    dark: [0.067, 0.094, 0.153],
    muted: [0.42, 0.447, 0.502],
    header: [0.953, 0.957, 0.965],
    border: [0.82, 0.835, 0.859],
    white: [1, 1, 1]
  }

  function colorCommand(name, command) {
    const value = colors[name] || colors.dark
    ops.push(`${value.map(formatPdfNumber).join(' ')} ${command}`)
  }

  function rect(x, y, width, height, fill = null) {
    ops.push('q')
    if (fill) {
      colorCommand(fill, 'rg')
      ops.push(`${formatPdfNumber(x)} ${formatPdfNumber(y)} ${formatPdfNumber(width)} ${formatPdfNumber(height)} re`)
      ops.push('f')
    }
    colorCommand('border', 'RG')
    ops.push('0.75 w')
    ops.push(`${formatPdfNumber(x)} ${formatPdfNumber(y)} ${formatPdfNumber(width)} ${formatPdfNumber(height)} re`)
    ops.push('S')
    ops.push('Q')
  }

  function text(value, x, y, size = 9, bold = false, color = 'dark', maxWidth = null) {
    colorCommand(color, 'rg')
    ops.push('BT')
    ops.push(`/${bold ? 'F2' : 'F1'} ${formatPdfNumber(size)} Tf`)
    ops.push(`${formatPdfNumber(x)} ${formatPdfNumber(y)} Td`)
    ops.push(`(${escapePdfText(fitPdfText(value, maxWidth, size))}) Tj`)
    ops.push('ET')
  }

  function heading(value, x, y) {
    text(value, x, y, 13.5, true)
  }

  function keyValueRow(x, y, labelWidth, label, value) {
    const height = 22.828
    rect(x, y, labelWidth, height, 'header')
    text(label, x + 4.5, y + 7.266, 9, true, 'dark', labelWidth - 9)
    text(value, x + labelWidth + 5.25, y + 7.266, 9, false, 'dark', 526 - labelWidth - 10)
    return y - 23.578
  }

  function table(x, y, columns, rows) {
    const height = 22.828
    let cursorX = x

    columns.forEach((column) => {
      rect(cursorX, y, column.width, height, 'header')
      text(column.label, cursorX + 4.5, y + 7.266, 9, true, 'dark', column.width - 9)
      cursorX += column.width
    })

    let cursorY = y - 23.578
    rows.forEach((row) => {
      cursorX = x
      columns.forEach((column, index) => {
        rect(cursorX, cursorY, column.width, height)
        text(row[index] ?? '-', cursorX + 4.5, cursorY + 7.266, 9, false, 'dark', column.width - 9)
        cursorX += column.width
      })
      cursorY -= 23.578
    })

    return cursorY
  }

  return {
    text,
    heading,
    keyValueRow,
    table,
    toString() {
      return ops.join('\n')
    }
  }
}

function buildWorksheetXml(rows) {
  const rowXml = rows.map((row, rowIndex) => {
    const rowNumber = rowIndex + 1
    const cells = row.map((value, cellIndex) => {
      const ref = `${columnName(cellIndex + 1)}${rowNumber}`
      if (typeof value === 'number') return `<c r="${ref}"><v>${value}</v></c>`
      return `<c r="${ref}" t="inlineStr"><is><t>${escapeXml(value)}</t></is></c>`
    }).join('')
    return `<row r="${rowNumber}">${cells}</row>`
  }).join('')

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>${rowXml}</sheetData>
</worksheet>`
}

function buildZip(files) {
  const encoder = new TextEncoder()
  const localParts = []
  const centralParts = []
  let offset = 0

  Object.entries(files).forEach(([name, content]) => {
    const nameBytes = encoder.encode(name)
    const data = typeof content === 'string' ? encoder.encode(content) : content
    const crc = crc32(data)
    const localHeader = zipHeader(30, [
      ['u32', 0x04034b50],
      ['u16', 20],
      ['u16', 0],
      ['u16', 0],
      ['u16', 0],
      ['u16', 0],
      ['u32', crc],
      ['u32', data.length],
      ['u32', data.length],
      ['u16', nameBytes.length],
      ['u16', 0]
    ])

    localParts.push(localHeader, nameBytes, data)

    const centralHeader = zipHeader(46, [
      ['u32', 0x02014b50],
      ['u16', 20],
      ['u16', 20],
      ['u16', 0],
      ['u16', 0],
      ['u16', 0],
      ['u16', 0],
      ['u32', crc],
      ['u32', data.length],
      ['u32', data.length],
      ['u16', nameBytes.length],
      ['u16', 0],
      ['u16', 0],
      ['u16', 0],
      ['u16', 0],
      ['u32', 0],
      ['u32', offset]
    ])

    centralParts.push(centralHeader, nameBytes)
    offset += localHeader.length + nameBytes.length + data.length
  })

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0)
  const centralOffset = offset
  const endRecord = zipHeader(22, [
    ['u32', 0x06054b50],
    ['u16', 0],
    ['u16', 0],
    ['u16', Object.keys(files).length],
    ['u16', Object.keys(files).length],
    ['u32', centralSize],
    ['u32', centralOffset],
    ['u16', 0]
  ])

  return concatBytes([...localParts, ...centralParts, endRecord])
}

function zipHeader(size, fields) {
  const bytes = new Uint8Array(size)
  const view = new DataView(bytes.buffer)
  let offset = 0

  fields.forEach(([type, value]) => {
    if (type === 'u16') {
      view.setUint16(offset, value, true)
      offset += 2
    } else {
      view.setUint32(offset, value >>> 0, true)
      offset += 4
    }
  })

  return bytes
}

function concatBytes(parts) {
  const total = parts.reduce((sum, part) => sum + part.length, 0)
  const output = new Uint8Array(total)
  let offset = 0
  parts.forEach((part) => {
    output.set(part, offset)
    offset += part.length
  })
  return output
}

function crc32(data) {
  let crc = 0xffffffff
  for (let i = 0; i < data.length; i += 1) {
    crc ^= data[i]
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
    }
  }
  return (crc ^ 0xffffffff) >>> 0
}

function columnName(index) {
  let name = ''
  let value = index
  while (value > 0) {
    const remainder = (value - 1) % 26
    name = String.fromCharCode(65 + remainder) + name
    value = Math.floor((value - 1) / 26)
  }
  return name
}

function rupiah(value) {
  return `Rp ${formatNumber(value)}`
}

function formatQty(value) {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: Number.isInteger(Number(value)) ? 0 : 3,
    maximumFractionDigits: 3
  }).format(Number(value || 0))
}

function formatPdfNumber(value) {
  return Number(value).toFixed(3).replace(/\.?0+$/, '')
}

function fitPdfText(value, maxWidth, fontSize) {
  const text = String(value ?? '')
  if (!maxWidth) return text

  const maxChars = Math.max(1, Math.floor(maxWidth / (fontSize * 0.52)))
  if (text.length <= maxChars) return text
  if (maxChars <= 3) return text.slice(0, maxChars)
  return `${text.slice(0, maxChars - 3)}...`
}

function escapePdfText(value) {
  return String(value).replace(/[\\()]/g, '\\$&')
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function formatNumber(value) {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(Number(value || 0))
}

function filterActive(items, params) {
  if (params.include_inactive === true || params.include_inactive === 'true') return items
  if (params.is_active !== undefined) {
    const active = params.is_active === true || params.is_active === 'true' || params.is_active === 1 || params.is_active === '1'
    return items.filter((item) => Boolean(item.is_active) === active)
  }
  return items.filter((item) => item.is_active !== false)
}

function filterByDateRange(items, params, field) {
  const from = params.date_from
  const to = params.date_to
  return items.filter((item) => {
    const value = item[field] || toDateOnly(item.created_at)
    if (from && value < from) return false
    if (to && value > to) return false
    return true
  })
}

function listOk(items, params) {
  const filtered = applySearch(items, params)
  const page = Math.max(1, Number(params.page || 1))
  const perPage = Math.max(1, Number(params.per_page || filtered.length || 15))
  const total = filtered.length
  const start = (page - 1) * perPage
  const data = filtered.slice(start, start + perPage)
  const meta = {
    current_page: page,
    per_page: perPage,
    total,
    last_page: Math.max(1, Math.ceil(total / perPage)),
    from: total ? start + 1 : null,
    to: total ? start + data.length : null
  }

  return ok(data, 'Data dummy berhasil dimuat', meta)
}

function applySearch(items, params) {
  const query = String(params.search || params.q || '').toLowerCase().trim()
  if (!query) return items
  return items.filter((item) => JSON.stringify(item).toLowerCase().includes(query))
}

function ok(data, message = 'OK', meta = null, status = 200) {
  const body = { success: true, message, data }
  if (meta) body.meta = meta
  return { status, data: body }
}

function fileOk(data, format) {
  return {
    status: 200,
    data,
    headers: {
      'Content-Type': format === 'pdf'
        ? 'application/pdf'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }
  }
}

function makeResponse(config, data, status = 200, headers = {}) {
  return {
    data,
    status,
    statusText: status >= 400 ? 'Error' : 'OK',
    headers,
    config,
    request: {}
  }
}

function httpError(status, message, errors = null) {
  const error = new Error(message)
  error.status = status
  error.data = { success: false, message }
  if (errors) error.data.errors = errors
  return error
}

function toAxiosError(error, config) {
  if (error.response) return error
  const axiosError = new Error(error.message || 'Terjadi kesalahan dummy API.')
  axiosError.isAxiosError = true
  axiosError.config = config
  axiosError.response = makeResponse(config, error.data || { success: false, message: axiosError.message }, error.status || 500)
  return axiosError
}

function withIdentity(item) {
  return clone(item)
}

function withProductDefaults(product) {
  return withIdentity(product)
}

function withVariantRelations(variant) {
  if (!variant) return null
  return {
    ...clone(variant),
    product: withIdentity(findById(db.products, variant.product_id))
  }
}

function withExpenseRelations(expense) {
  return {
    ...clone(expense),
    category: withIdentity(findById(db.expenseCategories, expense.category_id)),
    expense_category: withIdentity(findById(db.expenseCategories, expense.category_id))
  }
}

function withStockRelations(movement) {
  return {
    ...clone(movement),
    raw_material: withIdentity(findById(db.rawMaterials, movement.raw_material_id ?? movement.material_id)),
    material: withIdentity(findById(db.rawMaterials, movement.raw_material_id ?? movement.material_id))
  }
}

function withTransactionRelations(transaction) {
  const items = (transaction.items || []).map((item) => {
    const variant = findById(db.productVariants, item.product_variant_id) || item.product_variant || item.variant
    const variantWithRelation = withVariantRelations(variant)
    return {
      ...clone(item),
      product_variant: variantWithRelation,
      variant: variantWithRelation
    }
  })

  return {
    ...clone(transaction),
    user: publicUser(findById(db.users, transaction.user_id) || transaction.user),
    items,
    transaction_items: items
  }
}

function publicUser(user) {
  if (!user) return null
  const { password, ...safeUser } = user
  return clone(safeUser)
}

function currentUser(config = null) {
  const authHeader = getHeader(config?.headers, 'Authorization')
  const tokenMatch = String(authHeader || '').match(/mock-token-(\d+)/)
  const user = tokenMatch ? findById(db.users, tokenMatch[1]) : null
  return user || db.users[0]
}

function getHeader(headers, name) {
  if (!headers) return ''
  if (typeof headers.get === 'function') return headers.get(name) || headers.get(name.toLowerCase())
  return headers[name] || headers[name.toLowerCase()] || ''
}

function addActivity(user, action, module, detail) {
  db.activityLogs.push({
    id: nextId(db.activityLogs),
    user_id: user?.id || 1,
    action,
    module,
    detail,
    created_at: now().toISOString()
  })
}

function findById(items, id) {
  return items.find((item) => Number(item.id) === Number(id)) || null
}

function nextId(items) {
  return items.reduce((max, item) => Math.max(max, Number(item.id || 0)), 0) + 1
}

function sumBy(items, field) {
  return items.reduce((sum, item) => sum + Number(item[field] || 0), 0)
}
