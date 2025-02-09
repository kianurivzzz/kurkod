class QRCustomizer {
    constructor() {
        this.customizeBtn = document.getElementById('customize-btn');
        this.customizePanel = document.getElementById('customize-panel');
        this.closeBtn = this.customizePanel.querySelector('.close-btn');
        this.applyBtn = document.getElementById('apply-custom');
        this.resetBtn = document.getElementById('reset-custom');
        this.logoRadios = document.querySelectorAll('input[name="logo"]');
        this.logoUpload = document.getElementById('logo-upload');
        this.uploadBtn = document.getElementById('upload-btn');
        this.dotsColorPicker = document.getElementById('dots-color');
        this.bgColorPicker = document.getElementById('bg-color');

        // Сохраняем начальные настройки для возможности сброса
        this.defaultSettings = {
            logo: 'default',
            dotsColor: '#000000',
            bgColor: '#FFFFFF',
            customLogo: null
        };

        // Текущие настройки
        this.settings = { ...this.defaultSettings };

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Кнопки панели
        this.customizeBtn.addEventListener('click', () => this.togglePanel());
        this.closeBtn.addEventListener('click', () => this.hidePanel());
        
        // Кнопки применения и сброса
        this.applyBtn.addEventListener('click', () => {
            this.applyChanges();
            this.hidePanel();
        });
        
        this.resetBtn.addEventListener('click', () => {
            this.resetChanges();
            this.hidePanel();
        });

        // Обработчики логотипа
        this.logoRadios.forEach(radio => {
            radio.addEventListener('change', () => this.handleLogoChange(radio));
        });

        this.logoUpload.addEventListener('change', (e) => this.handleFileUpload(e));
        this.uploadBtn.addEventListener('click', () => this.logoUpload.click());

        // Обработчики цвета с предпросмотром
        this.dotsColorPicker.addEventListener('input', (e) => {
            this.settings.dotsColor = e.target.value;
            this.regenerateQRCode();
        });

        this.bgColorPicker.addEventListener('input', (e) => {
            this.settings.bgColor = e.target.value;
            this.regenerateQRCode();
        });
    }

    togglePanel() {
        if (this.customizePanel.classList.contains('hidden')) {
            this.showPanel();
        } else {
            this.hidePanel();
        }
    }

    showPanel() {
        // Обновляем значения в пикерах при открытии панели
        this.dotsColorPicker.value = this.settings.dotsColor;
        this.bgColorPicker.value = this.settings.bgColor;
        
        // Восстанавливаем выбор логотипа
        const logoRadio = Array.from(this.logoRadios)
            .find(radio => radio.value === this.settings.logo);
        if (logoRadio) {
            logoRadio.checked = true;
        }
        
        this.uploadBtn.classList.toggle('hidden', this.settings.logo !== 'custom');
        this.customizePanel.classList.remove('hidden');
    }

    hidePanel() {
        this.customizePanel.classList.add('hidden');
    }

    handleLogoChange(radio) {
        const isCustom = radio.value === 'custom';
        this.uploadBtn.classList.toggle('hidden', !isCustom);
        this.settings.logo = radio.value;
        
        // Если выбран дефолтный логотип, сбрасываем кастомный
        if (!isCustom) {
            this.settings.customLogo = null;
        }
        
        this.regenerateQRCode();
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.settings.customLogo = e.target.result;
                // Автоматически выбираем "custom" при загрузке файла
                const customRadio = Array.from(this.logoRadios)
                    .find(radio => radio.value === 'custom');
                if (customRadio) {
                    customRadio.checked = true;
                    this.settings.logo = 'custom';
                }
                this.uploadBtn.classList.remove('hidden');
                this.regenerateQRCode();
            };
            reader.readAsDataURL(file);
        }
    }

    regenerateQRCode() {
        const qrText = document.getElementById('qr-text');
        const text = qrText.value.trim();
        if (text) {
            window.generateQRCode(text);
        }
    }

    applyChanges() {
        // Сохраняем текущие настройки
        this.saveSettings();
        // Перегенерируем QR-код с текущими настройками
        const qrText = document.getElementById('qr-text').value.trim();
        if (qrText) {
            window.generateQRCode(qrText);
        }
    }

    resetChanges() {
        // Восстанавливаем настройки по умолчанию
        this.settings = { ...this.defaultSettings };
        
        // Сбрасываем UI
        this.dotsColorPicker.value = this.settings.dotsColor;
        this.bgColorPicker.value = this.settings.bgColor;
        
        const defaultRadio = Array.from(this.logoRadios)
            .find(radio => radio.value === 'default');
        if (defaultRadio) {
            defaultRadio.checked = true;
        }
        
        this.uploadBtn.classList.add('hidden');
        this.logoUpload.value = '';
        
        // Перегенерируем QR-код
        const text = document.getElementById('qr-text').value.trim();
        if (text) {
            window.generateQRCode(text);
        }
    }

    getCurrentSettings() {
        return { ...this.settings };
    }

    saveSettings() {
        // Add your logic to save settings here
    }
}

// Initialize the customizer when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.qrCustomizer = new QRCustomizer();
});
