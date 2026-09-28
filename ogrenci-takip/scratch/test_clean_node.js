import { cleanTurkishText } from '../js/modules/pdfParser.js';

console.log("Input: 'TDP HBS BİRLEŞİK'");
console.log("Output:", cleanTurkishText('TDP HBS BİRLEŞİK'));

console.log("Input: '11 Hız ve Renk MAARİF0 TYT'");
console.log("Output:", cleanTurkishText('11 Hız ve Renk MAARİF0 TYT'));
