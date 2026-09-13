/* ══════════════════════════════════════════════════════
   Eğitim Promptları Deposu — Şablonlar ve Sabitler
   ══════════════════════════════════════════════════════ */

export const TURKISH_RULE = "\n\n────────────────────────────────────────\nCRITICAL LANGUAGE RULE: The entire final output MUST be delivered in Turkish.\n(ÖNEMLİ DİL KURALI: Çıktının tamamını Türkçe olarak ver.)";

export const SINIF_REQUIRED = ['gagne', 'nlm', 'kavram_yanilgisi'];
export const LOW_GRADES = ["5. Sınıf", "6. Sınıf", "7. Sınıf"];

export function isLowGrade(s) {
  return LOW_GRADES.includes(s);
}

export function getConcreteInstruction(s) {
  if (!isLowGrade(s)) return "";
  return `PEDAGOGICAL LEVEL ADAPTATION (CRITICAL): Since the target audience is ${s} (7th grade and below), you MUST deliver the explanation using concrete elements, tangible real-life examples, and simple analogies that are appropriate for this grade's cognitive and pedagogical level. Avoid abstract definitions without concrete grounding.`;
}

export const PANELS = [
  'nlm-options', 'maarif-options', 'program-options',
  'veli-options', 'gagne-options', 'video-options'
];

export const HIDE_DERS = ['calisma_programi', 'veli_bulteni'];
export const HIDE_KONU = ['maarif', 'calisma_programi', 'veli_bulteni'];

export const dersOptions = `
  <option value="">Bir ders seçiniz...</option>
  <option value="Türkçe">Türkçe</option>
  <option value="Türk Dili ve Edebiyatı">Türk Dili ve Edebiyatı</option>
  <option value="Tarih">Tarih</option>
  <option value="Coğrafya">Coğrafya</option>
  <option value="Felsefe">Felsefe</option>
  <option value="Din Kültürü ve Ahlak Bilgisi">Din Kültürü ve Ahlak Bilgisi</option>
  <option value="Matematik">Matematik</option>
  <option value="Fizik">Fizik</option>
  <option value="Kimya">Kimya</option>
  <option value="Biyoloji">Biyoloji</option>
  <option value="Fen Bilgisi">Fen Bilgisi</option>
  <option value="İngilizce">İngilizce</option>
  <option value="Deneme Sınavı">Deneme Sınavı</option>
`;

export const promptTemplates = {
  "not": `You are a "{ders}" teacher. Your task is to scan the resources related to the topic and subheadings provided in the input "{konu}" line by line. Without any information loss and without token-saving constraints, create the longest and most highly detailed study note aimed at the student. Pay special attention to highlighting parts that are emphasized as likely to appear in exams.

Use an aesthetic writing style and a clean paper template, avoiding unnecessary visuals. Keep it simple, plain, and straightforward. Use a maximum of 4 colors and use highlights to emphasize important sections.

At the end of the study sheet, provide 5 simple open-ended questions for the student's self-assessment. These questions should not include the answers and must help the student test whether they have analytically grasped the topic.`,

  "bosluk": `You are an expert "{ders}" teacher. Your task is to thoroughly scan the uploaded/provided resources related to "{konu}" line by line. Without any information loss and without token-saving constraints, generate a comprehensive, highly detailed, printable FILL-IN-THE-BLANK study worksheet aimed at exam preparation (AYT / ÖABT focus).

---

### WORKSHEET & BLANK RULES (STRICT)
1. **Wide Blanks Only:** Every blank must be large enough to write in physically. Use long underlines followed by the blank number:
   - Format: \`____________________ [1]\`
   - Example: \`Şeyh Galip'in sembolik ve alegorik mesnevisi olan ____________________ [1], Türk edebiyatında sebk-i Hindi akımının en önemli örneklerindendir.\`
2. **ZERO Answers in the Text:** 
   - **DO NOT** write the answer next to, inside, or under the blank.
   - **DO NOT** put answers in parentheses, hints, or brackets next to the number.
   - The worksheet text itself MUST contain ONLY the context and the empty underline \`____________________ [X]\`.

---

### ANSWER KEY (AT THE VERY END)
- At the end of the worksheet, compile a clean two-column markdown table containing ONLY the numbers and their corresponding exact answers.
- Format:
  | Boşluk No | Doğru Cevap |
  | :--- | :--- |
  | [1] | Hüsn ü Aşk |
  | [2] | ... |

---

### CRITICAL RULES
- **Focus:** Highlight critical author-work matches, distinctive themes, genres, dedicated patrons, and points frequently emphasized in exams.
- **Language Rule:** The entire output MUST be delivered in fluent, academic, and exam-appropriate Turkish.`,

  "nlm": `OBJECTIVE: Generate a high-density, pedagogically optimized, 21+ page educational presentation strictly in Turkish.
KPI_1_LANGUAGE: 100% Turkish. ZERO English terminology in the final output (No "Slide", "Title", "Content").
KPI_2_VOLUME: Minimum 21 distinct presentation pages generated without truncation.
KPI_3_PEDAGOGY: 100% adherence to Gestalt principles, zero fluff.

[INPUT VARIABLES]
TOPIC: {konu}
GRADE LEVEL: {sinif}
SUBJECT: {ders}
TEACHER: {ogretmen}
INSTITUTION: {kurum}

[PRIME DIRECTIVE]
You are a "{ders} Teacher", a master educator and instructional designer. Your task is to generate a comprehensive, highly engaging, and academically rigorous presentation on the provided TOPIC. The content must be tailored perfectly to the target GRADE LEVEL, using deductive reasoning (whole-to-part).

{ortaokul_ek}

[CONSTRAINTS & SAFETY (ZERO-TOLERANCE RULES)]
STRICT LANGUAGE: The output must be entirely in Turkish. Replace all system words: "Slide" -> "Sayfa", "Title" -> "Başlık". NEVER use English UI terms. On the first page, write "Senin Öğretmenin: {ogretmen}" in the corner in a small font, and write the institution name "[{kurum}]" in a small and aesthetic way.
NO FLUFF TITLES: Use direct, academic titles. Do not waste space with overly large, aesthetic text.
VISUAL AESTHETIC (VIBE): The presentation aesthetic is a "Clean Lined School Notebook". ALL slide pages MUST have a perfectly smooth WHITE background and NO background color or pattern other than white is allowed. This white background must be horizontally lined, just like a school notebook. Do NOT describe abstract metaphors, random clipart, or useless stock images.
!! A STRICTLY WHITE BACKGROUND WITH A LINED NOTEBOOK APPEARANCE IS ABSOLUTELY MANDATORY.
VISUAL DENSITY: Every page MUST contain a description of an academic visual, schema, or table supporting the topic. This visual area must cover exactly 30% of each page's area.
ACADEMIC PURITY: Explain theories strictly through appropriate academic contexts.
GESTALT & LAYOUT: Group related concepts closely. Use Markdown tables, flowcharts, and bullet points to break down complex texts.
NO TRUNCATION: You MUST output all 21+ pages. Do not summarize the ending.
NO META-DATA IN OUTPUT: Slide contents MUST NEVER contain square brackets [], parentheses (), or color codes.

[REQUIRED CONTENT ELEMENTS]
HIGHLIGHTING: Highlight critical definitions, formulas, and keywords. Highlights must strictly be a color between yellow and orange.
EXAM FOCUS: Insert a bordered warning box in relevant pages. Format as: > 🎯 SINAVDA ÇIKAR!: [Exam tip, exception, or potential question type]

[DUAL-LAYER VERIFICATION LOOP]
Step 1 - Draft Outline: Internally map out the 21+ pages.
Step 2 - Verify Constraints: Check for English words, page count, visual placeholders.
Step 3 - Execute: Generate the final output using the exact [OUTPUT TEMPLATE].

[OUTPUT TEMPLATE (Strict Markdown)]
Sayfa: 1
Tasarım Notu: [WHITE background, lined notebook. "Senin Öğretmenin: {ogretmen}" and "{kurum}".]
[Görsel Alanı (%30)]
Kavram Haritası (Büyük Resim) - [TOPIC]

Sayfa: [Page Number]
Tasarım Notu: [WHITE background lined notebook.]
[Simple Topic Title]
[Görsel Alanı (%30)]
[Topic explanation]
[YELLOW/ORANGE HIGHLIGHT on important parts]

> 🎯 SINAVDA ÇIKAR!:
[Exam-focused critical info]`,

  "video": `### TOPIC / LESSON DETAILS
- **Subject / Area:** {ders}
- **Topic:** {konu}
---

### INSTRUCTIONS
Based on the uploaded sources, generate a concise, engaging **lesson introduction video script** for the topic specified above.

- **Output Language:** Turkish (Ensure the text is natural, conversational, fluent, and engaging—avoid literal translations or robotic prose).
- **Duration / Length:** Maximum 3–4 minutes (approximately 400–450 Turkish words).
- **Flow & Structure:** You have full creative freedom regarding pacing and narrative style. However, ensure that it:
  1. Hooks the audience right at the beginning with an intriguing angle or question.
  2. Conveys the big picture and why this topic matters in the real world.
  3. Wraps up with an energetic, motivating transition into the main lecture.
- **Focus:** Avoid overwhelming technical jargon or heavy theoretical deep dives; focus instead on sparking curiosity and building foundational intuition.`,

  "maarif": `2026 - 2027 Academic Year {okul} {ders} Daily Lesson Plan

Act as an education expert and a curriculum developer of the Türkiye Century Maarif Model. Prepare a short, goal-oriented daily lesson plan adhering strictly to the outline and variables I have provided below, in line with modern pedagogical principles.

ABSOLUTE RULES (NEVER VIOLATE):
1. The output MUST be set to exactly 1 page in length. Do not extend the text, do not write unnecessary sentences, present the content concisely in bullet points.
2. The design MUST be strictly black-and-white, plain and single-color. Build a simple, professional text structure; never step outside the format.
3. Only the "2026 - 2027 Academic Year..." section stated above will appear in the heading, no external title will be added.

PART I. LESSON INFORMATION
- Subject Name: {ders}
- Lesson Date: {tarih}
- Week: {hafta}
- Lesson Duration: {sure}
- Unit Name: {unite}
- Topics: {konular} (Only the main concepts are provided. Please logically expand these topic headings according to the general curriculum.)
- Learning Outcome: {ogrenme_ciktilari}

PART II. MAARIF MODEL COMPONENTS AND LESSON FLOW
DOMAIN SKILLS: {alan}
CONCEPTUAL SKILLS: {kavramsal}
DISPOSITIONS: {egilimler}
- Social-Emotional Learning Skills: {sosyal}
- Values: {degerler}
- Literacy Skills: {okuryazarlik}
INTERDISCIPLINARY RELATIONSHIPS: {disiplinler}
INTER-SKILL RELATIONSHIPS: {beceriler_arasi}
CONTENT FRAMEWORK: {icerik}
LEARNING EVIDENCES: {olcme}
- Basic Assumptions: {kabuller}
- Pre-Assessment Process: {on_degerlendirme}
- Bridge Building: {kopru}
- Teaching-Learning Applications: {uygulamalar}
- Enrichment: {zenginlestirme}
- Support: {destekleme}

After all tables and content have been produced in accordance with the rules, present this output in downloadable PDF format.`,

  "kavram_yanilgisi": `You are a senior {ders} teacher with deep expertise in pedagogical content knowledge and concept teaching, and with extensive familiarity with MEB and ÖSYM question styles.

We are currently working on the topic "{konu}" for students at the {sinif} level. Our goal is to ensure that students comprehend or revise this content/subject in the most academically efficient way possible.

{ortaokul_ek}

At this point, use your own pedagogical reasoning. Analyze the {sinif} level and the heading "{konu}", identify the 2-3 most appropriate and critical learning outcomes according to the MEB curriculum, and build the process entirely around these outcomes.

Design 1 "Misconception Analysis" according to the pedagogical guidelines below.
List the most common misconceptions (incorrectly believed truths) students have regarding "{konu}". Under each misconception, write conceptual change strategies (short pedagogical prescriptions) that can be applied in class to correct this error.

Constraints:
- Produce the output in a language that is ready for direct use, clear, understandable, and encouraging.
- Take into full account the cognitive and psychological developmental level of the age group.
- Do not go beyond the limits of the MEB curriculum.
- Adjust the cognitive level of the content to the "Middle (Comprehension/Application)" tier of Bloom's Taxonomy.
- The produced content must consist of exactly 20 items/misconceptions.

Format:
- Structure the information using bullet points and subheadings for easy readability. Present the output as a downloadable PDF on a SINGLE PAGE in BLACK AND WHITE. DELIVER A DOWNLOADABLE PDF OUTPUT.`,

  "gagne": `Role: You are an expert Instructional Designer.
Task: For the concept "{konu}" to be taught in the "{ders}" subject for students at the {sinif} level, prepare a comprehensive, interactive, step-by-step educational/lesson plan strictly adhering to Robert Gagné's "Nine Events of Instruction" model.

{ortaokul_ek}

Please elaborate the output by detailing the following 9 stages as separate headings:

1. Gaining Attention (Attention): Design an engaging, impressive opening (e.g., a surprising statistic, story, question, or problem) to focus participants on the lesson.
2. Informing Learners of the Objective (Informing the Participant of the Objective): Clearly express what participants will learn by the end of this training and what the expectations are.
3. Stimulating Recall of Prior Learning (Stimulating Recall of Prior Learning): Design prompting questions or short activities that relate the new information to previous experiences and knowledge.
4. Presenting the Stimulus Material (Presenting the Stimulus Material): Convey the core content in the clearest and most structured way possible through examples, visuals, scenarios, or materials. In this item, add at least 3 different Teaching Methods and Techniques (e.g., Case Study, Demonstration, Brainstorming, etc.) with their justifications.
5. Providing Learning Guidance (Providing Learning Guidance): Guide participants on how to use the materials, how to make sense of the information, and which strategies to follow. In this item, also add at least 3 different Teaching Methods and Techniques most appropriate to the nature of the lesson to optimize the learning process.
6. Eliciting Performance (Eliciting Performance): Create practical opportunities/tasks for participants to actively apply and demonstrate what they have learned. In this item as well, add at least 3 different Teaching Methods and Techniques suggestions to maximize active student participation.
7. Providing Feedback (Providing Feedback): Suggest constructive, guiding, and immediate feedback mechanisms targeting participants' performance.
8. Assessing Performance (Assessing Performance): Design an assessment process that evaluates what participants have achieved and offers development suggestions to close their gaps.
9. Enhancing Retention and Transfer (Enhancing Retention and Transfer): Suggest strategies and practices to ensure that what has been learned stays in long-term memory and can be applied in real-world scenarios and different contexts.

Target Audience: Students at the {sinif} level
Training Duration: {g_sure}

After all steps are completed, present this output in downloadable PDF format.`
};
