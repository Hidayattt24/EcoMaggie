import jsPDF from "jspdf";

interface InvoiceItem {
  name: string;
  variant?: string;
  quantity: number;
  unit?: string;
  price: number;
  subtotal: number;
}

interface InvoiceData {
  orderId: string;
  orderDate: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
  shippingCost: number;
  shippingMethod: string;
  discount?: number;
  total: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed";
  items?: InvoiceItem[];
  trackingNumber?: string;
  notes?: string;
}

export function generateInvoicePDF(data: InvoiceData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  let yPos = 0;

  // Professional Black & White Colors
  const black: [number, number, number] = [0, 0, 0];
  const darkGray: [number, number, number] = [51, 51, 51];
  const mediumGray: [number, number, number] = [102, 102, 102];
  const lightGray: [number, number, number] = [245, 245, 245];
  const borderGray: [number, number, number] = [200, 200, 200];

  // ========================================
  // HEADER / KOP SURAT
  // ========================================

  yPos = margin;

  // Company Name (Large, Bold)
  doc.setTextColor(black[0], black[1], black[2]);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("ECO-MAGGIE", margin, yPos);

  // Tagline
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
  doc.text("Solusi Pertanian Berkelanjutan", margin, yPos + 7);

  // Invoice Label (Right aligned)
  doc.setTextColor(black[0], black[1], black[2]);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", pageWidth - margin, yPos, { align: "right" });

  yPos += 15;

  // Header separator line
  doc.setDrawColor(black[0], black[1], black[2]);
  doc.setLineWidth(1);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  yPos += 8;

  // Company Contact Info (Below line)
  doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Jl. T. Batee Treun Gampong Ganoe Desa Lamdingin Kec. Kuta Alam, Banda Aceh",
    margin,
    yPos
  );
  doc.text(
    "Email: ecomaggie1@gmail.com  |  Telp: +62 821-7231-9892",
    margin,
    yPos + 5
  );

  yPos += 18;

  // ========================================
  // INVOICE INFO SECTION
  // ========================================

  // Invoice details box
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(pageWidth - margin - 70, yPos, 70, 28, "F");

  doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("No. Invoice:", pageWidth - margin - 65, yPos + 7);
  doc.text("Tanggal:", pageWidth - margin - 65, yPos + 14);
  doc.text("Status:", pageWidth - margin - 65, yPos + 21);

  doc.setTextColor(black[0], black[1], black[2]);
  doc.setFont("helvetica", "bold");
  doc.text(data.orderId, pageWidth - margin - 5, yPos + 7, { align: "right" });

  const formattedDate = new Date(data.orderDate).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  doc.text(formattedDate, pageWidth - margin - 5, yPos + 14, {
    align: "right",
  });

  const statusText =
    data.paymentStatus === "paid"
      ? "LUNAS"
      : data.paymentStatus === "pending"
      ? "BELUM BAYAR"
      : "GAGAL";
  doc.text(statusText, pageWidth - margin - 5, yPos + 21, { align: "right" });

  // Bill To section
  doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("TAGIHAN KEPADA:", margin, yPos + 5);

  doc.setTextColor(black[0], black[1], black[2]);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(data.customerName, margin, yPos + 13);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  const addressLines = doc.splitTextToSize(data.customerAddress, 95);
  let addrY = yPos + 20;
  addressLines.slice(0, 2).forEach((line: string) => {
    doc.text(line, margin, addrY);
    addrY += 5;
  });
  doc.text(`Telp: ${data.customerPhone}`, margin, addrY);

  yPos += 45;

  // ========================================
  // ITEMS TABLE
  // ========================================

  // Table Header
  doc.setFillColor(black[0], black[1], black[2]);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 10, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("NO", margin + 5, yPos + 7);
  doc.text("DESKRIPSI PRODUK", margin + 18, yPos + 7);
  doc.text("QTY", pageWidth - 95, yPos + 7);
  doc.text("HARGA", pageWidth - 70, yPos + 7);
  doc.text("JUMLAH", pageWidth - margin - 5, yPos + 7, { align: "right" });

  yPos += 10;

  // Table Rows
  const items = data.items || [
    {
      name: data.productName,
      quantity: data.quantity,
      unit: "kg",
      price: data.price,
      subtotal: data.subtotal,
    },
  ];

  items.forEach((item, index) => {
    // Alternating row colors
    if (index % 2 === 0) {
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.rect(margin, yPos, pageWidth - 2 * margin, 12, "F");
    }

    // Row border
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setLineWidth(0.3);
    doc.line(margin, yPos + 12, pageWidth - margin, yPos + 12);

    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`${index + 1}`, margin + 5, yPos + 8);

    // Product name with variant
    const productText = item.variant
      ? `${item.name} - ${item.variant}`
      : item.name;
    const truncated =
      productText.length > 40
        ? productText.substring(0, 40) + "..."
        : productText;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(black[0], black[1], black[2]);
    doc.text(truncated, margin + 18, yPos + 8);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text(`${item.quantity} ${item.unit || "kg"}`, pageWidth - 95, yPos + 8);
    doc.text(
      `Rp ${item.price.toLocaleString("id-ID")}`,
      pageWidth - 70,
      yPos + 8
    );

    doc.setFont("helvetica", "bold");
    doc.setTextColor(black[0], black[1], black[2]);
    doc.text(
      `Rp ${item.subtotal.toLocaleString("id-ID")}`,
      pageWidth - margin - 5,
      yPos + 8,
      { align: "right" }
    );

    yPos += 12;
  });

  yPos += 10;

  // ========================================
  // SUMMARY SECTION
  // ========================================

  const summaryX = pageWidth - margin - 80;

  // Subtotal
  doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Subtotal", summaryX, yPos);
  doc.setTextColor(black[0], black[1], black[2]);
  doc.text(
    `Rp ${data.subtotal.toLocaleString("id-ID")}`,
    pageWidth - margin,
    yPos,
    { align: "right" }
  );

  yPos += 7;

  // Shipping
  doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
  doc.text(`Ongkos Kirim (${data.shippingMethod})`, summaryX, yPos);
  doc.setTextColor(black[0], black[1], black[2]);
  const shippingDisplay =
    data.shippingCost === 0
      ? "GRATIS"
      : `Rp ${data.shippingCost.toLocaleString("id-ID")}`;
  doc.text(shippingDisplay, pageWidth - margin, yPos, { align: "right" });

  yPos += 7;

  // Discount (if any)
  if (data.discount && data.discount > 0) {
    doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
    doc.text("Diskon", summaryX, yPos);
    doc.setTextColor(black[0], black[1], black[2]);
    doc.text(
      `- Rp ${data.discount.toLocaleString("id-ID")}`,
      pageWidth - margin,
      yPos,
      { align: "right" }
    );
    yPos += 7;
  }

  // Separator line
  doc.setDrawColor(black[0], black[1], black[2]);
  doc.setLineWidth(0.5);
  doc.line(summaryX, yPos, pageWidth - margin, yPos);

  yPos += 8;

  // Total
  doc.setFillColor(black[0], black[1], black[2]);
  doc.rect(summaryX - 5, yPos - 5, pageWidth - margin - summaryX + 10, 14, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL", summaryX, yPos + 4);
  doc.setFontSize(12);
  doc.text(
    `Rp ${data.total.toLocaleString("id-ID")}`,
    pageWidth - margin - 5,
    yPos + 4,
    { align: "right" }
  );

  // ========================================
  // PAYMENT INFO SECTION (Left side)
  // ========================================

  const infoY = yPos - 30;

  doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("INFORMASI PEMBAYARAN", margin, infoY);

  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.3);
  doc.line(margin, infoY + 3, margin + 60, infoY + 3);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text(`Metode: ${data.paymentMethod}`, margin, infoY + 10);
  doc.text(`Pengiriman: ${data.shippingMethod}`, margin, infoY + 17);

  if (data.trackingNumber) {
    doc.text(`No. Resi: ${data.trackingNumber}`, margin, infoY + 24);
  }

  yPos += 25;

  // ========================================
  // NOTES SECTION (if any)
  // ========================================

  if (data.notes) {
    yPos += 10;
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setLineWidth(0.3);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 20, "S");

    doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("CATATAN:", margin + 5, yPos + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    const noteLines = doc.splitTextToSize(
      data.notes,
      pageWidth - 2 * margin - 15
    );
    doc.text(noteLines.slice(0, 2), margin + 5, yPos + 13);
  }

  // ========================================
  // FOOTER
  // ========================================

  // Footer separator
  doc.setDrawColor(black[0], black[1], black[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, pageHeight - 38, pageWidth - margin, pageHeight - 38);

  // Footer content - 3 columns
  const footerY = pageHeight - 32;
  const colWidth = (pageWidth - 2 * margin) / 3;

  // Column 1 - Thank you
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Terima Kasih", margin, footerY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("Atas kepercayaan Anda berbelanja", margin, footerY + 5);
  doc.text("di Eco-Maggie.", margin, footerY + 10);

  // Column 2 - Contact
  const col2X = margin + colWidth;
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Hubungi Kami", col2X, footerY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("Email: ecomaggie1@gmail.com", col2X, footerY + 5);
  doc.text("Telp: +62 821-7231-9892", col2X, footerY + 10);

  // Column 3 - Legal
  const col3X = margin + colWidth * 2;
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Catatan Legal", col3X, footerY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("Invoice ini sah tanpa tanda tangan.", col3X, footerY + 5);
  doc.text("Dokumen dibuat secara elektronik.", col3X, footerY + 10);

  // Bottom bar
  doc.setFillColor(black[0], black[1], black[2]);
  doc.rect(0, pageHeight - 8, pageWidth, 8, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(
    "www.ecomaggie.com  |  Jl. T. Batee Treun Gampong Ganoe, Lamdingin, Kuta Alam, Banda Aceh",
    pageWidth / 2,
    pageHeight - 3,
    { align: "center" }
  );

  // Save PDF
  doc.save(`Invoice-${data.orderId}.pdf`);
}
