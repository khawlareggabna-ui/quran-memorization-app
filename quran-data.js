// بيانات القرآن الكريم - عينة من السور
const quranData = {
    chapters: [
        {
            number: 1,
            name: "الفاتحة",
            verses: [
                "بسم الله الرحمن الرحيم",
                "الحمد لله رب العالمين",
                "الرحمن الرحيم",
                "مالك يوم الدين",
                "إياك نعبد وإياك نستعين",
                "اهدنا الصراط المستقيم",
                "صراط الذين أنعمت عليهم غير المغضوب عليهم ولا الضالين"
            ]
        },
        {
            number: 2,
            name: "البقرة",
            verses: [
                "الم",
                "ذلك الكتاب لا ريب فيه هدى للمتقين",
                "الذين يؤمنون بالغيب ويقيمون الصلاة ومما رزقناهم ينفقون",
                "والذين يؤمنون بما أنزل إليك وما أنزل من قبلك وبالآخرة هم يوقنون",
                "أولئك على هدى من ربهم وأولئك هم المفلحون"
            ]
        },
        {
            number: 112,
            name: "الإخلاص",
            verses: [
                "قل هو الله أحد",
                "الله الصمد",
                "لم يلد ولم يولد",
                "ولم يكن له كفوا أحد"
            ]
        }
    ]
};

// دالة للبحث عن سورة برقمها
function getChapter(chapterNumber) {
    return quranData.chapters.find(ch => ch.number === chapterNumber);
}

// دالة لحساب التشابه بين نصين
function calculateSimilarity(text1, text2) {
    // إزالة المسافات الزائدة والتطبيع
    const normalize = (text) => text.trim().replace(/\s+/g, ' ');
    const t1 = normalize(text1);
    const t2 = normalize(text2);

    if (t1 === t2) return 100; // تطابق كامل

    // حساب Levenshtein distance
    const len1 = t1.length;
    const len2 = t2.length;
    const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));

    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;

    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            const cost = t1[i - 1] === t2[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            );
        }
    }

    const maxLen = Math.max(len1, len2);
    const distance = matrix[len1][len2];
    const similarity = ((maxLen - distance) / maxLen) * 100;

    return Math.max(0, similarity);
}

// دالة لإيجاد الأخطاء في الإجابة
function findMistakes(correctText, userText) {
    const correctWords = correctText.split(' ');
    const userWords = userText.split(' ');
    const mistakes = [];

    correctWords.forEach((word, index) => {
        if (!userWords[index]) {
            mistakes.push({
                position: index,
                correct: word,
                user: 'محذوف',
                type: 'missing'
            });
        } else if (userWords[index] !== word) {
            mistakes.push({
                position: index,
                correct: word,
                user: userWords[index],
                type: 'wrong'
            });
        }
    });

    // التحقق من الكلمات الإضافية
    if (userWords.length > correctWords.length) {
        for (let i = correctWords.length; i < userWords.length; i++) {
            mistakes.push({
                position: i,
                correct: 'لا توجد',
                user: userWords[i],
                type: 'extra'
            });
        }
    }

    return mistakes;
}
