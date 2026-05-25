let courses = [];
const NUM_COURSES_INPUT = 10;

function generatePeriodsHTML(courseIndex, numPeriods = 3) {
    const periodLabels = ['الفترة الأولى', 'الفترة الثانية', 'الفترة الثالثة', 'الفترة الرابعة', 'الفترة الخامسة'];
    const basePercent = Math.round((100 / numPeriods) * 100) / 100;
    
    let periodsHTML = '';
    for (let j = 0; j < numPeriods; j++) {
        const percentage = j === numPeriods - 1 
            ? Math.round((100 - (basePercent * (numPeriods - 1))) * 100) / 100 
            : basePercent;
        
        periodsHTML += `
            <div class="course-card-section">
                <div class="input-group">
                    <label>${periodLabels[j]}:</label>
                    <input type="number" id="courseGrade${courseIndex}_${j}" min="0" max="100" step="0.01" placeholder="الدرجة" class="section-grade">
                </div>
                <div class="input-group">
                    <label>النسبة (%):</label>
                    <input type="number" id="coursePercentage${courseIndex}_${j}" min="0" max="100" step="0.01" value="${percentage}" class="section-percentage">
                </div>
            </div>
        `;
    }
    return periodsHTML;
}

function updatePeriods(courseIndex) {
    const numPeriodsSelect = document.getElementById(`courseNumPeriods${courseIndex}`);
    const numPeriods = parseInt(numPeriodsSelect.value);
    const sectionsContainer = document.getElementById(`courseSections${courseIndex}`);
    sectionsContainer.innerHTML = generatePeriodsHTML(courseIndex, numPeriods);
}

function createCourseInputCards() {
    const container = document.getElementById('coursesInputContainer');
    container.innerHTML = '';

    for (let i = 0; i < NUM_COURSES_INPUT; i++) {
        const card = document.createElement('div');
        card.className = 'course-input-card';
        card.id = `courseCard${i}`;

        card.innerHTML = `
            <h3>المادة ${i + 1}</h3>
            
            <div class="course-header">
                <div class="input-group">
                    <label>اسم المادة:</label>
                    <input type="text" id="courseName${i}" placeholder="مثال: الرياضيات" class="course-name-input">
                </div>
                
                <div class="input-group">
                    <label>المعامل:</label>
                    <input type="number" id="courseCoefficient${i}" min="0" value="1" class="course-coefficient-input">
                </div>

                <div class="input-group">
                    <label>عدد الفترات:</label>
                    <select id="courseNumPeriods${i}" onchange="updatePeriods(${i})" class="periods-select">
                        <option value="2">فترتان (2)</option>
                        <option value="3" selected>ثلاث فترات (3)</option>
                        <option value="4">أربع فترات (4)</option>
                        <option value="5">خمس فترات (5)</option>
                    </select>
                </div>
            </div>

            <div class="course-sections" id="courseSections${i}">
                ${generatePeriodsHTML(i, 3)}
            </div>
        `;
        
        container.appendChild(card);
    }
}

function addAllCourses() {
    try {
        courses = [];
        let addedCount = 0;

        for (let i = 0; i < NUM_COURSES_INPUT; i++) {
            const courseName = document.getElementById(`courseName${i}`).value.trim();
            
            // تخطي المواد الفارغة
            if (!courseName) {
                continue;
            }

            const courseCoefficientInput = document.getElementById(`courseCoefficient${i}`).value.trim();

            if (!courseCoefficientInput) {
                alert(`الرجاء إدخال معامل المادة "${courseName}"`);
                document.getElementById(`courseCoefficient${i}`).focus();
                return;
            }

            const courseCoefficient = parseFloat(courseCoefficientInput);

            if (isNaN(courseCoefficient) || courseCoefficient <= 0) {
                alert(`المعامل غير صحيح للمادة "${courseName}" (يجب أن يكون أكبر من 0)`);
                document.getElementById(`courseCoefficient${i}`).focus();
                return;
            }

            // جمع بيانات الأقسام
            let sections = [];
            let totalPercentage = 0;

            const gradeInputs = document.querySelectorAll(`#courseCard${i} .section-grade`);
            const percentageInputs = document.querySelectorAll(`#courseCard${i} .section-percentage`);

            for (let j = 0; j < gradeInputs.length; j++) {
                const gradeValue = gradeInputs[j].value.trim();
                let grade = 0;

                if (gradeValue !== '') {
                    grade = parseFloat(gradeValue);
                    if (isNaN(grade) || grade < 0 || grade > 100) {
                        alert(`درجة غير صحيحة للقسم ${j + 1} في المادة "${courseName}" (بين 0 و 100)`);
                        gradeInputs[j].focus();
                        return;
                    }
                }

                const percentageValue = percentageInputs[j].value.trim();
                if (!percentageValue) {
                    alert(`الرجاء إدخال النسبة المئوية للقسم ${j + 1} في المادة "${courseName}"`);
                    percentageInputs[j].focus();
                    return;
                }

                const percentage = parseFloat(percentageValue);
                if (isNaN(percentage) || percentage < 0 || percentage > 100) {
                    alert(`نسبة غير صحيحة للقسم ${j + 1} في المادة "${courseName}" (بين 0 و 100)`);
                    percentageInputs[j].focus();
                    return;
                }

                sections.push({
                    grade: grade,
                    percentage: percentage
                });

                totalPercentage += percentage;
            }

            if (Math.abs(totalPercentage - 100) > 0.5) {
                alert(`مجموع النسب المئوية للمادة "${courseName}" = ${totalPercentage.toFixed(2)}%\nيجب أن يساوي 100% تقريباً`);
                return;
            }

            // حساب معدل المادة
            const courseGrade = sections.reduce((sum, sec) => sum + (sec.grade * sec.percentage / 100), 0);

            courses.push({
                id: Date.now() + i,
                name: courseName,
                sections: sections,
                grade: courseGrade,
                credits: 1,
                coefficient: courseCoefficient
            });

            addedCount++;
        }

        if (addedCount === 0) {
            alert('الرجاء إدخال أسماء المواد على الأقل');
            return;
        }

        alert(`تم إضافة ${addedCount} مواد بنجاح!`);
        updateDisplay();
    } catch (error) {
        console.error('خطأ في إضافة المواد:', error);
        alert('حدث خطأ غير متوقع. الرجاء تحديث الصفحة والمحاولة مجدداً');
    }
}

function deleteCourse(id) {
    courses = courses.filter(course => course.id !== id);
    updateDisplay();
}

function updateDisplay() {
    updateTable();
    calculateGrades();
}

function updateTable() {
    const tbody = document.getElementById('coursesList');
    
    if (courses.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="5">لم تتم إضافة مواد بعد</td></tr>';
        return;
    }

    tbody.innerHTML = courses.map(course => {
        const periodLabels = ['فترة أولى', 'فترة ثانية', 'فترة ثالثة', 'فترة رابعة', 'فترة خامسة'];
        let sectionsInfo = course.sections.map((sec, idx) => 
            `${periodLabels[idx] || 'فترة ' + (idx + 1)}: ${sec.grade.toFixed(2)} (${sec.percentage}%)`
        ).join(' | ');

        return `
            <tr>
                <td>${course.name}</td>
                <td style="font-size: 0.9em; color: #555;">${sectionsInfo}</td>
                <td><strong>${course.grade.toFixed(2)}</strong></td>
                <td>${course.coefficient}</td>
                <td>
                    <button class="btn-delete" onclick="deleteCourse(${course.id})">حذف</button>
                </td>
            </tr>
        `;
    }).join('');
}

function calculateGrades() {
    if (courses.length === 0) {
        document.getElementById('averageGrade').textContent = '0.00';
        document.getElementById('weightedAverage').textContent = '0.00';
        document.getElementById('statusValue').textContent = '-';
        document.getElementById('statusValue').className = 'result-value status-value';
        return;
    }

    // حساب المعدل الحسابي (المتوسط البسيط) مع المعاملات
    const simpleTotal = courses.reduce((sum, course) => sum + (course.grade * course.coefficient), 0);
    const coefficientSum = courses.reduce((sum, course) => sum + course.coefficient, 0);
    const simpleAverage = coefficientSum > 0 ? simpleTotal / coefficientSum : 0;

    // حساب المعدل المرجح (مع الساعات والمعاملات)
    const weightedSum = courses.reduce((sum, course) => sum + (course.grade * course.credits * course.coefficient), 0);
    const totalCredits = courses.reduce((sum, course) => sum + (course.credits * course.coefficient), 0);
    const weightedAverage = totalCredits > 0 ? weightedSum / totalCredits : 0;

    // عرض النتائج
    document.getElementById('averageGrade').textContent = simpleAverage.toFixed(2);
    document.getElementById('weightedAverage').textContent = weightedAverage.toFixed(2);

    // عرض الحالة (ناجح أو راسب)
    const statusElement = document.getElementById('statusValue');
    
    if (weightedAverage >= 10) {
        statusElement.textContent = '✓ ناجح';
        statusElement.className = 'result-value status-value passed';
    } else {
        statusElement.textContent = '✗ راسب';
        statusElement.className = 'result-value status-value failed';
    }
}

function clearAll() {
    if (courses.length === 0) {
        alert('لا توجد مواد لحذفها');
        return;
    }

    if (confirm('هل تريد حذف جميع المواد؟')) {
        courses = [];
        updateDisplay();
        document.getElementById('averageGrade').textContent = '0.00';
        document.getElementById('weightedAverage').textContent = '0.00';
        document.getElementById('statusValue').textContent = '-';
        document.getElementById('statusValue').className = 'result-value status-value';
    }
}

function downloadResults() {
    if (courses.length === 0) {
        alert('يرجى إضافة مواد أولاً');
        return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF'; // BOM للدعم الصحيح للعربية
    csvContent += 'اسم المادة,معدل المادة,عدد الساعات,المعامل\n';

    courses.forEach(course => {
        csvContent += `${course.name},${course.grade.toFixed(2)},${course.credits},${course.coefficient}\n`;
    });

    const simpleTotal = courses.reduce((sum, course) => sum + (course.grade * course.coefficient), 0);
    const coefficientSum = courses.reduce((sum, course) => sum + course.coefficient, 0);
    const simpleAverage = coefficientSum > 0 ? simpleTotal / coefficientSum : 0;

    const weightedSum = courses.reduce((sum, course) => sum + (course.grade * course.credits * course.coefficient), 0);
    const totalCredits = courses.reduce((sum, course) => sum + (course.credits * course.coefficient), 0);
    const weightedAverage = totalCredits > 0 ? weightedSum / totalCredits : 0;

    csvContent += '\n';
    csvContent += `المعدل الحسابي,${simpleAverage.toFixed(2)}\n`;
    csvContent += `المعدل المرجح,${weightedAverage.toFixed(2)}\n`;
    csvContent += `الحالة,${weightedAverage >= 10 ? 'ناجح' : 'راسب'}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'نتائج_المعدلات.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// تهيئة الخانات عند تحميل الصفحة
function initializePage() {
    try {
        const container = document.getElementById('coursesInputContainer');
        if (container) {
            createCourseInputCards();
        }
    } catch (e) {
        console.error('خطأ في تهيئة الصفحة:', e);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
} else {
    initializePage();
}

// السماح بإضافة مادة عند الضغط على Enter
document.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        const activeElement = document.activeElement;
        if (activeElement.id === 'courseCoefficient' || 
            activeElement.classList.contains('section-percentage')) {
            addCourse();
        }
    }
});
