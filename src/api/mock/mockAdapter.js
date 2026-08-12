import {
  initialMockUsers,
  initialMockProducts,
  initialMockVariants,
  initialMockRawMaterials,
  initialMockTransactions
} from './mockData'

export function setupMockAdapter(httpInstance) {
  const originalAdapter = httpInstance.defaults.adapter

  httpInstance.defaults.adapter = async (config) => {
    // Pastikan VITE_USE_MOCK_API aktif
    const useMock = import.meta.env.VITE_USE_MOCK_API === 'true' || import.meta.env.VITE_USE_MOCK_API === true
    if (!useMock) {
      return originalAdapter(config)
    }

    const url = config.url || ''
    const method = (config.method || 'get').toLowerCase()
    
    // helper response json
    const jsonResponse = (data, status = 200) => {
      return Promise.resolve({
        data,
        status,
        statusText: status === 200 ? 'OK' : 'Error',
        headers: { 'content-type': 'application/json' },
        config
      })
    }

    // 1. Auth: Login
    if (url.includes('/auth/login') && method === 'post') {
      const body = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {})
      const loginId = (body.login || body.username || body.email || '').toLowerCase()
      
      const user = initialMockUsers.find(u => 
        u.username.toLowerCase() === loginId || u.email.toLowerCase() === loginId
      ) || initialMockUsers[0] // fallback to admin

      return jsonResponse({
        success: true,
        message: 'Login berhasil (Mock Mode)',
        data: {
          token: 'mock-jwt-token-dcelup-demo',
          user
        }
      })
    }

    // 2. Auth: Me
    if (url.includes('/auth/me') && method === 'get') {
      return jsonResponse({
        success: true,
        message: 'User profile (Mock Mode)',
        data: initialMockUsers[0]
      })
    }

    // 3. Products: List
    if (url.includes('/products') && !url.includes('/product-variants') && method === 'get') {
      const fullProducts = initialMockProducts.map(p => ({
        ...p,
        variants: initialMockVariants.filter(v => v.product_id === p.id && v.is_active === 1)
      }))
      return jsonResponse({
        success: true,
        message: 'Daftar produk berhasil diambil',
        data: {
          data: fullProducts,
          total: fullProducts.length,
          current_page: 1,
          last_page: 1
        }
      })
    }

    // 4. Product Variants: List
    if (url.includes('/product-variants') && method === 'get') {
      const activeVariants = initialMockVariants.map(v => {
        const prod = initialMockProducts.find(p => p.id === v.product_id)
        return {
          ...v,
          product: prod || { id: v.product_id, name: 'Sempol' }
        }
      })
      return jsonResponse({
        success: true,
        message: 'Daftar varian produk berhasil diambil',
        data: {
          data: activeVariants,
          total: activeVariants.length,
          current_page: 1,
          last_page: 1
        }
      })
    }

    // 5. Transactions: Create (Kasir POS Checkout)
    if (url.includes('/transactions') && method === 'post') {
      const body = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {})
      const newTrx = {
        id: initialMockTransactions.length + 1,
        trx_code: `TRX-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(initialMockTransactions.length + 1).padStart(4, '0')}`,
        user_id: 3,
        customer_name: body.customer_name || 'Pelanggan POS',
        total_amount: body.total_amount || body.grand_total || '0.00',
        payment_method: body.payment_method || 'cash',
        paid_amount: body.paid_amount || '0.00',
        change_amount: body.change_amount || '0.00',
        created_at: new Date().toISOString(),
        items: body.items || []
      }
      initialMockTransactions.unshift(newTrx)

      return jsonResponse({
        success: true,
        message: 'Transaksi berhasil disimpan (Mock POS)',
        data: newTrx
      }, 201)
    }

    // 6. Transactions: List
    if (url.includes('/transactions') && method === 'get') {
      return jsonResponse({
        success: true,
        message: 'Daftar transaksi berhasil diambil',
        data: {
          data: initialMockTransactions,
          total: initialMockTransactions.length,
          current_page: 1,
          last_page: 1
        }
      })
    }

    // 7. Dashboard Summaries
    if (url.includes('/dashboard/cashier-summary')) {
      return jsonResponse({
        success: true,
        message: 'Ringkasan kasir berhasil diambil',
        data: {
          today_transactions_count: initialMockTransactions.length,
          today_revenue: initialMockTransactions.reduce((acc, t) => acc + parseFloat(t.total_amount || 0), 0),
          cashier_name: 'Kasir Utama'
        }
      })
    }

    if (url.includes('/dashboard/weekly-sales')) {
      return jsonResponse({
        success: true,
        message: 'Penjualan mingguan berhasil diambil',
        data: [
          { date: 'Senin', total: 150000 },
          { date: 'Selasa', total: 180000 },
          { date: 'Rabu', total: 210000 },
          { date: 'Kamis', total: 190000 },
          { date: 'Jumat', total: 260000 },
          { date: 'Sabtu', total: 320000 },
          { date: 'Minggu', total: 290000 }
        ]
      })
    }

    if (url.includes('/dashboard/top-products')) {
      return jsonResponse({
        success: true,
        message: 'Produk terlaris berhasil diambil',
        data: [
          { name: 'Sempol Crispy - Saus Barbeque', total_qty: 120 },
          { name: 'Sempol Original - Saus Teriyaki', total_qty: 95 },
          { name: 'Sempol Bakar - Saus BBQ Mentai', total_qty: 70 },
          { name: 'Twin Cup - Saus Teriyaki + Kacang', total_qty: 45 }
        ]
      })
    }

    if (url.includes('/dashboard/low-stock-materials')) {
      return jsonResponse({
        success: true,
        message: 'Stok bahan baku berhasil diambil',
        data: initialMockRawMaterials
      })
    }

    if (url.includes('/dashboard/admin-summary')) {
      return jsonResponse({
        success: true,
        message: 'Ringkasan admin berhasil diambil',
        data: {
          total_revenue: 1600000,
          total_transactions: 48,
          total_products: initialMockProducts.length,
          total_raw_materials: initialMockRawMaterials.length
        }
      })
    }

    // 8. Raw Materials
    if (url.includes('/raw-materials') && method === 'get') {
      return jsonResponse({
        success: true,
        message: 'Bahan baku diambil',
        data: { data: initialMockRawMaterials, total: initialMockRawMaterials.length }
      })
    }

    // Fallback attempt original adapter
    try {
      return await originalAdapter(config)
    } catch (err) {
      return jsonResponse({
        success: true,
        message: 'Mock response fallback',
        data: []
      })
    }
  }
}
