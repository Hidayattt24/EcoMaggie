/**
 * Excel Export Utilities
 * ===========================================
 * Utility functions for exporting data to Excel format
 */

import * as XLSX from "xlsx";

// ============================================
// ORDERS EXPORT
// ============================================

export interface OrderExportData {
  orderId: string;
  customerName: string;
  customerPhone: string;
  totalItems: number;
  totalPrice: number;
  netEarnings: number;
  shippingType: string;
  status: string;
  date: string;
  city: string;
  province: string;
}

export function exportOrdersToExcel(orders: OrderExportData[], filename: string = "orders-export") {
  // Prepare data for Excel
  const excelData = orders.map((order, index) => ({
    "No": index + 1,
    "Order ID": order.orderId,
    "Nama Customer": order.customerName,
    "No. Telepon": order.customerPhone,
    "Total Item": order.totalItems,
    "Total Harga": order.totalPrice,
    "Pendapatan Bersih": order.netEarnings,
    "Jenis Pengiriman": order.shippingType,
    "Status": order.status,
    "Tanggal": order.date,
    "Kota": order.city,
    "Provinsi": order.province,
  }));

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(excelData);

  // Set column widths
  ws["!cols"] = [
    { wch: 5 },  // No
    { wch: 15 }, // Order ID
    { wch: 20 }, // Nama Customer
    { wch: 15 }, // No. Telepon
    { wch: 10 }, // Total Item
    { wch: 15 }, // Total Harga
    { wch: 18 }, // Pendapatan Bersih
    { wch: 20 }, // Jenis Pengiriman
    { wch: 15 }, // Status
    { wch: 15 }, // Tanggal
    { wch: 15 }, // Kota
    { wch: 15 }, // Provinsi
  ];

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Orders");

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split("T")[0];
  const fullFilename = `${filename}_${timestamp}.xlsx`;

  // Download file
  XLSX.writeFile(wb, fullFilename);
}

// ============================================
// PRODUCTS EXPORT
// ============================================

export interface ProductExportData {
  name: string;
  category: string;
  price: number;
  discount: number;
  finalPrice: number;
  stock: number;
  unit: string;
  status: string;
  totalSold: number;
  totalReviews: number;
  averageRating: number;
}

export function exportProductsToExcel(products: ProductExportData[], filename: string = "products-export") {
  // Prepare data for Excel
  const excelData = products.map((product, index) => ({
    "No": index + 1,
    "Nama Produk": product.name,
    "Kategori": product.category,
    "Harga Asli": product.price,
    "Diskon (%)": product.discount,
    "Harga Jual": product.finalPrice,
    "Stok": product.stock,
    "Satuan": product.unit,
    "Status": product.status,
    "Total Terjual": product.totalSold,
    "Total Review": product.totalReviews,
    "Rating Rata-rata": product.averageRating,
  }));

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(excelData);

  // Set column widths
  ws["!cols"] = [
    { wch: 5 },  // No
    { wch: 30 }, // Nama Produk
    { wch: 15 }, // Kategori
    { wch: 12 }, // Harga Asli
    { wch: 12 }, // Diskon
    { wch: 12 }, // Harga Jual
    { wch: 8 },  // Stok
    { wch: 10 }, // Satuan
    { wch: 12 }, // Status
    { wch: 12 }, // Total Terjual
    { wch: 12 }, // Total Review
    { wch: 15 }, // Rating
  ];

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Products");

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split("T")[0];
  const fullFilename = `${filename}_${timestamp}.xlsx`;

  // Download file
  XLSX.writeFile(wb, fullFilename);
}

// ============================================
// SUPPLY MONITORING EXPORT
// ============================================

export interface SupplyExportData {
  supplyId: string;
  supplierName: string;
  supplierPhone: string;
  wasteType: string;
  estimatedWeight: string;
  address: string;
  pickupDate: string;
  pickupTime: string;
  status: string;
  submittedAt: string;
  notes?: string;
}

export function exportSupplyToExcel(supplies: SupplyExportData[], filename: string = "supply-monitoring-export") {
  // Prepare data for Excel
  const excelData = supplies.map((supply, index) => ({
    "No": index + 1,
    "Supply ID": supply.supplyId,
    "Nama Supplier": supply.supplierName,
    "No. Telepon": supply.supplierPhone,
    "Jenis Sampah": supply.wasteType,
    "Estimasi Berat": supply.estimatedWeight,
    "Alamat": supply.address,
    "Tanggal Pickup": supply.pickupDate,
    "Waktu Pickup": supply.pickupTime,
    "Status": supply.status,
    "Tanggal Submit": supply.submittedAt,
    "Catatan": supply.notes || "-",
  }));

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(excelData);

  // Set column widths
  ws["!cols"] = [
    { wch: 5 },  // No
    { wch: 15 }, // Supply ID
    { wch: 20 }, // Nama Supplier
    { wch: 15 }, // No. Telepon
    { wch: 20 }, // Jenis Sampah
    { wch: 15 }, // Estimasi Berat
    { wch: 40 }, // Alamat
    { wch: 15 }, // Tanggal Pickup
    { wch: 15 }, // Waktu Pickup
    { wch: 15 }, // Status
    { wch: 18 }, // Tanggal Submit
    { wch: 30 }, // Catatan
  ];

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Supply Monitoring");

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split("T")[0];
  const fullFilename = `${filename}_${timestamp}.xlsx`;

  // Download file
  XLSX.writeFile(wb, fullFilename);
}
