// Data Dummy untuk Mock API Vercel / Demo Mode
// Struktur data disesuaikan 100% dengan database dcelup_db (Laravel API)

export const initialMockUsers = [
  { id: 1, name: 'Administrator', username: 'admin', email: 'admin@dcelup.local', role: 'admin', is_active: 1 },
  { id: 2, name: 'Nana Kasir', username: 'nana', email: 'nana@dcelup.local', role: 'kasir', is_active: 1 },
  { id: 3, name: 'Kasir Utama', username: 'kasir', email: 'kasir@dcelup.local', role: 'kasir', is_active: 1 }
]

export const initialMockProducts = [
  {
    id: 1,
    name: "Sempol Ayam Original",
    category: "original",
    description: "Sempol ayam original dengan pilihan saus lezat terfavorit.",
    image_path: null,
    is_active: 1,
    created_at: "2026-07-24 14:11:08"
  },
  {
    id: 2,
    name: "Sempol Ayam Crispy",
    category: "crispy",
    description: "Sempol ayam dibalut tepung renyah crispy ekstra crunchy.",
    image_path: null,
    is_active: 1,
    created_at: "2026-07-24 14:11:08"
  },
  {
    id: 3,
    name: "Sempol Bakar",
    category: "bakar",
    description: "Sempol ayam dibakar dengan saus BBQ spicy dan aneka topping.",
    image_path: null,
    is_active: 1,
    created_at: "2026-07-24 14:11:08"
  },
  {
    id: 4,
    name: "Twin Cup",
    category: "twin_cup",
    description: "Kombinasi 2 rasa varian sempol dalam 1 tempat twin cup.",
    image_path: null,
    is_active: 1,
    created_at: "2026-07-24 14:11:08"
  },
  {
    id: 5,
    name: "Sempol Jumbo",
    category: "jumbo",
    description: "Sempol ayam ukuran jumbo kenyang puas.",
    image_path: null,
    is_active: 1,
    created_at: "2026-07-24 14:11:08"
  }
]

export const initialMockVariants = [
  { id: 1, product_id: 1, sauce_name: "Saus Teriyaki", type: "original", price: "6000.00", qty_per_pack: 4, is_active: 1 },
  { id: 2, product_id: 1, sauce_name: "Saus Kacang", type: "original", price: "6000.00", qty_per_pack: 4, is_active: 1 },
  { id: 3, product_id: 1, sauce_name: "Saus Sadis", type: "original", price: "6000.00", qty_per_pack: 4, is_active: 1 },
  { id: 4, product_id: 1, sauce_name: "Saus Lada Hitam", type: "original", price: "6000.00", qty_per_pack: 4, is_active: 1 },
  { id: 5, product_id: 1, sauce_name: "Saus Barbeque Spicy", type: "original", price: "6000.00", qty_per_pack: 4, is_active: 1 },
  
  { id: 6, product_id: 2, sauce_name: "Saus Barbeque Spicy", type: "crispy", price: "7000.00", qty_per_pack: 5, is_active: 1 },
  { id: 7, product_id: 2, sauce_name: "Saus Teriyaki", type: "crispy", price: "7000.00", qty_per_pack: 5, is_active: 1 },
  { id: 8, product_id: 2, sauce_name: "Saus Kacang", type: "crispy", price: "7000.00", qty_per_pack: 5, is_active: 1 },
  { id: 9, product_id: 2, sauce_name: "Saus Sadis", type: "crispy", price: "7000.00", qty_per_pack: 5, is_active: 1 },
  { id: 10, product_id: 2, sauce_name: "Saus Lada Hitam", type: "crispy", price: "7000.00", qty_per_pack: 5, is_active: 1 },
  
  { id: 11, product_id: 3, sauce_name: "Saus BBQ Spicy + Mentai", type: "bakar", price: "12000.00", qty_per_pack: 1, is_active: 1 },
  { id: 12, product_id: 3, sauce_name: "Saus BBQ Spicy + Carbonara", type: "bakar", price: "12000.00", qty_per_pack: 1, is_active: 1 },
  { id: 13, product_id: 3, sauce_name: "Saus BBQ Spicy + Mayo", type: "bakar", price: "12000.00", qty_per_pack: 1, is_active: 1 },
  { id: 14, product_id: 3, sauce_name: "Saus BBQ Spicy + Garlic", type: "bakar", price: "12000.00", qty_per_pack: 1, is_active: 1 },
  
  { id: 15, product_id: 4, sauce_name: "Saus Teriyaki + Saus Kacang", type: "twin_cup", price: "20000.00", qty_per_pack: 1, is_active: 1 },
  { id: 16, product_id: 4, sauce_name: "Saus Lada Hitam + Saus Sadis", type: "twin_cup", price: "20000.00", qty_per_pack: 1, is_active: 1 },
  { id: 17, product_id: 4, sauce_name: "Saus BBQ Spicy + Saus Kacang", type: "twin_cup", price: "20000.00", qty_per_pack: 1, is_active: 1 },
  
  { id: 20, product_id: 5, sauce_name: "Saus Kacang", type: "jumbo", price: "10000.00", qty_per_pack: 1, is_active: 1 },
  { id: 21, product_id: 5, sauce_name: "Saus Sadis", type: "jumbo", price: "10000.00", qty_per_pack: 1, is_active: 1 },
  { id: 24, product_id: 5, sauce_name: "Saus BBQ Spicy", type: "jumbo", price: "10000.00", qty_per_pack: 1, is_active: 1 }
]

export const initialMockRawMaterials = [
  { id: 1, name: "Daging Ayam Fillet", unit: "kg", current_stock: "15.500", min_stock: "3.000", is_active: 1 },
  { id: 2, name: "Tepung Tapioka Premium", unit: "kg", current_stock: "25.000", min_stock: "5.000", is_active: 1 },
  { id: 3, name: "Miyak Goreng 2L", unit: "pouch", current_stock: "8.000", min_stock: "2.000", is_active: 1 },
  { id: 4, name: "Saus Sambal Sadis", unit: "botol", current_stock: "12.000", min_stock: "3.000", is_active: 1 }
]

export const initialMockTransactions = [
  {
    id: 1,
    trx_code: "TRX-20260812-0001",
    user_id: 3,
    customer_name: "Pelanggan Umum",
    total_amount: "24000.00",
    payment_method: "cash",
    paid_amount: "30000.00",
    change_amount: "6000.00",
    created_at: "2026-08-12 08:30:00",
    user: { id: 3, name: "Kasir Utama" },
    items: [
      { id: 1, transaction_id: 1, variant_id: 1, variant_name: "Sempol Original - Saus Teriyaki", price: "6000.00", qty: 2, subtotal: "12000.00" },
      { id: 2, transaction_id: 1, variant_id: 6, variant_name: "Sempol Crispy - Saus Barbeque Spicy", price: "7000.00", qty: 1, subtotal: "7000.00" }
    ]
  },
  {
    id: 2,
    trx_code: "TRX-20260812-0002",
    user_id: 3,
    customer_name: "Budi",
    total_amount: "32000.00",
    payment_method: "qris",
    paid_amount: "32000.00",
    change_amount: "0.00",
    created_at: "2026-08-12 09:15:00",
    user: { id: 3, name: "Kasir Utama" },
    items: [
      { id: 3, transaction_id: 2, variant_id: 11, variant_name: "Sempol Bakar - Saus BBQ Spicy + Mentai", price: "12000.00", qty: 1, subtotal: "12000.00" },
      { id: 4, transaction_id: 2, variant_id: 15, variant_name: "Twin Cup - Saus Teriyaki + Saus Kacang", price: "20000.00", qty: 1, subtotal: "20000.00" }
    ]
  }
]
