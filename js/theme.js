// Функция для установки темы
function setTheme(theme) {
	console.log('Setting theme to:', theme);
	document.documentElement.setAttribute('data-theme', theme);
	localStorage.setItem('theme', theme);

	// Класс для анимации
	document.documentElement.classList.add('theme-transition');
	setTimeout(() => {
		document.documentElement.classList.remove('theme-transition');
	}, 300);
}

// Функция для переключения темы
function toggleTheme() {
	console.log('Toggle theme clicked');
	const currentTheme = localStorage.getItem('theme') || 'light';
	console.log('Current theme:', currentTheme);
	const newTheme = currentTheme === 'light' ? 'dark' : 'light';
	console.log('New theme will be:', newTheme);
	setTheme(newTheme);
}

// Инициализация темы при загрузке страницы
function initTheme() {
	console.log('Initializing theme');
	// Проверяем сохраненную тему
	let theme = localStorage.getItem('theme');
	console.log('Theme from localStorage:', theme);

	// Если тема не сохранена, проверяет системные настройки
	if (!theme) {
		const prefersDark = window.matchMedia(
			'(prefers-color-scheme: dark)'
		).matches;
		theme = prefersDark ? 'dark' : 'light';
		console.log('Using system theme preference:', theme);
	}

	setTheme(theme);
}

// Запускает инициализацию при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
	console.log('DOM loaded, setting up theme system');
	initTheme();

	// Добавляет обработчик для кнопки переключения темы
	const themeBtn = document.querySelector('.theme-btn');
	console.log('Theme button found:', themeBtn);

	if (themeBtn) {
		themeBtn.addEventListener('click', e => {
			e.preventDefault();
			console.log('Theme button clicked');
			toggleTheme();
		});
	} else {
		console.error('Theme button not found!');
	}

	// Слушает изменения системной темы
	window
		.matchMedia('(prefers-color-scheme: dark)')
		.addEventListener('change', e => {
			if (!localStorage.getItem('theme')) {
				console.log(
					'System theme changed:',
					e.matches ? 'dark' : 'light'
				);
				setTheme(e.matches ? 'dark' : 'light');
			}
		});
});
