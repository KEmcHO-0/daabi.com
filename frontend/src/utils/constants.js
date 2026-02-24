// Status translations
export const statusLabels = {
  draft: 'খসড়া',
  pending: 'অপেক্ষমান',
  under_review: 'পর্যালোচনাধীন',
  in_progress: 'চলমান',
  resolved: 'সমাধান হয়েছে',
  rejected: 'প্রত্যাখ্যান'
};

// Category translations
export const categoryLabels = {
  academic: 'একাডেমিক',
  accommodation: 'আবাসন',
  transport: 'পরিবহন',
  campus_facilities: 'ক্যাম্পাস সুবিধা',
  library: 'লাইব্রেরি',
  cafeteria: 'ক্যাফেটেরিয়া',
  medical: 'চিকিৎসা',
  sports: 'খেলাধুলা',
  security: 'নিরাপত্তা',
  administrative: 'প্রশাসনিক',
  other: 'অন্যান্য'
};

// Priority translations
export const priorityLabels = {
  low: 'কম',
  medium: 'মাঝারি',
  high: 'বেশি',
  urgent: 'জরুরি'
};

// Categories array for forms
export const categories = [
  { value: 'academic', label: 'একাডেমিক' },
  { value: 'accommodation', label: 'আবাসন' },
  { value: 'transport', label: 'পরিবহন' },
  { value: 'campus_facilities', label: 'ক্যাম্পাস সুবিধা' },
  { value: 'library', label: 'লাইব্রেরি' },
  { value: 'cafeteria', label: 'ক্যাফেটেরিয়া' },
  { value: 'medical', label: 'চিকিৎসা' },
  { value: 'sports', label: 'খেলাধুলা' },
  { value: 'security', label: 'নিরাপত্তা' },
  { value: 'administrative', label: 'প্রশাসনিক' },
  { value: 'other', label: 'অন্যান্য' }
];

// Priorities array for forms
export const priorities = [
  { value: 'low', label: 'কম' },
  { value: 'medium', label: 'মাঝারি' },
  { value: 'high', label: 'বেশি' },
  { value: 'urgent', label: 'জরুরি' }
];

// Statuses array for filters
export const statuses = [
  { value: 'pending', label: 'অপেক্ষমান' },
  { value: 'under_review', label: 'পর্যালোচনাধীন' },
  { value: 'in_progress', label: 'চলমান' },
  { value: 'resolved', label: 'সমাধান হয়েছে' },
  { value: 'rejected', label: 'প্রত্যাখ্যান' }
];

// Department list
export const departments = [
  'কম্পিউটার সায়েন্স ও ইঞ্জিনিয়ারিং',
  'সফটওয়্যার ইঞ্জিনিয়ারিং',
  'ইলেকট্রিক্যাল ও ইলেকট্রনিক্স ইঞ্জিনিয়ারিং',
  'ইলেকট্রনিক্স ও কমিউনিকেশন ইঞ্জিনিয়ারিং',
  'আর্কিটেকচার',
  'সিভিল ইঞ্জিনিয়ারিং',
  'কেমিক্যাল ইঞ্জিনিয়ারিং',
  'মেকানিক্যাল ইঞ্জিনিয়ারিং',
  'ইন্ডাস্ট্রিয়াল ও প্রোডাকশন ইঞ্জিনিয়ারিং',
  'পেট্রোলিয়াম ও মাইনিং ইঞ্জিনিয়ারিং',
  'ফুড ইঞ্জিনিয়ারিং ও টি টেকনোলজি',
  'পদার্থবিদ্যা',
  'রসায়ন',
  'গণিত',
  'পরিসংখ্যান',
  'জীববিদ্যা',
  'জেনেটিক ইঞ্জিনিয়ারিং ও বায়োটেকনোলজি',
  'বায়োকেমিস্ট্রি ও মলিকুলার বায়োলজি',
  'ফার্মাসি',
  'ভূগোল ও পরিবেশ',
  'ভূতত্ত্ব ও খনিবিদ্যা',
  'ওশানোগ্রাফি',
  'ফরেস্ট্রি ও এনভায়রনমেন্টাল সায়েন্স',
  'ইংরেজি',
  'বাংলা',
  'অর্থনীতি',
  'ব্যবসায় প্রশাসন',
  'সমাজবিজ্ঞান',
  'রাষ্ট্রবিজ্ঞান',
  'সমাজকর্ম',
  'জনপ্রশাসন',
  'নৃবিজ্ঞান'
];

// Format date
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Format date with time
export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Time ago
export const timeAgo = (date) => {
  if (!date) return '';
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  const intervals = [
    { label: 'বছর', seconds: 31536000 },
    { label: 'মাস', seconds: 2592000 },
    { label: 'সপ্তাহ', seconds: 604800 },
    { label: 'দিন', seconds: 86400 },
    { label: 'ঘণ্টা', seconds: 3600 },
    { label: 'মিনিট', seconds: 60 }
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label} আগে`;
    }
  }
  
  return 'এইমাত্র';
};
