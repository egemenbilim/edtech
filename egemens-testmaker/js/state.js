export const LETTERS = ['A', 'B', 'C', 'D', 'E'];
export const MAX = 100;

export const S = {
  testType: 'yazili',
  groups: 1,
  columns: 2,
  pageSize: 'a4',
  orientation: 'portrait',
  margin: 5,
  spacing: false,
  spacingValue: 10,
  smartLayout: false,
  watermark: '',
  watermarkAngle: 45,
  watermarkSize: 44,
  watermarkDivider: false,
  themeColor: '#1d4ed8',
  optic: false,
  showAnswerKey: true,
  konuKapsami: '',
  denemeNo: '',
  template: 'none',
  mebYear: '2026 - 2027 Eğitim - Öğretim Yılı',
  mebSchool: '',
  mebDate: '',
  mebLesson: '',
  mebGrade: '',
  mebExam: '',
  mebNameLbl: 'Adı-Soyadı:',
  mebClassLbl: 'Sınıfı:',
  mebNoLbl: 'Okul No.:',
  mebScoreLbl: 'Puan:',
  mebLogo: true,
  logoChoice: 'meb',
  logoW: 22,
  logoH: 22,
  logoX: null,
  logoY: null,
  mebPos: null,
  title: '',
  school: '',
  lesson: '2025-2026 EĞİTİM ÖĞRETİM YILI',
  description: 'Aşağıdaki soruları dikkatlice okuyunuz. Her soru 10 Puan olmakla birlikte sınav süreniz 40 dakikadır.',
  // Yeni özellik durumları
  customTemplateId: null,
  showQuestionAreaGuide: false,
  activeBankId: null
};

export const PRESET_COLORS = [
  { name: 'MEB Bordo', hex: '#b91c1c' },
  { name: 'Resmî Lacivert', hex: '#1e3a8a' },
  { name: 'Zümrüt Yeşili', hex: '#0f766e' },
  { name: 'Canlandırıcı Turuncu', hex: '#ea580c' },
  { name: 'Kurşunî Antrasit', hex: '#334155' }
];

export const questions = [];

export function setQuestions(newArr) {
  questions.length = 0;
  if (Array.isArray(newArr)) {
    questions.push(...newArr);
  }
}

export function clearQuestions() {
  questions.length = 0;
}
