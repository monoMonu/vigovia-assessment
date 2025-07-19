import jsPDF from 'jspdf';
import { format } from 'date-fns';

class PDFGenerator {
   constructor() {
      this.doc = null;
      this.pageHeight = 297; // A4 height in mm
      this.pageWidth = 210;  // A4 width in mm
      this.margin = 20;
      this.currentY = 0;
      this.colors = {
         primary: '#6B46C1',
         secondary: '#3B82F6',
         text: '#374151',
         lightGray: '#F3F4F6',
         white: '#FFFFFF'
      };
   }

   async generatePDF(data) {
      this.doc = new jsPDF();
      this.currentY = this.margin;

      // Generate each page
      await this.generateCoverPage(data);
      await this.generateDailyItinerary(data);
      this.addNewPage();
      await this.generateFlightAndHotelDetails(data);
      this.addNewPage();
      await this.generatePaymentAndTerms(data);

      // Save the PDF
      const fileName = `${data.customerName.replace(/\s+/g, '_')}_${data.destination}_Itinerary.pdf`;
      this.doc.save(fileName);
   }

   addNewPage() {
      this.doc.addPage();
      this.currentY = this.margin;
      this.addFooter();
   }

   addFooter() {
      const footerY = this.pageHeight - 15;

      // Left-aligned: Company info
      this.doc.setFontSize(8);
      this.doc.setTextColor('#6B46C1');
      this.doc.text('vigovia', this.margin, footerY, { align: 'left' });

      this.doc.setTextColor('#666666');
      this.doc.text('PLAN.PACK.GO', this.margin + 40, footerY, { align: 'left' });

      // Right-aligned: Contact info
      const rightMargin = this.pageWidth - this.margin;
      this.doc.text(
         'Vigovia Tech Pvt. Ltd | Phone: +91-99X9999999 | Email: Contact@Vigovia.Com',
         rightMargin,
         footerY,
         { align: 'right' }
      );
   }


   async generateCoverPage(data) {
      // Header with gradient effect (simulated)
      this.doc.setFillColor(107, 70, 193); // vigovia purple
      this.doc.rect(0, 0, this.pageWidth, 60, 'F');

      // Logo and company name
      this.doc.setTextColor(255, 255, 255);
      this.doc.setFontSize(32);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('vigovia', this.pageWidth / 2, 25, { align: 'center' });

      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text('PLAN.PACK.GO ', this.pageWidth / 2, 35, { align: 'center' });

      // Greeting and main title
      this.doc.setTextColor(255, 255, 255);
      this.doc.setFontSize(18);
      this.doc.text(`Hi, ${data.customerName}!`, this.pageWidth / 2, 48, { align: 'center' });

      // Destination and duration
      this.currentY = 80;
      this.doc.setTextColor(107, 70, 193);
      this.doc.setFontSize(24);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${data.destination} Itinerary`, this.pageWidth / 2, this.currentY, { align: 'center' });

      this.currentY += 15;
      const nights = this.calculateNights(data.departureDate, data.returnDate);
      this.doc.setFontSize(14);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`${nights + 1} Days ${nights} Nights`, this.pageWidth / 2, this.currentY, { align: 'center' });

      // Trip details box
      this.currentY += 10;
      this.doc.setFillColor(248, 250, 252);
      this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 40, 'F');

      // Trip details content
      this.doc.setTextColor(55, 65, 81);
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');

      const detailsY = this.currentY + 10;
      this.doc.text('Departure From:', this.margin + 5, detailsY);
      this.doc.text('Departure:', this.margin + 5, detailsY + 7);
      this.doc.text('Arrival:', this.margin + 5, detailsY + 14);
      this.doc.text('Destination:', this.margin + 5, detailsY + 21);
      this.doc.text('No. Of Travellers:', this.margin + 5, detailsY + 28);

      this.doc.setFont('helvetica', 'normal');
      this.doc.text(data.departureFrom, this.margin + 40, detailsY);
      this.doc.text(this.formatDate(data.departureDate), this.margin + 40, detailsY + 7);
      this.doc.text(this.formatDate(data.returnDate), this.margin + 40, detailsY + 14);
      this.doc.text(data.destination, this.margin + 40, detailsY + 21);
      this.doc.text(data.travelers.toString(), this.margin + 40, detailsY + 28);

      this.currentY += 60;

      this.addFooter();
   }

   async generateDailyItinerary(data) {
      this.doc.setTextColor(107, 70, 193);
      this.doc.setFontSize(20);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Daily Itinerary', this.margin, this.currentY);

      this.currentY += 20;

      data.days.forEach((day, index) => {
         if (this.currentY > this.pageHeight - 80) {
            this.addNewPage();
         }

         // Day header with circle design
         this.doc.setFillColor(107, 70, 193);
         this.doc.circle(this.margin + 8, this.currentY + 5, 8, 'F');

         this.doc.setTextColor(255, 255, 255);
         this.doc.setFontSize(12);
         this.doc.setFont('helvetica', 'bold');
         this.doc.text(`${index + 1}`, this.margin + 8, this.currentY + 7, { align: 'center' });

         // Day content
         this.doc.setTextColor(55, 65, 81);
         this.doc.setFontSize(14);
         this.doc.setFont('helvetica', 'bold');
         this.doc.text(`Day ${index + 1}`, this.margin + 25, this.currentY + 5);

         this.doc.setFontSize(10);
         this.doc.setFont('helvetica', 'normal');
         if (day.date) {
            this.doc.text(this.formatDate(day.date), this.margin + 25, this.currentY + 12);
         }

         this.currentY += 20;

         // Activities
         if (day.activities && day.activities.length > 0) {
            day.activities.forEach(activity => {
               if (this.currentY > this.pageHeight - 60) {
                  this.addNewPage();
               }

               // Timeline connector
               this.doc.setDrawColor(200, 200, 200);
               this.doc.line(this.margin + 8, this.currentY - 5, this.margin + 8, this.currentY + 10);

               // Activity time circle
               this.doc.setFillColor(59, 130, 246);
               this.doc.circle(this.margin + 8, this.currentY + 2, 3, 'F');

               // Activity time
               this.doc.setTextColor(55, 65, 81);
               this.doc.setFontSize(10);
               this.doc.setFont('helvetica', 'bold');
               this.doc.text(activity.time || 'Morning', this.margin + 20, this.currentY);

               // Title
               let offsetY = 7;
               if (activity.title) {
                  this.doc.setFont('helvetica', 'normal');
                  this.doc.text(`• ${activity.title}`, this.margin + 20, this.currentY + offsetY);
                  offsetY += 6;
               }

               // Description
               if (activity.description) {
                  const descriptionLines = this.doc.splitTextToSize(activity.description, this.pageWidth - 50);
                  this.doc.text(descriptionLines, this.margin + 22, this.currentY + offsetY);
                  offsetY += descriptionLines.length * 4 + 2;
               }

               // Duration
               if (activity.duration) {
                  this.doc.setFontSize(10);
                  this.doc.setTextColor(120, 120, 120);
                  this.doc.text(`Duration: ${activity.duration}`, this.margin + 22, this.currentY + offsetY);
                  offsetY += 10;
               }

               // Update currentY after rendering everything for the activity
               this.currentY += offsetY + 6;
            });

         }

         this.currentY += 10;
      });

      this.addFooter();
   }

   async generateFlightAndHotelDetails(data) {
      // Flight Summary
      this.doc.setTextColor(107, 70, 193);
      this.doc.setFontSize(20);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Flight Summary', this.margin, this.currentY);

      this.currentY += 20;

      if (data.flights && data.flights.length > 0) {
         data.flights.forEach((flight, index) => {
            if (this.currentY > this.pageHeight - 60) {
               this.addNewPage();
            }

            // Flight box
            this.doc.setFillColor(248, 250, 252);
            this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 25, 'F');

            this.doc.setTextColor(107, 70, 193);
            this.doc.setFontSize(10);
            this.doc.setFont('helvetica', 'bold');
            this.doc.text(this.formatDate(flight.date), this.margin + 5, this.currentY + 8);

            this.doc.setTextColor(55, 65, 81);
            this.doc.setFont('helvetica', 'normal');
            this.doc.text(`Fly ${flight.airline} From ${flight.from} To ${flight.to}`,
               this.margin + 5, this.currentY + 16);

            if (flight.departure && flight.arrival) {
               this.doc.text(`Departure: ${flight.departure} | Arrival: ${flight.arrival}`,
                  this.margin + 5, this.currentY + 22);
            }

            this.currentY += 35;
         });
      }

      this.currentY += 15;

      // Hotel Bookings
      this.doc.setTextColor(107, 70, 193);
      this.doc.setFontSize(20);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Hotel Bookings', this.margin, this.currentY);

      this.currentY += 20;

      if (data.hotels && data.hotels.length > 0) {
         // Table header
         this.doc.setFillColor(107, 70, 193);
         this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 12, 'F');

         this.doc.setTextColor(255, 255, 255);
         this.doc.setFontSize(8);
         this.doc.setFont('helvetica', 'bold');

         const colWidth = (this.pageWidth - 2 * this.margin) / 5;
         this.doc.text('City', this.margin + 2, this.currentY + 8);
         this.doc.text('Check In', this.margin + colWidth + 2, this.currentY + 8);
         this.doc.text('Check Out', this.margin + 2 * colWidth + 2, this.currentY + 8);
         this.doc.text('Nights', this.margin + 3 * colWidth + 2, this.currentY + 8);
         this.doc.text('Hotel Name', this.margin + 4 * colWidth + 2, this.currentY + 8);

         this.currentY += 12;

         data.hotels.forEach((hotel, index) => {
            if (this.currentY > this.pageHeight - 40) {
               this.addNewPage();
            }

            // Alternating row colors
            if (index % 2 === 0) {
               this.doc.setFillColor(248, 250, 252);
               this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 12, 'F');
            }

            this.doc.setTextColor(55, 65, 81);
            this.doc.setFontSize(8);
            this.doc.setFont('helvetica', 'normal');

            this.doc.text(hotel.city || '', this.margin + 2, this.currentY + 8);
            this.doc.text(this.formatDate(hotel.checkIn), this.margin + colWidth + 2, this.currentY + 8);
            this.doc.text(this.formatDate(hotel.checkOut), this.margin + 2 * colWidth + 2, this.currentY + 8);
            this.doc.text(hotel.nights?.toString() || '', this.margin + 3 * colWidth + 2, this.currentY + 8);
            this.doc.text(hotel.name || '', this.margin + 4 * colWidth + 2, this.currentY + 8);

            this.currentY += 12;
         });
      }

      this.addFooter();
   }

   async generatePaymentAndTerms(data) {
      // Payment Plan
      this.doc.setTextColor(107, 70, 193);
      this.doc.setFontSize(20);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Payment Plan', this.margin, this.currentY);

      this.currentY += 20;

      // Total amount box
      this.doc.setFillColor(248, 250, 252);
      this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 15, 'F');

      this.doc.setTextColor(55, 65, 81);
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Total Amount', this.margin + 5, this.currentY + 8);
      this.doc.text(`Rs ${data.totalAmount.toLocaleString()} For ${data.travelers} Pax (Inclusive Of GST)`,
         this.margin + 50, this.currentY + 8);

      this.currentY += 25;

      // Installments table
      this.doc.setFillColor(107, 70, 193);
      this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 12, 'F');

      this.doc.setTextColor(255, 255, 255);
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');

      const colWidth = (this.pageWidth - 2 * this.margin) / 3;
      this.doc.text('Installment', this.margin + 5, this.currentY + 8);
      this.doc.text('Amount', this.margin + colWidth + 5, this.currentY + 8);
      this.doc.text('Due Date', this.margin + 2 * colWidth + 5, this.currentY + 8);

      this.currentY += 12;

      // Installment rows
      const installments = [
         { name: 'Installment 1', amount: data.installment1, due: 'Initial Payment' },
         { name: 'Installment 2', amount: data.installment2, due: 'Post Visa Approval' },
         {
            name: 'Installment 3',
            amount: data.totalAmount - (data.installment1 || 0) - (data.installment2 || 0),
            due: '20 Days Before Departure'
         }
      ];

      installments.forEach((installment, index) => {
         if (index % 2 === 0) {
            this.doc.setFillColor(248, 250, 252);
            this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 12, 'F');
         }

         this.doc.setTextColor(55, 65, 81);
         this.doc.setFontSize(9);
         this.doc.setFont('helvetica', 'normal');

         this.doc.text(installment.name, this.margin + 5, this.currentY + 8);
         this.doc.text(installment.amount > 0 ? `Rs${installment.amount.toLocaleString()}` : 'Remaining',
            this.margin + colWidth + 5, this.currentY + 8);
         this.doc.text(installment.due, this.margin + 2 * colWidth + 5, this.currentY + 8);

         this.currentY += 12;
      });

      this.currentY += 20;

      // Visa Details
      this.doc.setTextColor(107, 70, 193);
      this.doc.setFontSize(16);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Visa Details', this.margin, this.currentY);

      this.currentY += 15;

      this.doc.setFillColor(248, 250, 252);
      this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 20, 'F');

      this.doc.setTextColor(55, 65, 81);
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');

      this.doc.text('Visa Type: Tourist', this.margin + 5, this.currentY + 8);
      this.doc.text('Validity: 30 Days', this.margin + 60, this.currentY + 8);
      this.doc.text('Processing Date: 14/06/2025', this.margin + 120, this.currentY + 8);

      this.currentY += 30;

      // Call to action
      this.doc.setFillColor(107, 70, 193);
      this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 30, 'F');

      this.doc.setTextColor(255, 255, 255);
      this.doc.setFontSize(24);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('PLAN.PACK.GO!', this.pageWidth / 2, this.currentY + 20, { align: 'center' });

      this.addFooter();
   }

   calculateNights(departureDate, returnDate) {
      if (!departureDate || !returnDate) return 0;
      const departure = new Date(departureDate);
      const returnD = new Date(returnDate);
      const diffTime = Math.abs(returnD - departure);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
   }

   formatDate(dateString) {
      if (!dateString) return '';
      try {
         return format(new Date(dateString), 'dd/MM/yyyy');
      } catch (error) {
         return dateString;
      }
   }
}

export default PDFGenerator;