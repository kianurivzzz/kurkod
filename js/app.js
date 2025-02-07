document.addEventListener('DOMContentLoaded', () => {
	// Ждем загрузки translations
	if (typeof window.translations === 'undefined') {
		console.error('Translations not loaded!');
		return;
	}

	const qrText = document.getElementById('qr-text');
	const generateBtn = document.getElementById('generate-btn');
	const downloadBtn = document.getElementById('download-btn');
	const qrContainer = document.getElementById('qr-code');
	const qrContainerWrapper = document.querySelector('.qr-container');
	const langButtons = document.querySelectorAll('.lang-btn');

	let qr = null;
	let currentLang = localStorage.getItem('language') || 'ru';
	const translations = window.translations;

	// Функция для перевода интерфейса
	function translateUI(lang) {
		console.log('Translating to:', lang);
		console.log('Available translations:', translations);

		document.documentElement.lang = lang;
		const elements = document.querySelectorAll('[data-translate]');
		console.log('Found elements to translate:', elements.length);

		elements.forEach(element => {
			const key = element.getAttribute('data-translate');
			console.log('Translating element:', element, 'with key:', key);

			let translation;
			if (key.includes('.')) {
				translation = key
					.split('.')
					.reduce((obj, k) => obj && obj[k], translations[lang]);
			} else {
				translation = translations[lang][key];
			}

			console.log('Found translation:', translation);

			if (!translation) {
				console.warn(
					`Translation not found for key: ${key} in language: ${lang}`
				);
				return;
			}

			if (element.tagName === 'INPUT') {
				element.placeholder = translation;
			} else {
				element.textContent = translation;
			}
		});

		// Обновляем title
		document.title = translations[lang].title;
	}

	// Инициализация языка
	translateUI(currentLang);
	document
		.querySelector(`[data-lang="${currentLang}"]`)
		.classList.add('active');

	// Обработчики переключения языка
	langButtons.forEach(btn => {
		btn.addEventListener('click', () => {
			const lang = btn.getAttribute('data-lang');
			console.log('Language button clicked:', lang);
			if (lang === currentLang) return;

			// Обновляем активную кнопку
			langButtons.forEach(b => b.classList.remove('active'));
			btn.classList.add('active');

			// Обновляем язык
			currentLang = lang;
			localStorage.setItem('language', lang);
			translateUI(lang);
		});
	});

	function createQRCodeWithLogo(text, callback) {
		// Активируем контейнер
		qrContainerWrapper.classList.add('active');

		// Загружаем логотип
		const logo = new Image();
		logo.onload = function () {
			// Создаем QR-код с большей коррекцией ошибок
			qr = qrcode(0, 'H'); // H - highest error correction level (30%)
			qr.addData(text);
			qr.make();

			// Создаем временный canvas для объединения QR-кода и логотипа
			const canvas = document.createElement('canvas');
			const qrSize = qr.getModuleCount();
			const scale = 10; // Размер каждого модуля QR-кода
			canvas.width = qrSize * scale;
			canvas.height = qrSize * scale;

			const ctx = canvas.getContext('2d');

			// Рисуем белый фон
			ctx.fillStyle = '#FFFFFF';
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			// Рисуем QR-код
			for (let row = 0; row < qrSize; row++) {
				for (let col = 0; col < qrSize; col++) {
					if (qr.isDark(row, col)) {
						ctx.fillStyle = '#000000';
						ctx.fillRect(col * scale, row * scale, scale, scale);
					}
				}
			}

			// Вычисляем размер и позицию для логотипа (20% от размера QR-кода)
			const logoSize = Math.floor(qrSize * scale * 0.2);
			const logoX = (canvas.width - logoSize) / 2;
			const logoY = (canvas.height - logoSize) / 2;

			// Создаем белый фон под логотипом
			const padding = Math.floor(logoSize * 0.1); // 10% padding
			ctx.fillStyle = '#FFFFFF';
			ctx.fillRect(
				logoX - padding,
				logoY - padding,
				logoSize + padding * 2,
				logoSize + padding * 2
			);

			// Рисуем логотип
			ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);

			// Преобразуем canvas в изображение
			const qrImage = new Image();
			qrImage.src = canvas.toDataURL('image/png');
			qrImage.classList.add('fade-in');

			// Очищаем и обновляем контейнер
			qrContainer.innerHTML = '';
			qrContainer.appendChild(qrImage);

			// Показываем кнопку скачивания
			downloadBtn.classList.remove('hidden');
			downloadBtn.classList.add('fade-in');

			if (callback) callback(canvas);
		};
		logo.src = 'img/chicken.png';
	}

	function generateQRCode(text) {
		qrContainer.innerHTML = '';
		downloadBtn.classList.add('hidden');

		if (!text) {
			qrContainerWrapper.classList.remove('active');
			return;
		}
		createQRCodeWithLogo(text);
	}

	function downloadQRCode() {
		if (!qr) return;

		createQRCodeWithLogo(qrText.value.trim(), canvas => {
			// Создаем ссылку для скачивания
			const link = document.createElement('a');
			link.download = 'kurkod-qr.png';
			link.href = canvas.toDataURL('image/png');
			link.click();
		});
	}

	// Обработчики событий
	generateBtn.addEventListener('click', () => {
		generateQRCode(qrText.value.trim());
	});

	qrText.addEventListener('keypress', e => {
		if (e.key === 'Enter') {
			generateQRCode(qrText.value.trim());
		}
	});

	downloadBtn.addEventListener('click', downloadQRCode);

	// Добавляем эффект при фокусе на input
	qrText.addEventListener('focus', () => {
		qrText.parentElement.classList.add('focused');
	});

	qrText.addEventListener('blur', () => {
		qrText.parentElement.classList.remove('focused');
	});
});
