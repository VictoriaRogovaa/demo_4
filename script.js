document.addEventListener('DOMContentLoaded', function() {
    // Основные цвета
    const colorPalette = [
        '#10367D', // Основной синий
        '#2D4D9E', 
        '#4A64BF',
        '#677BDF',
        '#FF6B6B', // Красный
        '#FF8E8E',
        '#4ECDC4', // Бирюзовый
        '#7EDFD8',
        '#A05195', // Фиолетовый
        '#C27BB3',
        '#FDCB6E', // Жёлтый
        '#FFEAA7'
    ];

    // Элементы
    const mainScreen = document.getElementById('mainScreen');
    const startBtn = document.getElementById('startBtn');
    const registrationForm = document.getElementById('registrationForm');
    
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
        interests: [],
        moodColor: '#10367D',
        avatar: null,
        createdAt: new Date().toISOString()
    };

    let currentStep = 1;
    const totalSteps = 6;

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
                // Фокус на первое поле
                const firstInput = document.getElementById('userName');
                if (firstInput) firstInput.focus();
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
                <h2>Ваше фото</h2>
                <p>Добавьте фото для профиля (необязательно)</p>
                <div class="avatar-upload">
                    <label class="btn">
                        📸 Выбрать фото
                        <input type="file" id="avatarUpload" accept="image/*" hidden>
                    </label>
                    <div class="avatar-preview hidden" id="avatarPreview"></div>
                </div>
                <div class="navigation">
                    <button class="btn prev-step">Назад</button>
                    <button class="btn" id="completeBtn">Сохранить профиль</button>
                </div>
            </div>
        `;

        initFormHandlers();
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
                    c.classList.remove('selected');
                });
                this.classList.add('selected');
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
                    preview.classList.remove('hidden');
                };
                reader.readAsDataURL(file);
            }
        });

        // Сохранение
        document.getElementById('completeBtn')?.addEventListener('click', completeRegistration);

        // Обработка нажатия Enter
        document.querySelectorAll('.input-field').forEach(input => {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    goToNextStep();
                }
            });
        });
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
            
            // Фокус на следующее поле
            setTimeout(() => {
                const nextInput = nextStep.querySelector('input');
                if (nextInput) nextInput.focus();
            }, 300);
        }
    }

    function goToPrevStep() {
        document.querySelector(`[data-step="${currentStep}"]`).classList.remove('active');
        currentStep--;
        const prevStep = document.querySelector(`[data-step="${currentStep}"]`);
        if (prevStep) {
            prevStep.classList.add('active');
            prevStep.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
            case 5:
                if (!userData.moodColor) {
                    alert('Пожалуйста, выберите цвет');
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
                <div class="avatar-preview ${profileData.avatar ? 'has-image' : ''}" 
                     style="background-image: url(${profileData.avatar || ''});"></div>
                <h2 class="profile-name">${profileData.name}</h2>
                <p class="profile-age">${profileData.age} лет</p>
                <div class="profile-city">${profileData.city}</div>
                
                <div class="profile-interests">
                    ${profileData.interests.map(interest => `
                        <div class="interest-tag">${getInterestEmoji(interest)} ${getInterestName(interest)}</div>
                    `).join('')}
                </div>
                
                <div class="profile-footer">
                    Профиль создан: ${new Date(profileData.createdAt).toLocaleDateString()}
                </div>
            </div>
            
            <div class="navigation">
                <button class="btn" id="editProfileBtn">Редактировать</button>
                <button class="btn" id="newProfileBtn">Новый профиль</button>
            </div>
        `;
        
        mainScreen.innerHTML = profileHTML;
        mainScreen.classList.remove('hidden');
        mainScreen.style.opacity = 1;

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

    // Вспомогательные функции
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