// متغيرات تطبيق الاختبار
let currentChapter = null;
let testMode = false;
let currentVerseIndex = 0;
let testResults = {
    total: 0,
    correct: 0,
    mistakes: []
};

// تحميل السورة
function loadChapter() {
    const chapterInput = document.getElementById('chapterInput').value;
    const chapterNumber = parseInt(chapterInput);

    if (!chapterNumber || chapterNumber < 1 || chapterNumber > 114) {
        alert('الرجاء إدخال رقم صحيح للسورة (1-114)');
        return;
    }

    currentChapter = getChapter(chapterNumber);

    if (!currentChapter) {
        alert('عذرا، السورة المطلوبة غير متاحة حاليا');
        return;
    }

    displayChapter();
}

// عرض السورة
function displayChapter() {
    const chapterSection = document.getElementById('chapterSection');
    const chapterName = document.getElementById('chapterName');
    const versesContainer = document.getElementById('versesContainer');
    const testSection = document.getElementById('testSection');

    chapterName.textContent = `سورة ${currentChapter.name}`;
    versesContainer.innerHTML = '';

    currentChapter.verses.forEach((verse, index) => {
        const verseDiv = document.createElement('div');
        verseDiv.className = 'verse';
        verseDiv.innerHTML = `
            <span class="verse-number">${index + 1}</span>
            <span>${verse}</span>
        `;
        verseDiv.onclick = () => toggleVerseVisibility(verseDiv);
        versesContainer.appendChild(verseDiv);
    });

    // تحديث حقول الاختبار
    document.getElementById('endVerse').max = currentChapter.verses.length;
    document.getElementById('startVerse').value = '';
    document.getElementById('endVerse').value = '';

    chapterSection.style.display = 'block';
    testSection.style.display = 'block';
    document.getElementById('resultsSummary').style.display = 'none';
}

// إخفاء/إظهار الآية
function toggleVerseVisibility(verseDiv) {
    verseDiv.classList.toggle('hidden');
}

// بدء الاختبار
function startTest() {
    const startVerse = parseInt(document.getElementById('startVerse').value);
    const endVerse = parseInt(document.getElementById('endVerse').value);

    if (!startVerse || !endVerse) {
        alert('الرجاء إدخال نطاق الآيات');
        return;
    }

    if (startVerse < 1 || endVerse > currentChapter.verses.length || startVerse > endVerse) {
        alert('الرجاء التأكد من صحة أرقام الآيات');
        return;
    }

    testMode = true;
    currentVerseIndex = startVerse - 1;
    testResults = {
        total: endVerse - startVerse + 1,
        correct: 0,
        mistakes: []
    };

    document.querySelector('.test-controls').style.display = 'none';
    document.getElementById('testMode').style.display = 'block';
    displayTestVerse();
}

// عرض آية الاختبار
function displayTestVerse() {
    const endVerse = parseInt(document.getElementById('endVerse').value);
    
    if (currentVerseIndex >= endVerse) {
        endTest();
        return;
    }

    const verse = currentChapter.verses[currentVerseIndex];
    const verseNumber = currentVerseIndex + 1;

    document.getElementById('verseDisplay').innerHTML = `
        <div>
            <strong>الآية ${verseNumber}:</strong><br>
            ${verse}
        </div>
    `;

    document.getElementById('userAnswer').value = '';
    document.getElementById('resultBox').style.display = 'none';
}

// التحقق من الإجابة
function checkAnswer() {
    const userAnswer = document.getElementById('userAnswer').value;
    
    if (!userAnswer.trim()) {
        alert('الرجاء كتابة الآية أولا');
        return;
    }

    const correctVerse = currentChapter.verses[currentVerseIndex];
    const similarity = calculateSimilarity(correctVerse, userAnswer);
    const mistakes = findMistakes(correctVerse, userAnswer);

    const resultBox = document.getElementById('resultBox');
    const resultContent = document.getElementById('resultContent');

    let resultHTML = '';
    let isCorrect = similarity >= 95;

    if (isCorrect) {
        resultHTML = `
            <div class="result-header">✅ ممتاز! إجابة صحيحة</div>
            <p>تطابق النص بنسبة 100%</p>
        `;
        testResults.correct++;
    } else {
        resultHTML = `
            <div class="result-header">❌ الإجابة غير صحيحة تماما</div>
            <div class="mistake-info">
                <strong>نسبة التطابق:</strong> ${similarity.toFixed(1)}%
            </div>
        `;

        if (mistakes.length > 0) {
            resultHTML += `<div class="mistake-info"><strong>الأخطاء المكتشفة:</strong>`;
            mistakes.forEach(mistake => {
                let errorType = '';
                if (mistake.type === 'missing') {
                    errorType = '❌ كلمة محذوفة';
                } else if (mistake.type === 'wrong') {
                    errorType = '❌ كلمة خاطئة';
                } else {
                    errorType = '❌ كلمة إضافية';
                }

                resultHTML += `
                    <div style="margin: 10px 0; padding: 8px; background: rgba(255,0,0,0.05); border-radius: 5px;">
                        <strong>${errorType}</strong><br>
                        الصحيح: <span style="color: #48bb78;">${mistake.correct}</span><br>
                        ما كتبته: <span style="color: #f56565;">${mistake.user}</span>
                    </div>
                `;
            });
            resultHTML += '</div>';
        }

        testResults.mistakes.push({
            verseNumber: currentVerseIndex + 1,
            correct: correctVerse,
            user: userAnswer,
            mistakes: mistakes,
            similarity: similarity
        });
    }

    resultContent.innerHTML = resultHTML;
    resultBox.className = isCorrect ? 'result success' : 'result error';
    resultBox.style.display = 'block';
}

// الآية التالية
function nextVerse() {
    currentVerseIndex++;
    const endVerse = parseInt(document.getElementById('endVerse').value);

    if (currentVerseIndex >= endVerse) {
        endTest();
    } else {
        displayTestVerse();
    }
}

// إنهاء الاختبار
function endTest() {
    testMode = false;
    document.getElementById('testMode').style.display = 'none';
    document.querySelector('.test-controls').style.display = 'grid';
    showResults();
}

// عرض النتائج
function showResults() {
    const resultsSummary = document.getElementById('resultsSummary');
    const percentage = (testResults.correct / testResults.total) * 100;

    document.getElementById('totalVerses').textContent = testResults.total;
    document.getElementById('correctAnswers').textContent = testResults.correct;
    document.getElementById('wrongAnswers').textContent = testResults.total - testResults.correct;
    document.getElementById('percentage').textContent = percentage.toFixed(1) + '%';

    // عرض الأخطاء
    const mistakesReview = document.getElementById('mistakesReview');
    
    if (testResults.mistakes.length > 0) {
        let mistakesHTML = `
            <div style="background: #fff5f5; padding: 20px; border-radius: 10px; margin-top: 20px;">
                <h3 style="color: #f56565; margin-bottom: 15px;">📋 تفاصيل الأخطاء</h3>
        `;

        testResults.mistakes.forEach(mistake => {
            mistakesHTML += `
                <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-right: 4px solid #f56565;">
                    <div style="color: #667eea; font-weight: bold; margin-bottom: 10px;">الآية ${mistake.verseNumber}</div>
                    <div style="margin: 10px 0;">
                        <strong>النص الصحيح:</strong><br>
                        <span style="color: #48bb78;">${mistake.correct}</span>
                    </div>
                    <div style="margin: 10px 0;">
                        <strong>ما كتبته:</strong><br>
                        <span style="color: #f56565;">${mistake.user}</span>
                    </div>
                    <div style="margin: 10px 0; padding: 10px; background: #f0f4ff; border-radius: 5px;">
                        <strong>نسبة التطابق:</strong> ${mistake.similarity.toFixed(1)}%
                    </div>
            `;
            
            if (mistake.mistakes.length > 0) {
                mistakesHTML += '<strong>الأخطاء المفصلة:</strong><ul style="margin: 10px 0; padding-right: 20px;">';
                mistake.mistakes.forEach(err => {
                    mistakesHTML += `
                        <li style="margin: 5px 0;">
                            <strong>${err.type === 'missing' ? 'محذوف' : err.type === 'wrong' ? 'خاطئ' : 'إضافي'}:</strong>
                            الصحيح: <span style="color: #48bb78;">"${err.correct}"</span> | 
                            كتبت: <span style="color: #f56565;">"${err.user}"</span>
                        </li>
                    `;
                });
                mistakesHTML += '</ul>';
            }

            mistakesHTML += '</div>';
        });

        mistakesHTML += '</div>';
        mistakesReview.innerHTML = mistakesHTML;
    } else {
        mistakesReview.innerHTML = '<p style="color: #48bb78; font-weight: bold; margin-top: 20px;">🎉 ممتاز! لا توجد أخطاء، حفظك صحيح تماما!</p>';
    }

    resultsSummary.style.display = 'block';
}

// إعادة تعيين التطبيق
function resetApp() {
    testMode = false;
    currentVerseIndex = 0;
    testResults = {
        total: 0,
        correct: 0,
        mistakes: []
    };

    document.getElementById('testMode').style.display = 'none';
    document.querySelector('.test-controls').style.display = 'grid';
    document.getElementById('resultsSummary').style.display = 'none';
    document.getElementById('userAnswer').value = '';
    document.getElementById('resultBox').style.display = 'none';
}
