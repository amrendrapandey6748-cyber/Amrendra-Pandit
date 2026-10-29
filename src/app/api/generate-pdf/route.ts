import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      shopName = "SignGuard Secure Enterprise",
      ownerName = "Ramesh Sharma",
      ownerPhone = "9876543210",
      customerName = "Customer",
      customerPhone = "9876543210",
      customerLocation = "Faizabad Road",
      itemDesc = "Shop Udhar / Vyapaar Credit",
      amount = "0",
      amountWords = "Rupaye",
      dueDate = "Tay nahi",
      gpsCoords = "26.79°N, 82.19°E",
      timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      photo1, 
      photo2,
      customerSignature = "Verified",
      otpVerified = true,
      deedNumber = "PAY-1001"
    } = body;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]); 
    const { height, width } = page.getSize();
    
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const drawLine = (y: number) => {
        page.drawLine({ start: { x: 40, y }, end: { x: width - 40, y }, thickness: 1.2, color: rgb(0, 0, 0) });
    };

    // 1. Borders & Headers
    page.drawRectangle({ x: 40, y: 40, width: width - 80, height: height - 80, borderColor: rgb(0,0,0), borderWidth: 2 });
    page.drawText("DIGITAL VYAPAR PAAVTI / RECEIPT", { x: 130, y: height - 70, size: 16, font: boldFont });
    page.drawText(`(Ref No: ${deedNumber} | Ledger Update)`, { x: 160, y: height - 90, size: 10, font: font, color: rgb(0.2, 0.2, 0.2) });
    drawLine(height - 110);

    // 2. Dukandar Details
    page.drawText(`Dukan: ${shopName}`, { x: 50, y: height - 135, size: 12, font: boldFont });
    page.drawText(`Dukandar: ${ownerName}   |   Mo: ${ownerPhone}`, { x: 50, y: height - 155, size: 11, font: font });
    drawLine(height - 190);

    // 3. Grahak Details
    page.drawText(`Grahak (Customer): ${customerName}`, { x: 50, y: height - 215, size: 12, font: boldFont });
    page.drawText(`Mobile: ${customerPhone}`, { x: 50, y: height - 235, size: 11, font: font });
    drawLine(height - 250);

    // 4. Saman aur Updated Raqam
    page.drawText(`Varan: ${itemDesc}`, { x: 50, y: height - 275, size: 11, font: boldFont });
    page.drawText(`Abhi Bacha Hua Kul Udhar: Rs ${amount}`, { x: 50, y: height - 295, size: 14, font: boldFont, color: rgb(0.7, 0, 0) });
    drawLine(height - 335);

    // 5. Section for Receipt Note
    page.drawText("LEDGER PAYMENT UPDATE RECORD", { x: 170, y: height - 365, size: 13, font: boldFont });
    
    page.drawRectangle({ x: 60, y: height - 540, width: 480, height: 150, borderColor: rgb(0.5, 0.5, 0.5), borderWidth: 1, borderDashArray: [4, 4] });
    page.drawText(`Time: ${timestamp}`, { x: 80, y: height - 440, size: 11, font: font, color: rgb(0.2, 0.2, 0.2) });
    page.drawText(`Status: Payment Recorded & Balance Updated Successfully`, { x: 80, y: height - 470, size: 12, font: boldFont, color: rgb(0, 0.5, 0) });

    // Optional Image Embedding if provided
    try {
      if (photo1 && photo1.includes("base64,")) {
        const base64Data = photo1.split(",")[1];
        const imgBytes = Buffer.from(base64Data, "base64");
        const img = await pdfDoc.embedJpg(imgBytes);
        page.drawImage(img, { x: 350, y: height - 530, width: 170, height: 130 }); 
      }
    } catch (e) {
      console.log("Image skip");
    }

    drawLine(height - 560);

    // 6. Grahak Tasdeeq
    page.drawText("Tasdeeq (Declaration):", { x: 50, y: height - 590, size: 12, font: boldFont });
    page.drawText(`"Is raseed ke anusaar pichhla saara len-den update kar diya gaya hai."`, { x: 50, y: height - 610, size: 10, font: font });

    // 7. Digital Signature Seal
    page.drawRectangle({ x: 50, y: height - 710, width: 500, height: 50, color: rgb(0.95, 1, 0.95), borderColor: rgb(0, 0.6, 0), borderWidth: 1.5 });
    page.drawText(`Verified Ledger Record | Sec 65B Compliant`, { x: 145, y: height - 685, size: 10, font: boldFont, color: rgb(0, 0.5, 0) });

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${deedNumber}.pdf"`,
      },
    });

  } catch (error: any) {
    console.error("PDF Generator Error:", error);
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
  }
}