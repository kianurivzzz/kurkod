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
			const scale = 20; // Увеличили размер каждого модуля с 10 до 20
			const padding = Math.floor(scale * 0.75); // Добавляем отступ для закруглений
			canvas.width = qrSize * scale + (padding * 2);
			canvas.height = qrSize * scale + (padding * 2);

			const ctx = canvas.getContext('2d');
			ctx.imageSmoothingEnabled = true;
			ctx.imageSmoothingQuality = 'high';

			// Рисуем белый фон с закруглёнными краями
			ctx.fillStyle = '#FFFFFF';
			const radius = scale; // Радиус закругления углов
			ctx.beginPath();
			ctx.moveTo(radius, 0);
			ctx.lineTo(canvas.width - radius, 0);
			ctx.quadraticCurveTo(canvas.width, 0, canvas.width, radius);
			ctx.lineTo(canvas.width, canvas.height - radius);
			ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - radius, canvas.height);
			ctx.lineTo(radius, canvas.height);
			ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - radius);
			ctx.lineTo(0, radius);
			ctx.quadraticCurveTo(0, 0, radius, 0);
			ctx.closePath();
			ctx.fill();

			// Рисуем QR-код с антиалиасингом
			ctx.beginPath();
			for (let row = 0; row < qrSize; row++) {
				for (let col = 0; col < qrSize; col++) {
					if (qr.isDark(row, col)) {
						const x = col * scale + padding;
						const y = row * scale + padding;
						const size = scale * 0.95; // Немного уменьшаем размер точек для лучшего вида
						const dotRadius = scale * 0.1; // Радиус закругления точек

						ctx.fillStyle = '#000000';
						ctx.beginPath();
						ctx.moveTo(x + dotRadius, y);
						ctx.lineTo(x + size - dotRadius, y);
						ctx.quadraticCurveTo(x + size, y, x + size, y + dotRadius);
						ctx.lineTo(x + size, y + size - dotRadius);
						ctx.quadraticCurveTo(x + size, y + size, x + size - dotRadius, y + size);
						ctx.lineTo(x + dotRadius, y + size);
						ctx.quadraticCurveTo(x, y + size, x, y + size - dotRadius);
						ctx.lineTo(x, y + dotRadius);
						ctx.quadraticCurveTo(x, y, x + dotRadius, y);
						ctx.closePath();
						ctx.fill();
					}
				}
			}

			// Вычисляем размер и позицию для логотипа (20% от размера QR-кода)
			const logoSize = Math.floor(qrSize * scale * 0.2);
			const logoX = (canvas.width - logoSize) / 2;
			const logoY = (canvas.height - logoSize) / 2;

			// Создаем белый фон под логотипом
			const logoPadding = Math.floor(logoSize * 0.15); // Увеличили padding для логотипа
			ctx.fillStyle = '#FFFFFF';
			// Рисуем закруглённый фон под логотипом
			const logoBackRadius = logoPadding;
			ctx.beginPath();
			ctx.moveTo(logoX - logoPadding + logoBackRadius, logoY - logoPadding);
			ctx.lineTo(logoX + logoSize + logoPadding - logoBackRadius, logoY - logoPadding);
			ctx.quadraticCurveTo(logoX + logoSize + logoPadding, logoY - logoPadding, logoX + logoSize + logoPadding, logoY - logoPadding + logoBackRadius);
			ctx.lineTo(logoX + logoSize + logoPadding, logoY + logoSize + logoPadding - logoBackRadius);
			ctx.quadraticCurveTo(logoX + logoSize + logoPadding, logoY + logoSize + logoPadding, logoX + logoSize + logoPadding - logoBackRadius, logoY + logoSize + logoPadding);
			ctx.lineTo(logoX - logoPadding + logoBackRadius, logoY + logoSize + logoPadding);
			ctx.quadraticCurveTo(logoX - logoPadding, logoY + logoSize + logoPadding, logoX - logoPadding, logoY + logoSize + logoPadding - logoBackRadius);
			ctx.lineTo(logoX - logoPadding, logoY - logoPadding + logoBackRadius);
			ctx.quadraticCurveTo(logoX - logoPadding, logoY - logoPadding, logoX - logoPadding + logoBackRadius, logoY - logoPadding);
			ctx.closePath();
			ctx.fill();

			// Рисуем логотип
			ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);

			// Преобразуем canvas в изображение с высоким качеством
			const qrImage = new Image();
			qrImage.src = canvas.toDataURL('image/png', 1.0); // Максимальное качество
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
		// Add to history only if not generated from history
		if (window.qrHistory && !window.fromHistory) {
			window.qrHistory.addItem(text);
		}
		// Reset the flag
		window.fromHistory = false;
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
