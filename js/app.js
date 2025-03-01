document.addEventListener('DOMContentLoaded', () => {
	// Ждёт загрузки translations
	if (typeof window.translations === 'undefined') {
		console.error('Translations not loaded!');
		return;
	}

	const qrText = document.getElementById('qr-text');
	const generateBtn = document.getElementById('generate-btn');
	const downloadBtn = document.getElementById('download-btn');
	const customizeBtn = document.getElementById('customize-btn');
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

		// Обновляет title
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

			// Обновляет активную кнопку
			langButtons.forEach(b => b.classList.remove('active'));
			btn.classList.add('active');

			// Обновляет язык
			currentLang = lang;
			localStorage.setItem('language', lang);
			translateUI(lang);
		});
	});

	function createQRCodeWithLogo(text) {
		// Активируем контейнер
		qrContainerWrapper.classList.add('active');

		// Создаем QR-код с большей коррекцией ошибок
		qr = qrcode(0, 'H'); // H - highest error correction level (30%)
		qr.addData(text);
		qr.make();

		// Создаем временный canvas для объединения QR-кода и логотипа
		const canvas = document.createElement('canvas');
		const qrSize = qr.getModuleCount();
		const scale = 20; // Увеличили размер каждого модуля с 10 до 20
		const padding = Math.floor(scale * 0.75); // Добавляем отступ для закруглений
		canvas.width = qrSize * scale + padding * 2;
		canvas.height = qrSize * scale + padding * 2;

		const ctx = canvas.getContext('2d');
		ctx.imageSmoothingEnabled = true;
		ctx.imageSmoothingQuality = 'high';

		// Получаем текущие настройки из QRCustomizer
		const settings = window.qrCustomizer
			? window.qrCustomizer.getCurrentSettings()
			: null;
		const dotsColor = settings ? settings.dotsColor : '#000000';
		const bgColor = settings ? settings.bgColor : '#FFFFFF';

		// Рисуем фон с закруглёнными краями
		ctx.fillStyle = bgColor;
		const radius = scale;
		ctx.beginPath();
		ctx.moveTo(radius, 0);
		ctx.lineTo(canvas.width - radius, 0);
		ctx.quadraticCurveTo(canvas.width, 0, canvas.width, radius);
		ctx.lineTo(canvas.width, canvas.height - radius);
		ctx.quadraticCurveTo(
			canvas.width,
			canvas.height,
			canvas.width - radius,
			canvas.height
		);
		ctx.lineTo(radius, canvas.height);
		ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - radius);
		ctx.lineTo(0, radius);
		ctx.quadraticCurveTo(0, 0, radius, 0);
		ctx.closePath();
		ctx.fill();

		// Рисует QR-код с антиалиасингом
		ctx.fillStyle = dotsColor;
		for (let row = 0; row < qrSize; row++) {
			for (let col = 0; col < qrSize; col++) {
				if (qr.isDark(row, col)) {
					const x = col * scale + padding;
					const y = row * scale + padding;
					const size = scale * 0.95; // Немного уменьшает размер точек для лучшего вида
					const dotRadius = scale * 0.1; // Радиус закругления точек

					ctx.beginPath();
					ctx.moveTo(x + dotRadius, y);
					ctx.lineTo(x + size - dotRadius, y);
					ctx.quadraticCurveTo(x + size, y, x + size, y + dotRadius);
					ctx.lineTo(x + size, y + size - dotRadius);
					ctx.quadraticCurveTo(
						x + size,
						y + size,
						x + size - dotRadius,
						y + size
					);
					ctx.lineTo(x + dotRadius, y + size);
					ctx.quadraticCurveTo(x, y + size, x, y + size - dotRadius);
					ctx.lineTo(x, y + dotRadius);
					ctx.quadraticCurveTo(x, y, x + dotRadius, y);
					ctx.closePath();
					ctx.fill();
				}
			}
		}

		// Функция для добавления логотипа
		function addLogo(logo) {
			const logoSize = Math.floor(qrSize * scale * 0.2);
			const logoX = (canvas.width - logoSize) / 2;
			const logoY = (canvas.height - logoSize) / 2;
			const logoPadding = Math.floor(logoSize * 0.15);

			// Создаёт белый фон под логотипом
			ctx.fillStyle = bgColor;
			const logoBackRadius = logoPadding;
			ctx.beginPath();
			ctx.moveTo(
				logoX - logoPadding + logoBackRadius,
				logoY - logoPadding
			);
			ctx.lineTo(
				logoX + logoSize + logoPadding - logoBackRadius,
				logoY - logoPadding
			);
			ctx.quadraticCurveTo(
				logoX + logoSize + logoPadding,
				logoY - logoPadding,
				logoX + logoSize + logoPadding,
				logoY - logoPadding + logoBackRadius
			);
			ctx.lineTo(
				logoX + logoSize + logoPadding,
				logoY + logoSize + logoPadding - logoBackRadius
			);
			ctx.quadraticCurveTo(
				logoX + logoSize + logoPadding,
				logoY + logoSize + logoPadding,
				logoX + logoSize + logoPadding - logoBackRadius,
				logoY + logoSize + logoPadding
			);
			ctx.lineTo(
				logoX - logoPadding + logoBackRadius,
				logoY + logoSize + logoPadding
			);
			ctx.quadraticCurveTo(
				logoX - logoPadding,
				logoY + logoSize + logoPadding,
				logoX - logoPadding,
				logoY + logoSize + logoPadding - logoBackRadius
			);
			ctx.lineTo(
				logoX - logoPadding,
				logoY - logoPadding + logoBackRadius
			);
			ctx.quadraticCurveTo(
				logoX - logoPadding,
				logoY - logoPadding,
				logoX - logoPadding + logoBackRadius,
				logoY - logoPadding
			);
			ctx.closePath();
			ctx.fill();

			// Рисуем логотип
			ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
		}

		// Загружаем и добавляем логотип
		const logo = new Image();
		logo.onload = function () {
			addLogo(logo);

			// Преобразуем canvas в изображение с высоким качеством
			const qrImage = new Image();
			qrImage.src = canvas.toDataURL('image/png', 1.0);
			qrImage.classList.add('fade-in');

			// Очищаем и обновляем контейнер
			qrContainer.innerHTML = '';
			qrContainer.appendChild(qrImage);

			// Показываем кнопки
			downloadBtn.classList.remove('hidden');
			customizeBtn.classList.remove('hidden');
			downloadBtn.classList.add('fade-in');
			qrContainerWrapper.classList.add('active');
		};

		if (settings && settings.logo === 'custom' && settings.customLogo) {
			logo.src = settings.customLogo;
		} else {
			logo.src = 'img/chicken.png';
		}
	}

	function generateQRCode(text) {
		qrContainer.innerHTML = '';
		downloadBtn.classList.add('hidden');
		customizeBtn.classList.add('hidden');

		if (!text) {
			qrContainerWrapper.classList.remove('active');
			return;
		}

		createQRCodeWithLogo(text);
		// Добавляет в историю
		if (window.qrHistory && !window.fromHistory) {
			window.qrHistory.addItem(text);
		}
		// Обновляет флаг
		window.fromHistory = false;

		// Скрывает кнопку управления при обычном QR
		document.getElementById('manage-dynamic-btn').classList.add('hidden');
	}

	// Делает функцию доступной глобально
	window.generateQRCode = generateQRCode;

	function downloadQRCode() {
		const qrImage = qrContainer.querySelector('img');
		if (qrImage) {
			const link = document.createElement('a');
			link.download = 'kurkod-qr.png';
			link.href = qrImage.src;
			link.click();
		}
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

	// Функционал динамических QR-кодов
	function generateDynamicQR(targetUrl) {
		// Генерируем уникальный ID (6 символов)
		const id = Math.random().toString(36).substring(2, 8);

		// Сохраняем соответствие в localStorage
		const redirects = JSON.parse(
			localStorage.getItem('qr_redirects') || '{}'
		);
		redirects[id] = {
			targetUrl,
			createdAt: new Date().toISOString(),
		};
		localStorage.setItem('qr_redirects', JSON.stringify(redirects));

		// Создаёт QR-код с URL для редиректа
		const redirectUrl = `${window.location.origin}${window.location.pathname}redirect.html#${id}`;
		generateQRCode(redirectUrl);

		// Показывает кнопку управления
		const manageDynamicBtn = document.getElementById('manage-dynamic-btn');
		manageDynamicBtn.classList.remove('hidden');
		manageDynamicBtn.setAttribute('data-qr-id', id);

		// Показываем модальное окно
		showAlphaNotice();
	}

	// Функционал модального окна для альфа-уведомления
	const alphaModal = document.getElementById('alpha-modal');
	const closeAlphaModal = document.getElementById('close-alpha-modal');
	const alphaSurveyBtn = document.getElementById('alpha-survey-btn');

	function showAlphaNotice() {
		alphaModal.classList.remove('hidden');
	}

	function hideAlphaNotice() {
		alphaModal.classList.add('hidden');
	}

	closeAlphaModal.addEventListener('click', hideAlphaNotice);
	alphaSurveyBtn.addEventListener('click', () => {
		// Перенаправление на страницу опроса
		window.location.href = 'survey.html';
		hideAlphaNotice();
	});

	// Закрытие модального окна при клике вне его
	alphaModal.addEventListener('click', (e) => {
		if (e.target === alphaModal) {
			hideAlphaNotice();
		}
	});

	// Обработчик для кнопки динамического QR
	const dynamicQrBtn = document.getElementById('dynamic-qr-btn');
	dynamicQrBtn.addEventListener('click', () => {
		const url = qrText.value.trim();
		if (!url) return;
		generateDynamicQR(url);
	});

	// Обработчик для кнопки управления
	const manageDynamicBtn = document.getElementById('manage-dynamic-btn');
	manageDynamicBtn.addEventListener('click', () => {
		const id = manageDynamicBtn.getAttribute('data-qr-id');
		if (!id) return;

		const redirects = JSON.parse(
			localStorage.getItem('qr_redirects') || '{}'
		);
		const redirect = redirects[id];
		if (!redirect) return;

		const newUrl = prompt('Введите новый URL:', redirect.targetUrl);
		if (!newUrl) return;

		redirects[id].targetUrl = newUrl;
		localStorage.setItem('qr_redirects', JSON.stringify(redirects));
		alert('URL успешно обновлен!');
	});

	// Добавляет эффект при фокусе на input
	qrText.addEventListener('focus', () => {
		qrText.parentElement.classList.add('focused');
	});

	qrText.addEventListener('blur', () => {
		qrText.parentElement.classList.remove('focused');
	});

	// Обработчик для кнопки опроса
	const surveyBtn = document.getElementById('survey-btn');
	if (surveyBtn) {
		surveyBtn.addEventListener('click', () => {
			window.location.href = 'survey.html';
		});
	}
});
