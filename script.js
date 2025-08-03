document.addEventListener('DOMContentLoaded', function() {
    // Основные цвета
    const colorPalette = [
        '#10367D', '#2D4D9E', '#4A64BF', '#677BDF',
        '#FF6B6B', '#FF8E8E', '#4ECDC4', '#7EDFD8',
        '#A05195', '#C27BB3', '#FDCB6E', '#FFEAA7'
    ];

    // Тестовые данные для совместимости (в реальном приложении будут загружаться с сервера)
    const testMatches = [
        { name: "Анна", age: 25, city: "Москва", interests: ["music", "travel"], color: "#FF6B6B", avatar: null, compatibility: 92 },
        { name: "Максим", age: 28, city: "Санкт-Петербург", interests: ["sports", "games"], color: "#4ECDC4", avatar: null, compatibility: 78 },
        { name: "Елена", age: 23, city: "Москва", interests: ["art", "books"], color: "#A05195", avatar: null, compatibility: 85 }
    ];

    // Элементы
    const mainScreen = document.getElementById('mainScreen');
    const startBtn = document.getElementById('startBtn');
    const registrationForm = document.getElementById('registrationForm');
    const logo = document.querySelector('.logo-path');
    
    // Инициализация анимации логотипа
    function initLogoAnimation() {
        logo.style.strokeDasharray = '150';
        logo.style.strokeDashoffset = '150';
        setTimeout(() => {
            logo.style.animation = 'drawLogo 2s ease-out forwards';
        }, 500);
    }
    initLogoAnimation();

    // Проверяем сохранённый профиль
    const savedProfile = localStorage.getItem('datingProfile');
    if (savedProfile) {
        showProfile(JSON.parse(savedProfile));
        return;
    }

    // Данные пользователя
    const userData = {
        name: '',
        age: '',
        city: '',
        description: '',
        interests: [],
        moodColor: '#10367D',
        avatar: null,
        createdAt: new Date().toISOString()
    };

    let currentStep = 1;
    const totalSteps = 7;

    // Инициализация
    startBtn.addEventListener('click', startRegistration);

    function startRegistration() {
        mainScreen.style.opacity = 0;
        setTimeout(() => {
            mainScreen.classList.add('hidden');
            registrationForm.classList.remove('hidden');
            loadRegistrationForm();
            setTimeout(() => {
                registrationForm.style.opacity = 1;
                focusOnCurrentField();
            }, 50);
        }, 500);
    }

    function loadRegistrationForm() {
        registrationForm.innerHTML = `
            <div class="form-step active" data-step="1">
                <h2>Как вас зовут?</h2>
                <input type="text" class="input-field" id="userName" placeholder="Ваше имя" required>
                <div class="navigation">
                    <button class="btn next-step">Далее</button>
                </div>
            </div>

            <div class="form-step" data-step="2">
                <h2>Сколько вам лет?</h2>
                <input type="number" class="input-field" id="userAge" min="18" max="100" placeholder="Ваш возраст" required>
                <div class="navigation">
                    <button class="btn prev-step">Назад</button>
                    <button class="btn next-step">Далее</button>
                </div>
            </div>

            <div class="form-step" data-step="3">
                <h2>Ваш город</h2>
                <input type="text" class="input-field" id="userCity" placeholder="Где вы живете?" required>
                <div class="navigation">
                    <button class="btn prev-step">Назад</button>
                    <button class="btn next-step">Далее</button>
                </div>
            </div>

            <div class="form-step" data-step="4">
                <h2>Что вам нравится?</h2>
                <p>Выберите 1-3 варианта</p>
                <div class="tags-container">
                    <div class="tag" data-interest="music">🎵 Музыка</div>
                    <div class="tag" data-interest="sports">⚽ Спорт</div>
                    <div class="tag" data-interest="books">📚 Книги</div>
                    <div class="tag" data-interest="travel">✈️ Путешествия</div>
                    <div class="tag" data-interest="art">🎨 Искусство</div>
                    <div class="tag" data-interest="games">🎮 Игры</div>
                </div>
                <div class="navigation">
                    <button class="btn prev-step">Назад</button>
                    <button class="btn next-step">Далее</button>
                </div>
            </div>

            <div class="form-step" data-step="5">
                <h2>Ваш любимый цвет</h2>
                <div class="colors-container">
                    ${colorPalette.map(color => `
                        <div class="color-option" style="background: ${color}" data-color="${color}"></div>
                    `).join('')}
                </div>
                <div class="navigation">
                    <button class="btn prev-step">Назад</button>
                    <button class="btn next-step">Далее</button>
                </div>
            </div>

            <div class="form-step" data-step="6">
                <h2>О себе</h2>
                <p>Расскажите что-то о себе (необязательно)</p>
                <textarea class="input-field" id="userDescription" placeholder="Я люблю путешествия, книги и..." rows="4"></textarea>
                <div class="navigation">
                    <button class="btn prev-step">Назад</button>
                    <button class="btn next-step">Далее</button>
                </div>
            </div>

            <div class="form-step" data-step="7">
                <h2>Ваше фото</h2>
                <p>Добавьте фото для профиля (необязательно)</p>
                <div class="avatar-upload">
                    <label class="btn">
                        📸 Выбрать фото
                        <input type="file" id="avatarUpload" accept="image/*" hidden>
                    </label>
                    <div class="avatar-preview" id="avatarPreview"></div>
                </div>
                <div class="navigation">
                    <button class="btn prev-step">Назад</button>
                    <button class="btn" id="completeBtn">Сохранить профиль</button>
                </div>
            </div>
        `;

        initFormHandlers();
        focusOnCurrentField();
    }

    function initFormHandlers() {
        // Навигация
        document.querySelectorAll('.next-step').forEach(btn => {
            btn.addEventListener('click', goToNextStep);
        });

        document.querySelectorAll('.prev-step').forEach(btn => {
            btn.addEventListener('click', goToPrevStep);
        });

        // Интересы
        document.querySelectorAll('.tag').forEach(tag => {
            tag.addEventListener('click', function() {
                const interest = this.dataset.interest;
                if (this.classList.contains('selected')) {
                    this.classList.remove('selected');
                    userData.interests = userData.interests.filter(i => i !== interest);
                } else {
                    if (userData.interests.length < 3) {
                        this.classList.add('selected');
                        userData.interests.push(interest);
                    } else {
                        alert('Можно выбрать не более 3 интересов');
                    }
                }
            });
        });

        // Цвета
        document.querySelectorAll('.color-option').forEach(color => {
            color.addEventListener('click', function() {
                document.querySelectorAll('.color-option').forEach(c => {
                    c.style.transform = 'scale(1)';
                    c.style.boxShadow = 'none';
                });
                this.style.transform = 'scale(1.1)';
                this.style.boxShadow = '0 0 15px rgba(0,0,0,0.2)';
                userData.moodColor = this.dataset.color;
            });
        });

        // Аватар
        document.getElementById('avatarUpload')?.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file && file.type.match('image.*')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    userData.avatar = e.target.result;
                    const preview = document.getElementById('avatarPreview');
                    preview.style.backgroundImage = `url(${e.target.result})`;
                    preview.classList.add('has-image');
                };
                reader.readAsDataURL(file);
            }
        });

        // Сохранение
        document.getElementById('completeBtn')?.addEventListener('click', completeRegistration);

        // Обработка Enter в полях ввода
        document.querySelectorAll('.input-field').forEach(input => {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    goToNextStep();
                }
            });
        });
    }

    function focusOnCurrentField() {
        const activeStep = document.querySelector('.form-step.active');
        if (!activeStep) return;
        
        const input = activeStep.querySelector('input, textarea');
        if (input) {
            setTimeout(() => {
                input.focus();
            }, 300);
        }
    }

    function goToNextStep() {
        if (!validateStep(currentStep)) return;
        saveStepData(currentStep);

        document.querySelector(`[data-step="${currentStep}"]`).classList.remove('active');
        currentStep++;
        const nextStep = document.querySelector(`[data-step="${currentStep}"]`);
        if (nextStep) {
            nextStep.classList.add('active');
            nextStep.scrollIntoView({ behavior: 'smooth', block: 'start' });
            focusOnCurrentField();
        }
    }

    function goToPrevStep() {
        document.querySelector(`[data-step="${currentStep}"]`).classList.remove('active');
        currentStep--;
        const prevStep = document.querySelector(`[data-step="${currentStep}"]`);
        if (prevStep) {
            prevStep.classList.add('active');
            prevStep.scrollIntoView({ behavior: 'smooth', block: 'start' });
            focusOnCurrentField();
        }
    }

    function validateStep(step) {
        switch(step) {
            case 1:
                if (!document.getElementById('userName')?.value.trim()) {
                    alert('Пожалуйста, введите ваше имя');
                    return false;
                }
                return true;
            case 2:
                const age = parseInt(document.getElementById('userAge')?.value);
                if (isNaN(age) || age < 18 || age > 100) {
                    alert('Пожалуйста, введите корректный возраст (от 18 до 100)');
                    return false;
                }
                return true;
            case 3:
                if (!document.getElementById('userCity')?.value.trim()) {
                    alert('Пожалуйста, укажите ваш город');
                    return false;
                }
                return true;
            case 4:
                if (userData.interests.length === 0) {
                    alert('Пожалуйста, выберите хотя бы один интерес');
                    return false;
                }
                return true;
            default:
                return true;
        }
    }

    function saveStepData(step) {
        switch(step) {
            case 1:
                userData.name = document.getElementById('userName')?.value.trim() || '';
                break;
            case 2:
                userData.age = document.getElementById('userAge')?.value || '';
                break;
            case 3:
                userData.city = document.getElementById('userCity')?.value.trim() || '';
                break;
            case 6:
                userData.description = document.getElementById('userDescription')?.value.trim() || '';
                break;
        }
    }

    function completeRegistration() {
        if (!validateStep(currentStep)) return;
        saveStepData(currentStep);

        // Сохраняем профиль
        localStorage.setItem('datingProfile', JSON.stringify(userData));
        showProfile(userData);
    }

    function showProfile(profileData) {
        registrationForm.classList.add('hidden');
        
        const profileHTML = `
            <div class="profile-card">
                <div class="profile-avatar">
                    ${profileData.avatar ? 
                        `<img src="${profileData.avatar}" alt="Аватар">` : 
                        `<div class="avatar-placeholder">${getInitials(profileData.name)}</div>`
                    }
                </div>
                
                <h2 class="profile-name">${profileData.name}</h2>
                <div class="profile-meta">
                    ${profileData.age} лет, ${profileData.city}
                </div>
                
                <!-- Блок совместимости -->
                <div class="compatibility-section">
                    <div class="compatibility-badge" style="background: ${profileData.moodColor}">
                        Ваша совместимость: ${calculateCompatibility(profileData)}%
                    </div>
                    <div class="compatibility-cards">
                        ${generateMatchCards(profileData)}
                    </div>
                </div>
                
                ${profileData.description ? `
                    <div class="profile-description">
                        ${profileData.description}
                    </div>
                ` : ''}
                
                <div class="profile-interests">
                    ${profileData.interests.map(interest => `
                        <div class="interest-tag">${getInterestEmoji(interest)} ${getInterestName(interest)}</div>
                    `).join('')}
                </div>
                
                <div class="profile-footer">
                    Профиль создан: ${new Date(profileData.createdAt).toLocaleDateString()}
                </div>
                
                <div class="profile-actions">
                    <button class="btn" id="editProfileBtn">Редактировать</button>
                    <button class="btn" id="newProfileBtn">Новый профиль</button>
                </div>
            </div>
        `;
        
        mainScreen.innerHTML = profileHTML;
        mainScreen.classList.remove('hidden');
        mainScreen.style.opacity = 1;

        // Восстанавливаем логотип
        const logoContainer = document.createElement('div');
        logoContainer.className = 'logo-container';
        logoContainer.innerHTML = `
            <svg class="logo" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path class="logo-path" d="M20,50 Q35,20 50,50 T80,50" 
                      stroke="#10367D" 
                      stroke-width="8" 
                      fill="none" 
                      stroke-linecap="round"/>
            </svg>
        `;
        mainScreen.insertBefore(logoContainer, mainScreen.firstChild);
        initLogoAnimation();

        // Кнопка редактирования
        document.getElementById('editProfileBtn').addEventListener('click', () => {
            Object.assign(userData, profileData);
            startRegistration();
        });

        // Кнопка нового профиля
        document.getElementById('newProfileBtn').addEventListener('click', () => {
            localStorage.removeItem('datingProfile');
            location.reload();
        });
    }

    // Алгоритм совместимости
    function calculateCompatibility(user) {
        // В реальном приложении здесь будет сложный алгоритм
        // Пока используем простую случайную величину с базой от цвета и города
        let base = 70;
        if (user.city === "Москва") base += 10;
        if (user.moodColor === "#FF6B6B") base += 5;
        return Math.min(100, base + Math.floor(Math.random() * 20));
    }

    // Генерация карточек совместимости
    function generateMatchCards(user) {
        return testMatches.map(match => `
            <div class="match-card" style="border-color: ${match.color}">
                <div class="match-avatar">
                    ${match.avatar ? 
                        `<img src="${match.avatar}" alt="${match.name}">` : 
                        `<div style="background: ${match.color}; width: 100%; height: 100%; border-radius: 50%;"></div>`
                    }
                </div>
                <div class="match-name">${match.name}</div>
                <div class="match-percent">${match.compatibility}%</div>
            </div>
        `).join('');
    }

    // Вспомогательные функции
    function getInitials(name) {
        return name.split(' ').map(part => part[0]).join('').toUpperCase();
    }

    function getInterestEmoji(interest) {
        const emojis = {
            music: '🎵',
            sports: '⚽',
            books: '📚',
            travel: '✈️',
            art: '🎨',
            games: '🎮'
        };
        return emojis[interest] || '❤️';
    }

    function getInterestName(interest) {
        const names = {
            music: 'Музыка',
            sports: 'Спорт',
            books: 'Книги',
            travel: 'Путешествия',
            art: 'Искусство',
            games: 'Игры'
        };
        return names[interest] || interest;
    }
});
