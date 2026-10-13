/**
 * WhatsApp Helper Utilities for Yosola Schools
 * Generates direct wa.me links with professional pre-filled Nigerian school messages.
 */

export function cleanPhoneForWhatsApp(phone?: string | null): string {
  if (!phone) return '';
  // Remove spaces, dashes, parentheses
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // If starts with +, strip it
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  
  // If Nigerian format starting with 0 (e.g. 080..., 070..., 090..., 081...)
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = '234' + cleaned.substring(1);
  }
  
  return cleaned;
}

export function buildWhatsAppLink(phone: string | null | undefined, message: string): string {
  const cleanPhone = cleanPhoneForWhatsApp(phone);
  if (!cleanPhone) {
    // If no phone provided, still return wa.me link with pre-filled text so user can select recipient
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  }
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function buildFeeReminderMessage(data: {
  parentName?: string | null;
  studentName: string;
  className?: string | null;
  amountDue: number;
  invoiceNumber?: string | null;
  term?: string | null;
  schoolName?: string | null;
  bankName?: string | null;
  accountNumber?: string | null;
  accountName?: string | null;
}): string {
  const school = data.schoolName || 'Yosola Schools';
  const parent = data.parentName ? `Mr/Mrs ${data.parentName}` : 'Parent/Guardian';
  const formattedAmount = `₦${data.amountDue.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
  
  let msg = `Good day ${parent},\n\nThis is a gentle reminder from ${school} regarding ${data.studentName}`;
  if (data.className) msg += ` (${data.className})`;
  msg += `.\n\nOutstanding School Fee Balance: ${formattedAmount}`;
  if (data.invoiceNumber) msg += `\nInvoice Ref: #${data.invoiceNumber}`;
  if (data.term) msg += `\nTerm: ${data.term}`;
  
  if (data.bankName && data.accountNumber) {
    msg += `\n\nPayment Details:\n• Bank: ${data.bankName}\n• Account No: ${data.accountNumber}`;
    if (data.accountName) msg += `\n• Account Name: ${data.accountName}`;
  }
  
  msg += `\n\nKindly notify us once payment is completed. Thank you for your continued partnership with ${school}.`;
  return msg;
}

export function buildAbsenceAlertMessage(data: {
  parentName?: string | null;
  studentName: string;
  date: string;
  className?: string | null;
  schoolName?: string | null;
}): string {
  const school = data.schoolName || 'Yosola Schools';
  const parent = data.parentName ? `Mr/Mrs ${data.parentName}` : 'Parent/Guardian';
  
  let msg = `Good morning ${parent},\n\nThis is to notify you from ${school} that ${data.studentName}`;
  if (data.className) msg += ` (${data.className})`;
  msg += ` was marked ABSENT during morning roll call today, ${data.date}.\n\nKindly confirm if your child is unwell or at home today. Please reply to this message or contact the school office. Thank you.`;
  return msg;
}

export function buildReportCardNoticeMessage(data: {
  parentName?: string | null;
  studentName: string;
  term?: string | null;
  academicYear?: string | null;
  schoolName?: string | null;
}): string {
  const school = data.schoolName || 'Yosola Schools';
  const parent = data.parentName ? `Mr/Mrs ${data.parentName}` : 'Parent/Guardian';
  
  let msg = `Dear ${parent},\n\nWe are pleased to inform you that terminal examination results for ${data.studentName}`;
  if (data.term) msg += ` (${data.term}`;
  if (data.academicYear) msg += `, ${data.academicYear}`;
  if (data.term) msg += `)`;
  msg += ` have been published.\n\nYou can view and download the official report card directly on the ${school} parent portal. Thank you for partnering with us in your child's education!`;
  return msg;
}

export function buildGeneralMessage(data: {
  parentName?: string | null;
  studentName: string;
  message: string;
  schoolName?: string | null;
}): string {
  const school = data.schoolName || 'Yosola Schools';
  const parent = data.parentName ? `Mr/Mrs ${data.parentName}` : 'Parent/Guardian';
  return `Good day ${parent},\n\nMessage from ${school} regarding ${data.studentName}:\n${data.message}\n\nThank you.`;
}

