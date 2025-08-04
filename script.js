class DatingApp {
    constructor() {
        this.config = {
            colors: ['#10367D', '#2D4D9E', '#4A64BF', '#677BDF', '#FF6B6B', '#FF8E8E', '#4ECDC4', '#7EDFD8', '#A05195', '#C27BB3', '#FDCB6E', '#FFEAA7'],
            maxInterests: 3,
            minAge: 18,
            maxAge: 100,
            interests: [
                { id: 'music', name: 'Музыка', emoji: '🎵' },
                { id: 'sports', name: 'Спорт', emoji: '⚽' },
                { id: 'books', name: 'Книги', emoji: '📚' },
                { id: 'travel', name: 'Путешествия', emoji: '✈️' },
                { id: 'art', name: 'Искусство', emoji: '🎨' },
                { id: 'games', name: 'Игры', emoji: '🎮' }
            ]
        };

        this.state = {
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

        this.initElements();
        this.bindEvents();
        this.checkSavedProfile();
        this.initLogoAnimation();
    }

    initElements() {
        this.elements = {
            mainScreen: document.getElementById('mainScreen'),
            registrationForm: document.getElementById('registrationForm'),
            startBtn: document.getElementById('startBtn')
        };
    }

    bindEvents() {
        this.elements.startBtn.addEventListener('click', () => this.startRegistration());
    }

    initLogoAnimation() {
        const logoPaths = document.querySelectorAll('.logo-path');
        logoPaths.forEach(path => {
            path.style.strokeDasharray = '150';
            path.style.strokeDashoffset = '150';
            setTimeout(() => {
                path.style.animation = 'drawLogo 1.5s ease-out forwards';
            }, 300);
        });
    }

    checkSavedProfile() {
        const savedProfile = localStorage.getItem('datingProfile');
        if (savedProfile) {
            this.state.userData = JSON.parse(savedProfile);
            this.showProfile();
        }
    }

    startRegistration() {
        this.switchScreen('registration');
        this.renderForm();
    }

    switchScreen(screenName) {
        if (screenName === 'main') {
            this.elements.registrationForm.classList.remove('active');
            this.elements.mainScreen.classList.add('active');
        } else {
            this.elements.mainScreen.classList.remove('active');
            this.elements.registrationForm.classList.add('active');
        }
    }

    renderForm() {
        this.elements.registrationForm.innerHTML = `
            <div class="form-container">
                ${this.generateSteps()}
            </div>
        `;
        this.setupFormHandlers();
        this.focusCurrentField();
    }

    generateSteps() {
        return Array.from({ length: this.state.totalSteps }, (_, i) => i + 1)
            .map(step => `
                <div class="form-step ${step === this.state.currentStep ? 'active' : ''}" data-step="${step}">
                    ${this.getStepContent(step)}
                    ${this.getStepButtons(step)}
                </div>
            `).join('');
    }

    getStepContent(step) {
        const steps = {
            1: `
                <h2 class="section-title">Как вас зовут?</h2>
                <input type="text" class="input-field" id="userName" placeholder="Ваше имя" required>
            `,
            2: `
                <h2 class="section-title">Сколько вам лет?</h2>
                <input type="number" class="input-field" id="userAge" 
                       min="${this.config.minAge}" max="${this.config.maxAge}" 
                       placeholder="Ваш возраст" required>
            `,
            3: `
                <h2 class="section-title">Ваш город</h2>
                <input type="text" class="input-field" id="userCity" placeholder="Где вы живете?" required>
            `,
            4: `
                <h2 class="section-title">Что вам нравится?</h2>
                <p class="section-description">Выберите 1-3 варианта</p>
                <div class="tags-container">
                    ${this.config.interests.map(interest => `
                        <div class="tag" data-interest="${interest.id}">
                            ${interest.emoji} ${interest.name}
                        </div>
                    `).join('')}
                </div>
            `,
            5: `
                <h2 class="section-title">Ваш любимый цвет</h2>
                <div class="colors-container">
                    ${this.config.colors.map(color => `
                        <div class="color-option" style="background: ${color}" data-color="${color}"></div>
                    `).join('')}
                </div>
            `,
            6: `
                <h2 class="section-title">О себе</h2>
                <p class="section-description">Расскажите что-то о себе (необязательно)</p>
                <textarea class="input-field" id="userDescription" 
                          placeholder="Я люблю путешествия, книги и..." rows="4"></textarea>
            `,
            7: `
                <h2 class="section-title">Ваше фото</h2>
                <p class="section-description">Добавьте фото для профиля (необязательно)</p>
                <div class="avatar-upload">
                    <label class="btn">
                        📸 Выбрать фото
                        <input type="file" id="avatarUpload" accept="image/*" hidden>
                    </label>
                    <div class="avatar-preview" id="avatarPreview"></div>
                </div>
            `
        };
        return steps[step] || '';
    }

    getStepButtons(step) {
        return `
            <div class="navigation">
                ${step > 1 ? `<button class="btn btn-secondary prev-step">Назад</button>` : ''}
                <button class="btn next-step" ${step === this.state.totalSteps ? 'id="saveProfileBtn"' : ''}>
                    ${step === this.state.totalSteps ? 'Сохранить профиль' : 'Далее'}
                </button>
            </div>
        `;
    }

    setupFormHandlers() {
        // Навигация
        document.querySelectorAll('.next-step').forEach(btn => {
            btn.addEventListener('click', () => this.handleNextStep());
        });

        document.querySelectorAll('.prev-step').forEach(btn => {
            btn.addEventListener('click', () => this.prevStep());
        });

        // Интересы
        document.querySelectorAll('.tag').forEach(tag => {
            tag.addEventListener('click', (e) => this.toggleInterest(e));
        });

        // Цвета
        document.querySelectorAll('.color-option').forEach(color => {
            color.addEventListener('click', (e) => this.selectColor(e));
        });

        // Аватар
        const upload = document.getElementById('avatarUpload');
        if (upload) {
            upload.addEventListener('change', (e) => this.handleAvatar(e));
        }

        // Enter в полях ввода
        document.querySelectorAll('.input-field').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleNextStep();
                }
            });
        });
    }

    toggleInterest(e) {
        const interest = e.currentTarget.dataset.interest;
        const isSelected = e.currentTarget.classList.contains('selected');
        
        if (isSelected) {
            e.currentTarget.classList.remove('selected');
            this.state.userData.interests = this.state.userData.interests.filter(i => i !== interest);
        } else if (this.state.userData.interests.length < this.config.maxInterests) {
            e.currentTarget.classList.add('selected');
            this.state.userData.interests.push(interest);
        } else {
            alert(`Можно выбрать не более ${this.config.maxInterests} интересов`);
        }
    }

    selectColor(e) {
        document.querySelectorAll('.color-option').forEach(c => {
            c.classList.remove('selected');
        });
        
        e.currentTarget.classList.add('selected');
        this.state.userData.moodColor = e.currentTarget.dataset.color;
    }

    handleAvatar(e) {
        const file = e.target.files[0];
        if (file && file.type.match('image.*')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.state.userData.avatar = e.target.result;
                const preview = document.getElementById('avatarPreview');
                preview.style.backgroundImage = `url(${e.target.result})`;
            };
            reader.readAsDataURL(file);
        }
    }

    handleNextStep() {
        if (this.state.currentStep === this.state.totalSteps) {
            this.saveProfile();
        } else {
            this.nextStep();
        }
    }

    nextStep() {
        if (!this.validateStep()) return;
        this.saveStepData();
        this.goToStep(this.state.currentStep + 1);
    }

    prevStep() {
        this.goToStep(this.state.currentStep - 1);
    }

    goToStep(step) {
        if (step < 1 || step > this.state.totalSteps) return;
        
        document.querySelector('.form-step.active').classList.remove('active');
        this.state.currentStep = step;
        const nextStepEl = document.querySelector(`[data-step="${step}"]`);
        
        if (nextStepEl) {
            nextStepEl.classList.add('active');
            nextStepEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            this.focusCurrentField();
        }
    }

    validateStep() {
        switch(this.state.currentStep) {
            case 1:
                if (!document.getElementById('userName').value.trim()) {
                    alert('Введите ваше имя');
                    return false;
                }
                return true;
            case 2:
                const age = parseInt(document.getElementById('userAge').value);
                if (isNaN(age) || age < this.config.minAge || age > this.config.maxAge) {
                    alert(`Введите корректный возраст (${this.config.minAge}-${this.config.maxAge} лет)`);
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
                if (this.state.userData.interests.length === 0) {
                    alert('Выберите хотя бы один интерес');
                    return false;
                }
                return true;
            default:
                return true;
        }
    }

    saveStepData() {
        switch(this.state.currentStep) {
            case 1:
                this.state.userData.name = document.getElementById('userName').value.trim();
                break;
            case 2:
                this.state.userData.age = document.getElementById('userAge').value;
                break;
            case 3:
                this.state.userData.city = document.getElementById('userCity').value.trim();
                break;
            case 6:
                this.state.userData.description = document.getElementById('userDescription').value.trim();
                break;
        }
    }

    focusCurrentField() {
        const activeStep = document.querySelector('.form-step.active');
        const input = activeStep?.querySelector('input, textarea');
        input?.focus();
    }

    saveProfile() {
        if (!this.validateStep()) return;
        this.saveStepData();
        
        localStorage.setItem('datingProfile', JSON.stringify(this.state.userData));
        this.showProfile();
    }

    showProfile() {
        const interestElements = this.state.userData.interests.map(interestId => {
            const interest = this.config.interests.find(i => i.id === interestId) || 
                           { id: interestId, name: interestId, emoji: '❤️' };
            return `
                <div class="interest-tag">
                    ${interest.emoji} ${interest.name}
                </div>
            `;
        }).join('');

        this.elements.mainScreen.innerHTML = `
            <div class="logo-container">
                <svg class="logo" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <path class="logo-path" d="M20,50 Q35,20 50,50 T80,50" 
                          stroke="#D7303B" 
                          stroke-width="8" 
                          fill="none"
                          stroke-linecap="round"/>
                </svg>
            </div>
            <div class="profile-card">
                <div class="profile-avatar">
                    ${this.state.userData.avatar ? 
                        `<img src="${this.state.userData.avatar}" alt="Аватар">` : 
                        `<div class="avatar-placeholder">${this.getInitials(this.state.userData.name)}</div>`
                    }
                </div>
                
                <h2 class="profile-name">${this.state.userData.name}</h2>
                <div class="profile-age-city">
                    ${this.state.userData.age} лет, ${this.state.userData.city}
                </div>
                
                ${this.state.userData.description ? `
                    <div class="profile-description">
                        ${this.state.userData.description}
                    </div>
                ` : ''}
                
                <div class="profile-interests">
                    ${interestElements}
                </div>
                
                <div class="profile-footer">
                    Профиль создан: ${new Date(this.state.userData.createdAt).toLocaleDateString()}
                </div>
                
                <div class="profile-actions">
                    <button class="btn" id="editProfileBtn">Редактировать</button>
                    <button class="btn btn-secondary" id="newProfileBtn">Новый профиль</button>
                </div>
            </div>
        `;
        
        this.switchScreen('main');
        this.initLogoAnimation();
        
        document.getElementById('editProfileBtn').addEventListener('click', () => {
            this.state.currentStep = 1;
            this.startRegistration();
        });
        
        document.getElementById('newProfileBtn').addEventListener('click', () => {
            if (confirm('Вы уверены, что хотите создать новый профиль? Текущие данные будут удалены.')) {
                localStorage.removeItem('datingProfile');
                location.reload();
            }
        });
    }

    getInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    new DatingApp();
});
