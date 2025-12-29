import jsPDF from "jspdf";

interface InvoiceData {
  orderId: string;
  orderDate: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
  shippingCost: number;
  shippingMethod: string;
  total: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed";
}

export function generateInvoicePDF(data: InvoiceData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  let yPos = 20;

  // Brand Color
  const brandColor = "#2D5016";
  const brandColorRGB: [number, number, number] = [45, 80, 22]; // RGB values
  const lightGreenRGB: [number, number, number] = [240, 253, 244]; // Light green background

  // Helper function to add text with color
  const addText = (
    text: string,
    x: number,
    y: number,
    options?: {
      fontSize?: number;
      fontStyle?: "normal" | "bold";
      color?: [number, number, number];
      align?: "left" | "center" | "right";
    }
  ) => {
    if (options?.fontSize) doc.setFontSize(options.fontSize);
    if (options?.fontStyle) doc.setFont("helvetica", options.fontStyle);
    if (options?.color)
      doc.setTextColor(options.color[0], options.color[1], options.color[2]);

    if (options?.align === "right") {
      doc.text(text, x, y, { align: "right" });
    } else if (options?.align === "center") {
      doc.text(text, x, y, { align: "center" });
    } else {
      doc.text(text, x, y);
    }
  };

  // Header Section
  doc.setFillColor(brandColorRGB[0], brandColorRGB[1], brandColorRGB[2]);
  doc.rect(0, 0, pageWidth, 45, "F");

  // Company Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Eco-maggie", margin, 20);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Invoice Pesanan", margin, 28);

  // Order ID and Date (Right side)
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(data.orderId, pageWidth - margin, 20, { align: "right" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const formattedDate = new Date(data.orderDate).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(formattedDate, pageWidth - margin, 28, { align: "right" });

  yPos = 55;

  // Company Info Box
  doc.setFillColor(lightGreenRGB[0], lightGreenRGB[1], lightGreenRGB[2]);
  doc.roundedRect(margin, yPos, 80, 45, 3, 3, "F");
  doc.setDrawColor(brandColorRGB[0], brandColorRGB[1], brandColorRGB[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, yPos, 80, 45, 3, 3, "S");

  doc.setTextColor(brandColorRGB[0], brandColorRGB[1], brandColorRGB[2]);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("DARI", margin + 5, yPos + 7);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("PT Eco-maggie Indonesia", margin + 5, yPos + 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Jl. Teuku Umar No. 99", margin + 5, yPos + 20);
  doc.text("Banda Aceh, Aceh 23111", margin + 5, yPos + 26);
  doc.text("+62 812-3456-7890", margin + 5, yPos + 32);
  doc.text("info@ecomaggie.id", margin + 5, yPos + 38);

  // Customer Info Box
  doc.setFillColor(lightGreenRGB[0], lightGreenRGB[1], lightGreenRGB[2]);
  doc.roundedRect(pageWidth - margin - 80, yPos, 80, 45, 3, 3, "F");
  doc.setDrawColor(brandColorRGB[0], brandColorRGB[1], brandColorRGB[2]);
  doc.roundedRect(pageWidth - margin - 80, yPos, 80, 45, 3, 3, "S");

  doc.setTextColor(brandColorRGB[0], brandColorRGB[1], brandColorRGB[2]);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("KEPADA", pageWidth - margin - 75, yPos + 7);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(data.customerName, pageWidth - margin - 75, yPos + 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const addressLines = doc.splitTextToSize(data.customerAddress, 70);
  let addressY = yPos + 20;
  addressLines.forEach((line: string) => {
    doc.text(line, pageWidth - margin - 75, addressY);
    addressY += 5;
  });
  doc.text(data.customerPhone, pageWidth - margin - 75, addressY);

  yPos = 110;

  // Detail Pesanan Header
  doc.setTextColor(brandColorRGB[0], brandColorRGB[1], brandColorRGB[2]);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("DETAIL PESANAN", margin, yPos);

  yPos += 8;

  // Table Header
  doc.setFillColor(brandColorRGB[0], brandColorRGB[1], brandColorRGB[2]);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 10, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Produk", margin + 3, yPos + 6);
  doc.text("Jumlah", pageWidth - 110, yPos + 6);
  doc.text("Harga Satuan", pageWidth - 75, yPos + 6);
  doc.text("Total", pageWidth - margin - 3, yPos + 6, { align: "right" });

  yPos += 10;

  // Table Row
  doc.setFillColor(250, 250, 250);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 12, "F");
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 12, "S");

  doc.setTextColor(brandColorRGB[0], brandColorRGB[1], brandColorRGB[2]);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(data.productName, margin + 3, yPos + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`${data.quantity} kg`, pageWidth - 110, yPos + 9);
  doc.text(
    `Rp ${data.price.toLocaleString("id-ID")}`,
    pageWidth - 75,
    yPos + 9
  );
  doc.setFont("helvetica", "bold");
  doc.text(
    `Rp ${data.subtotal.toLocaleString("id-ID")}`,
    pageWidth - margin - 3,
    yPos + 9,
    { align: "right" }
  );

  yPos += 20;

  // Summary Box
  const summaryBoxWidth = 85;
  const summaryBoxX = pageWidth - margin - summaryBoxWidth;

  doc.setFillColor(lightGreenRGB[0], lightGreenRGB[1], lightGreenRGB[2]);
  doc.roundedRect(summaryBoxX, yPos, summaryBoxWidth, 32, 3, 3, "F");
  doc.setDrawColor(brandColorRGB[0], brandColorRGB[1], brandColorRGB[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(summaryBoxX, yPos, summaryBoxWidth, 32, 3, 3, "S");

  doc.setTextColor(brandColorRGB[0], brandColorRGB[1], brandColorRGB[2]);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Subtotal", summaryBoxX + 5, yPos + 8);
  doc.setFont("helvetica", "bold");
  doc.text(
    `Rp ${data.subtotal.toLocaleString("id-ID")}`,
    summaryBoxX + summaryBoxWidth - 5,
    yPos + 8,
    { align: "right" }
  );

  doc.setFont("helvetica", "normal");
  doc.text(`Ongkir (${data.shippingMethod})`, summaryBoxX + 5, yPos + 15);
  doc.setFont("helvetica", "bold");
  const shippingText =
    data.shippingCost === 0
      ? "GRATIS"
      : `Rp ${data.shippingCost.toLocaleString("id-ID")}`;
  doc.text(shippingText, summaryBoxX + summaryBoxWidth - 5, yPos + 15, {
    align: "right",
  });

  // Total line
  doc.setDrawColor(brandColorRGB[0], brandColorRGB[1], brandColorRGB[2]);
  doc.setLineWidth(0.5);
  doc.line(
    summaryBoxX + 5,
    yPos + 19,
    summaryBoxX + summaryBoxWidth - 5,
    yPos + 19
  );

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Total", summaryBoxX + 5, yPos + 26);
  doc.text(
    `Rp ${data.total.toLocaleString("id-ID")}`,
    summaryBoxX + summaryBoxWidth - 5,
    yPos + 26,
    { align: "right" }
  );

  yPos += 42;

  // Payment Info Section
  doc.setDrawColor(brandColorRGB[0], brandColorRGB[1], brandColorRGB[2]);
  doc.setLineWidth(0.3);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  yPos += 10;

  // Payment Method
  doc.setTextColor(brandColorRGB[0], brandColorRGB[1], brandColorRGB[2]);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("METODE PEMBAYARAN", margin, yPos);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(data.paymentMethod, margin, yPos + 7);

  // Payment Status
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("STATUS PEMBAYARAN", pageWidth / 2, yPos);

  // Status Badge
  let statusText = "";
  let statusBgColor: [number, number, number] = lightGreenRGB;
  let statusTextColor: [number, number, number] = brandColorRGB;

  if (data.paymentStatus === "paid") {
    statusText = "Lunas";
    statusBgColor = brandColorRGB;
    statusTextColor = [255, 255, 255];
  } else if (data.paymentStatus === "pending") {
    statusText = "Menunggu Pembayaran";
    statusBgColor = lightGreenRGB;
    statusTextColor = brandColorRGB;
  } else {
    statusText = "Gagal";
    statusBgColor = [254, 242, 242];
    statusTextColor = [185, 28, 28];
  }

  const statusWidth = doc.getTextWidth(statusText) + 8;
  doc.setFillColor(statusBgColor[0], statusBgColor[1], statusBgColor[2]);
  doc.roundedRect(pageWidth / 2, yPos + 2, statusWidth, 7, 2, 2, "F");
  doc.setDrawColor(brandColorRGB[0], brandColorRGB[1], brandColorRGB[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(pageWidth / 2, yPos + 2, statusWidth, 7, 2, 2, "S");

  doc.setTextColor(statusTextColor[0], statusTextColor[1], statusTextColor[2]);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(statusText, pageWidth / 2 + 4, yPos + 7);

  yPos += 20;

  // Footer Note
  doc.setDrawColor(brandColorRGB[0], brandColorRGB[1], brandColorRGB[2]);
  doc.setLineWidth(0.3);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  yPos += 8;

  doc.setTextColor(100, 100, 100);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  const footerText =
    "Terima kasih atas pesanan Anda. Invoice ini dibuat secara otomatis dan sah tanpa tanda tangan.";
  doc.text(footerText, pageWidth / 2, yPos, { align: "center" });

  // Save PDF
  doc.save(`Invoice-${data.orderId}.pdf`);
}
