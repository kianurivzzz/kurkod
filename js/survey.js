document.addEventListener('DOMContentLoaded', () => {
	// Проверяем, что библиотека QR-кода загружена
	if (typeof qrcode === 'undefined') {
		console.error('QR code library not loaded');
		return;
	}
	console.log('QR code library loaded successfully');

	// Инициализация темы
	const userTheme = localStorage.getItem('theme');
	const systemDarkTheme = window.matchMedia(
		'(prefers-color-scheme: dark)'
	).matches;

	// Если тема не задана пользователем, используем системную
	if (!userTheme) {
		document.documentElement.setAttribute(
			'data-theme',
			systemDarkTheme ? 'dark' : 'light'
		);
	} else {
		document.documentElement.setAttribute('data-theme', userTheme);
	}

	const form = document.getElementById('survey-form');
	const steps = form.querySelectorAll('.survey-step');
	const nextBtn = document.getElementById('next-btn');
	const prevBtn = document.getElementById('prev-btn');
	const priceRange = document.getElementById('price-range');
	const priceDisplay = document.getElementById('price-display');

	let currentStep = 1;
	const totalSteps = steps.length;

	// Комментарии для каждой оценки
	const ratingComments = {
		1: '😢 Ой...очень жаль!',
		2: '😕 Да, есть над чем поработать',
		3: '🤔 Понятно... Спасибо за честность',
		4: '😌 Уже неплохо, но можно лучше',
		5: '🙂 Середина пути',
		6: '😊 Хорошо!',
		7: '😃 Отлично! Рад, что понравилось',
		8: '🤩 Вау! Спасибо за высокую оценку',
		9: '🎉 Невероятно!',
		10: '🚀 Потрясающе!!',
	};

	// Обработчик для оценок
	const ratingInputs = document.querySelectorAll('input[name="rating"]');
	const ratingComment = document.querySelector('.rating-comment');

	if (ratingInputs.length && ratingComment) {
		ratingInputs.forEach(input => {
			input.addEventListener('change', e => {
				const rating = e.target.value;
				ratingComment.textContent = ratingComments[rating];
				ratingComment.classList.remove('show');
				// Используем setTimeout для создания эффекта появления
				setTimeout(() => {
					ratingComment.classList.add('show');
				}, 50);
			});
		});
	}

	// Обработчик для своего варианта в списке функций
	const customFeatureCheckbox = document.getElementById(
		'custom-feature-checkbox'
	);
	const customFeatureInput = document.querySelector('.custom-feature-input');

	if (customFeatureCheckbox && customFeatureInput) {
		customFeatureCheckbox.addEventListener('change', e => {
			if (e.target.checked) {
				customFeatureInput.classList.remove('hidden');
				customFeatureInput.focus();
			} else {
				customFeatureInput.classList.add('hidden');
				customFeatureInput.value = '';
			}
		});

		// Автоматически отмечаем чекбокс при вводе текста
		customFeatureInput.addEventListener('input', e => {
			if (e.target.value.length > 0 && !customFeatureCheckbox.checked) {
				customFeatureCheckbox.checked = true;
			}
		});
	}

	// Обработка шага 1 (использование Куркода)
	const handleStep1Response = value => {
		const message = document.createElement('p');
		message.style.textAlign = 'center';
		message.style.color = 'var(--button-primary)';
		message.style.marginTop = '1rem';
		message.style.fontWeight = '500';

		if (value === 'yes') {
			message.textContent = 'Супер! ';
		} else {
			message.textContent = 'Обязательно попробуй! ';
		}

		const currentStepElement = document.querySelector(
			`[data-step="${currentStep}"]`
		);
		const existingMessage = currentStepElement.querySelector('p');
		if (existingMessage) {
			existingMessage.remove();
		}
		currentStepElement.appendChild(message);

		// Автоматический переход через 1.5 секунды
		setTimeout(() => {
			nextStep();
		}, 1500);
	};

	// Обработчики радио кнопок первого шага
	document.querySelectorAll('input[name="used_kurkod"]').forEach(radio => {
		radio.addEventListener('change', e => {
			handleStep1Response(e.target.value);
		});
	});

	// Обработка цены
	if (priceRange && priceDisplay) {
		const priceValue = priceDisplay.parentElement;
		priceRange.addEventListener('input', e => {
			priceDisplay.textContent = e.target.value;
			// Добавляем и удаляем класс для анимации
			priceValue.classList.remove('changed');
			void priceValue.offsetWidth; // Форсируем перерисовку
			priceValue.classList.add('changed');
		});
	}

	// Функция для генерации QR-кода
	const generateShareQR = () => {
		console.log('Starting QR code generation');
		const shareQRContainer = document.getElementById('share-qr');
		if (!shareQRContainer) {
			console.error('QR container not found');
			return;
		}
		console.log('Found QR container');

		try {
			// Создаем QR-код с большей коррекцией ошибок
			const qr = qrcode(0, 'H'); // H - highest error correction level (30%)
			qr.addData('https://kianurivzzz.github.io/kurkod/');
			qr.make();
			console.log('QR code created');

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
			console.log('Canvas created');

			// Используем цвета из текущей темы
			const dotsColor = getComputedStyle(document.documentElement)
				.getPropertyValue('--text-primary')
				.trim();
			const bgColor = getComputedStyle(document.documentElement)
				.getPropertyValue('--bg-primary')
				.trim();
			console.log('Colors loaded:', { dotsColor, bgColor });

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
			console.log('Background drawn');

			// Рисует QR-код с антиалиасингом
			ctx.fillStyle = dotsColor;
			for (let row = 0; row < qrSize; row++) {
				for (let col = 0; col < qrSize; col++) {
					if (qr.isDark(row, col)) {
						const x = col * scale + padding;
						const y = row * scale + padding;
						const size = scale * 0.95;
						const dotRadius = scale * 0.1;

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
			console.log('QR code drawn');

			// Функция для добавления логотипа
			function addLogo(logo) {
				console.log('Adding logo');
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
				console.log('Logo drawn');

				// Преобразуем canvas в изображение с высоким качеством
				const qrImage = new Image();
				qrImage.src = canvas.toDataURL('image/png', 1.0);
				qrImage.classList.add('fade-in');

				// Очищаем и добавляем новое изображение
				shareQRContainer.innerHTML = '';
				shareQRContainer.appendChild(qrImage);
				console.log('QR code added to container');
			}

			// Загружаем и добавляем логотип
			const logo = new Image();
			logo.src = 'img/chicken.png';
			logo.onerror = function(e) {
				console.error('Error loading logo:', e);
			};
			logo.onload = function () {
				console.log('Logo loaded');
				addLogo(this);
			};
		} catch (error) {
			console.error('Error generating QR code:', error);
		}
	};

	// Обработчик для последнего шага
	const handleLastStep = async () => {
		generateShareQR();
		const formData = new FormData(form);
		const success = await sendResultsToTelegram(formData);
		if (success) {
			console.log('Survey results sent to Telegram successfully');
		}
	};

	// Функция для отправки результатов в Telegram
	const sendResultsToTelegram = async (formData) => {
		const botToken = '7569188327:AAGMhFDjzjY0EoasSTsTfkXO77kCo4FIYAs';
		const chatId = '5353106736';

		// Функция для перевода значений в читаемый текст
		const translateValue = (value) => {
			const translations = {
				// Частота использования
				'daily': 'Каждый день',
				'weekly': 'Раз в неделю',
				'monthly': 'Раз в месяц',
				'rarely': 'Очень редко',
				// Цели использования
				'business': 'Для бизнеса',
				'personal': 'Для личного использования',
				'education': 'Для учёбы',
				'fun': 'Для развлечения',
				// Функции
				'dynamic': 'Динамические QR-коды',
				'logo': 'Добавление логотипа',
				'design': 'Дизайн QR-кода',
				'analytics': 'Аналитика сканирований',
				'bulk': 'Массовая генерация',
				'custom': 'Свой вариант'
			};
			return translations[value] || value;
		};
		
		// Форматируем сообщение
		let message = '📋 *Новый ответ на опрос*\n\n';
		
		// 1. Использование Куркода
		const usedKurkod = formData.get('used_kurkod') === 'yes';
		message += `*1️⃣ Использовал Куркод:* ${usedKurkod ? '✅ Да' : '❌ Нет'}\n\n`;
		
		// 2. Оценка (если использовал)
		if (usedKurkod) {
			const rating = formData.get('rating');
			message += `*2️⃣ Оценка:* ${rating}/10 ${rating >= 8 ? '🌟' : rating >= 5 ? '👍' : '😢'}\n\n`;
		}
		
		// 3. Нужные функции
		const features = formData.getAll('features');
		if (features.length > 0) {
			message += '*3️⃣ Нужные функции:*\n';
			features.forEach(feature => {
				message += `• ${translateValue(feature)}\n`;
			});
			
			// Добавляем пользовательский ввод, если есть
			const customFeature = formData.get('custom-feature');
			if (customFeature && features.includes('custom')) {
				message += `  ↳ _${customFeature}_\n`;
			}
			message += '\n';
		}
		
		// 4. Цели использования
		const purposes = formData.getAll('purpose');
		if (purposes.length > 0) {
			message += '*4️⃣ Цели использования:*\n';
			purposes.forEach(purpose => {
				message += `• ${translateValue(purpose)}\n`;
			});
			message += '\n';
		}

		// 5. Частота использования
		const frequency = formData.get('frequency');
		if (frequency) {
			message += `*5️⃣ Частота использования:* ${translateValue(frequency)}\n\n`;
		}

		// 6. Готовность платить
		const price = formData.get('price');
		if (price) {
			message += `*6️⃣ Готовность платить:* ${price}₽\n\n`;
		}

		// 7. Комментарий
		const comment = formData.get('comment');
		if (comment && comment.trim()) {
			message += `*7️⃣ Комментарий:*\n_${comment.trim()}_\n`;
		}

		try {
			const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					chat_id: chatId,
					text: message,
					parse_mode: 'Markdown'
				})
			});

			if (!response.ok) {
				throw new Error('Failed to send message to Telegram');
			}

			console.log('Survey results sent to Telegram successfully');
			return true;
		} catch (error) {
			console.error('Error sending results to Telegram:', error);
			return false;
		}
	};

	// Показ текущего шага
	const showStep = step => {
		// Hide intro section if not on first step
		const introSection = document.querySelector('.survey-intro');
		if (introSection) {
			if (step === 1) {
				introSection.classList.remove('hidden');
			} else {
				introSection.classList.add('hidden');
			}
		}

		steps.forEach(s => s.classList.add('hidden'));
		const currentStepEl = form.querySelector(`[data-step="${step}"]`);
		if (currentStepEl) {
			currentStepEl.classList.remove('hidden');
		}

		// Call handleLastStep when showing the last step
		if (step === totalSteps) {
			handleLastStep();
		}

		// Обновляем состояние кнопок
		updateButtons(step);
	};

	// Обновляем состояние кнопок
	const updateButtons = step => {
		prevBtn.classList.toggle('hidden', step === 1);
		nextBtn.textContent = step === totalSteps - 1 ? 'Завершить' : 'Далее';

		// Скрыть кнопки на последнем шаге
		if (step === totalSteps) {
			prevBtn.classList.add('hidden');
			nextBtn.classList.add('hidden');
		}
	};

	// Переход к следующему шагу
	const nextStep = () => {
		const currentStepEl = form.querySelector(`[data-step="${currentStep}"]`);
		const inputs = currentStepEl.querySelectorAll('input[type="radio"], input[type="checkbox"]');
		const hasChecked = Array.from(inputs).some(input => input.checked);

		// Проверяем, выбран ли хотя бы один вариант
		if (!hasChecked && inputs.length > 0) {
			alert('Пожалуйста, выберите хотя бы один вариант');
			return;
		}

		if (currentStep < totalSteps) {
			currentStep++;
			showStep(currentStep);
		}
	};

	// Возврат к предыдущему шагу
	const prevStep = () => {
		if (currentStep > 1) {
			currentStep--;
			showStep(currentStep);
		}
	};

	// Обработчики кнопок
	nextBtn.addEventListener('click', nextStep);
	prevBtn.addEventListener('click', prevStep);

	// Предотвращение отправки формы
	form.addEventListener('submit', e => {
		e.preventDefault();
	});

	// Инициализация
	showStep(currentStep);
});
