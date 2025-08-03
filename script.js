document.addEventListener('DOMContentLoaded', function() {
    // Конфигурация
    const config = {
        colors: ['#10367D', '#2D4D9E', '#4A64BF', '#677BDF', '#FF6B6B', '#FF8E8E', '#4ECDC4', '#7EDFD8', '#A05195', '#C27BB3', '#FDCB6E', '#FFEAA7'],
        maxInterests: 3,
        minAge: 18,
        maxAge: 100
    };

    // Состояние
    const state = {
        currentStep: 1,
        totalSteps: 7,
        userData: {
            name: '',
            age: '',
            city: '',
            description: '',
            interests: [],
            moodColor: '#10367D',
            avatar: null,
            createdAt: new Date().toISOString()
        }
    };

    // Элементы
    const elements = {
        mainScreen: document.getElementById('mainScreen'),
        startBtn: document.getElementById('startBtn'),
        registrationForm: document.getElementById('registrationForm'),
        logo: document.querySelector('.logo-path')
    };

    // Инициализация
    function init() {
        initLogo();
        checkSavedProfile();
        bindEvents();
    }

    // Анимация логотипа
    function initLogo() {
        elements.logo.style.strokeDasharray = '150';
        elements.logo.style.strokeDashoffset = '150';
        setTimeout(() => {
            elements.logo.style.animation = 'drawLogo 2s ease-out forwards';
        }, 500);
    }

    // Проверка сохраненного профиля
    function checkSavedProfile() {
        const savedProfile = localStorage.getItem('datingProfile');
        if (savedProfile) {
            state.userData = JSON.parse(savedProfile);
            showProfile();
        }
    }

    // Назначение событий
    function bindEvents() {
        elements.startBtn.addEventListener('click', startRegistration);
    }

    // Запуск регистрации
    function startRegistration() {
        animateTransition(() => {
            elements.mainScreen.classList.add('hidden');
            elements.registrationForm.classList.remove('hidden');
            renderForm();
        });
    }

    // Анимация перехода
    function animateTransition(callback) {
        elements.mainScreen.style.opacity = '0';
        setTimeout(() => {
            callback();
            setTimeout(() => {
                elements.registrationForm.style.opacity = '1';
                focusCurrentField();
            }, 50);
        }, 500);
    }

    // Рендер формы
    function renderForm() {
        elements.registrationForm.innerHTML = `
            ${generateSteps()}
        `;
        setupFormHandlers();
        focusCurrentField();
    }

    // Генерация шагов
    function generateSteps() {
        let html = '';
        for (let step = 1; step <= state.totalSteps; step++) {
            html += `
                <div class="form-step ${step === state.currentStep ? 'active' : ''}" data-step="${step}">
                    ${getStepContent(step)}
                    ${getStepButtons(step)}
                </div>
            `;
        }
        return html;
    }

    // Контент шагов
    function getStepContent(step) {
        const steps = {
            1: `<h2>Как вас зовут?</h2>
                <input type="text" class="input-field" id="userName" placeholder="Ваше имя" required>`,
            2: `<h2>Сколько вам лет?</h2>
                <input type="number" class="input-field" id="userAge" min="${config.minAge}" max="${config.maxAge}" placeholder="Ваш возраст" required>`,
            3: `<h2>Ваш город</h2>
                <input type="text" class="input-field" id="userCity" placeholder="Где вы живете?" required>`,
            4: `<h2>Что вам нравится?</h2>
                <p>Выберите 1-3 варианта</p>
                <div class="tags-container">
                    ${['music', 'sports', 'books', 'travel', 'art', 'games']
                        .map(interest => `
                            <div class="tag" data-interest="${interest}">
                                ${getInterestEmoji(interest)} ${getInterestName(interest)}
                            </div>`
                        ).join('')}
                </div>`,
            5: `<h2>Ваш любимый цвет</h2>
                <div class="colors-container">
                    ${config.colors.map(color => `
                        <div class="color-option" style="background: ${color}" data-color="${color}"></div>
                    `).join('')}
                </div>`,
            6: `<h2>О себе</h2>
                <p>Расскажите что-то о себе (необязательно)</p>
                <textarea class="input-field" id="userDescription" placeholder="Я люблю путешествия, книги и..." rows="4"></textarea>`,
            7: `<h2>Ваше фото</h2>
                <p>Добавьте фото для профиля (необязательно)</p>
                <div class="avatar-upload">
                    <label class="btn">
                        📸 Выбрать фото
                        <input type="file" id="avatarUpload" accept="image/*" hidden>
                    </label>
                    <div class="avatar-preview" id="avatarPreview"></div>
                </div>`
        };
        return steps[step] || '';
    }

    // Кнопки шагов
    function getStepButtons(step) {
        return `
            <div class="navigation">
                ${step > 1 ? '<button class="btn prev-step">Назад</button>' : ''}
                <button class="btn next-step">
                    ${step === state.totalSteps ? 'Сохранить профиль' : 'Далее'}
                </button>
            </div>
        `;
    }

    // Настройка обработчиков
    function setupFormHandlers() {
        // Навигация
        document.querySelectorAll('.next-step').forEach(btn => {
            btn.addEventListener('click', () => {
                if (state.currentStep === state.totalSteps) {
                    saveProfile();
                } else {
                    nextStep();
                }
            });
        });

        document.querySelectorAll('.prev-step').forEach(btn => {
            btn.addEventListener('click', prevStep);
        });

        // Интересы
        document.querySelectorAll('.tag').forEach(tag => {
            tag.addEventListener('click', toggleInterest);
        });

        // Цвета
        document.querySelectorAll('.color-option').forEach(color => {
            color.addEventListener('click', selectColor);
        });

        // Аватар
        const upload = document.getElementById('avatarUpload');
        if (upload) {
            upload.addEventListener('change', handleAvatar);
        }

        // Enter в полях ввода
        document.querySelectorAll('.input-field').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (state.currentStep === state.totalSteps) {
                        saveProfile();
                    } else {
                        nextStep();
                    }
                }
            });
        });
    }

    // Обработчики
    function toggleInterest(e) {
        const interest = e.target.dataset.interest;
        
        if (e.target.classList.contains('selected')) {
            e.target.classList.remove('selected');
            state.userData.interests = state.userData.interests.filter(i => i !== interest);
        } else if (state.userData.interests.length < config.maxInterests) {
            e.target.classList.add('selected');
            state.userData.interests.push(interest);
        } else {
            alert(`Можно выбрать не более ${config.maxInterests} интересов`);
        }
    }

    function selectColor(e) {
        document.querySelectorAll('.color-option').forEach(c => {
            c.style.transform = 'scale(1)';
            c.style.boxShadow = 'none';
        });
        
        e.target.style.transform = 'scale(1.1)';
        e.target.style.boxShadow = '0 0 15px rgba(0,0,0,0.2)';
        state.userData.moodColor = e.target.dataset.color;
    }

    function handleAvatar(e) {
        const file = e.target.files[0];
        if (file && file.type.match('image.*')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                state.userData.avatar = e.target.result;
                const preview = document.getElementById('avatarPreview');
                preview.style.backgroundImage = `url(${e.target.result})`;
            };
            reader.readAsDataURL(file);
        }
    }

    // Навигация
    function nextStep() {
        if (!validateStep()) return;
        saveStepData();
        goToStep(state.currentStep + 1);
    }

    function prevStep() {
        goToStep(state.currentStep - 1);
    }

    function goToStep(step) {
        if (step < 1 || step > state.totalSteps) return;
        
        document.querySelector('.form-step.active').classList.remove('active');
        state.currentStep = step;
        const nextStepEl = document.querySelector(`[data-step="${step}"]`);
        
        if (nextStepEl) {
            nextStepEl.classList.add('active');
            nextStepEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            focusCurrentField();
        }
    }

    // Валидация
    function validateStep() {
        switch(state.currentStep) {
            case 1:
                if (!document.getElementById('userName').value.trim()) {
                    alert('Введите ваше имя');
                    return false;
                }
                return true;
            case 2:
                const age = parseInt(document.getElementById('userAge').value);
                if (isNaN(age)) {
                    alert('Введите корректный возраст');
                    return false;
                
                }   
                
                return true;
            case 3:
                if (!document.getElementById('userCity').value.trim()) {
                    alert('Укажите ваш город');
                    return false;
                }
                return true;
            case 4:
                if (state.userData.interests.length === 0) {
                    alert('Выберите хотя бы один интерес');
                    return false;
                }
                return true;
            default:
                return true;
        }
    }

    // Сохранение данных
    function saveStepData() {
        switch(state.currentStep) {
            case 1:
                state.userData.name = document.getElementById('userName').value.trim();
                break;
            case 2:
                state.userData.age = document.getElementById('userAge').value;
                break;
            case 3:
                state.userData.city = document.getElementById('userCity').value.trim();
                break;
            case 6:
                state.userData.description = document.getElementById('userDescription').value.trim();
                break;
        }
    }

    // Фокус на поле
    function focusCurrentField() {
        const activeStep = document.querySelector('.form-step.active');
        const input = activeStep?.querySelector('input, textarea');
        input?.focus();
    }

    // Сохранение профиля
    function saveProfile() {
        if (!validateStep()) return;
        saveStepData();
        
        localStorage.setItem('datingProfile', JSON.stringify(state.userData));
        showProfile();
    }

    // Показ профиля
    function showProfile() {
        elements.registrationForm.classList.add('hidden');
        elements.mainScreen.innerHTML = `
        <div class="logo-container">
            <svg class="logo" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path class="logo-path" d="M20,50 Q35,20 50,50 T80,50" 
                      stroke="#10367D" 
                      stroke-width="8" 
                      fill="none" 
                      stroke-linecap="round"/>
            </svg>
        </div>
            <div class="profile-card">
                
                <div class="profile-avatar">
                    ${state.userData.avatar 
                        ? `<img src="${state.userData.avatar}" alt="Аватар">` 
                        : `<div class="avatar-placeholder">${getInitials(state.userData.name)}</div>`
                    }
                </div>
                
                <h2 class="profile-name">${state.userData.name}</h2>
                <div class="profile-age-city">
                    ${state.userData.age} лет, ${state.userData.city}
                </div>
                
                ${state.userData.description ? `
                    <div class="profile-description">
                        ${state.userData.description}
                    </div>
                ` : ''}
                
                <div class="profile-interests">
                    ${state.userData.interests.map(interest => `
                        <div class="interest-tag">
                            ${getInterestEmoji(interest)} ${getInterestName(interest)}
                        </div>
                    `).join('')}
                </div>
                
                <div class="profile-footer">
                    Профиль создан: ${new Date(state.userData.createdAt).toLocaleDateString()}
                </div>
                
                <div class="profile-actions">
                    <button class="btn" id="editProfileBtn">Редактировать</button>
                    <button class="btn" id="newProfileBtn">Новый профиль</button>
                </div>
            </div>
        `;
        
        elements.mainScreen.classList.remove('hidden');
        elements.mainScreen.style.opacity = '1';
        
        // Назначение событий профиля
        document.getElementById('editProfileBtn').addEventListener('click', () => {
            startRegistration();
        });
        
        document.getElementById('newProfileBtn').addEventListener('click', () => {
            localStorage.removeItem('datingProfile');
            location.reload();
        });
        
        initLogo();
    }

    // Вспомогательные функции
    function getInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    function getInterestEmoji(interest) {
        const emojis = {
            music: '🎵', sports: '⚽', books: '📚',
            travel: '✈️', art: '🎨', games: '🎮'
        };
        return emojis[interest] || '❤️';
    }

    function getInterestName(interest) {
        const names = {
            music: 'Музыка', sports: 'Спорт', books: 'Книги',
            travel: 'Путешествия', art: 'Искусство', games: 'Игры'
        };
        return names[interest] || interest;
    }

    // Запуск
    init();
});
