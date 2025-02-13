class QRHistory {
	constructor() {
		this.historyContainer = document.querySelector('.history-container');
		this.historyList = document.getElementById('history-list');
		this.clearHistoryBtn = document.getElementById('clear-history-btn');
		this.maxItems = 10;
		this.storageKey = 'qr_history';

		this.clearHistoryBtn.addEventListener('click', () =>
			this.clearHistory()
		);
		this.loadHistory();
	}

	addItem(text) {
		const history = this.getHistory();
		const newItem = {
			text,
			timestamp: Date.now(),
		};

		// Добавляет новый элемент в начало
		history.unshift(newItem);

		// Удаляет
		if (history.length > this.maxItems) {
			history.pop();
		}

		localStorage.setItem(this.storageKey, JSON.stringify(history));
		this.renderHistory();
		this.historyContainer.classList.remove('hidden');
	}

	getHistory() {
		const history = localStorage.getItem(this.storageKey);
		return history ? JSON.parse(history) : [];
	}

	clearHistory() {
		localStorage.removeItem(this.storageKey);
		this.renderHistory();
		if (this.getHistory().length === 0) {
			this.historyContainer.classList.add('hidden');
		}
	}

	deleteItem(timestamp) {
		const history = this.getHistory();
		const index = history.findIndex(item => item.timestamp === timestamp);
		if (index !== -1) {
			history.splice(index, 1);
			localStorage.setItem(this.storageKey, JSON.stringify(history));
			this.renderHistory();
			if (history.length === 0) {
				this.historyContainer.classList.add('hidden');
			}
		}
	}

	formatDate(timestamp) {
		const date = new Date(timestamp);
		const now = new Date();
		const yesterday = new Date(now);
		yesterday.setDate(yesterday.getDate() - 1);

		const isToday = date.toDateString() === now.toDateString();
		const isYesterday = date.toDateString() === yesterday.toDateString();

		const lang = document.documentElement.lang || 'ru';
		const translations = window.translations[lang];

		if (isToday) {
			return `${translations.today}, ${date.toLocaleTimeString(lang, {
				hour: '2-digit',
				minute: '2-digit',
			})}`;
		} else if (isYesterday) {
			return `${translations.yesterday}, ${date.toLocaleTimeString(lang, {
				hour: '2-digit',
				minute: '2-digit',
			})}`;
		} else {
			return date.toLocaleDateString(lang, {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
			});
		}
	}

	renderHistory() {
		const history = this.getHistory();
		const lang = document.documentElement.lang || 'ru';
		const translations = window.translations[lang];

		if (history.length === 0) {
			this.historyList.innerHTML = `
                <div class="history-empty">
                    <span class="history-empty-text">${translations.emptyHistory}</span>
                </div>
            `;
			return;
		}

		this.historyList.innerHTML = history
			.map(
				item => `
            <a href="#" class="history-item" data-text="${item.text}">
                <span class="history-item-text">${item.text}</span>
                <span class="history-item-date">${this.formatDate(
					item.timestamp
				)}</span>
                <button class="history-item-delete" aria-label="${
					translations.deleteItem
				}" data-timestamp="${item.timestamp}">
                    <svg viewBox="0 0 16 16">
                        <path fill="currentColor" d="M5 2a2 2 0 012-2h2a2 2 0 012 2h4v2H1V2h4zM3 5h10l-.5 9.5a2 2 0 01-2 2h-5a2 2 0 01-2-2L3 5zm2.5 2a.5.5 0 00-.5.5v6a.5.5 0 001 0v-6a.5.5 0 00-.5-.5zm5 0a.5.5 0 00-.5.5v6a.5.5 0 001 0v-6a.5.5 0 00-.5-.5z"/>
                    </svg>
                </button>
            </a>
        `
			)
			.join('');

		// Добавляет эвент листнер
		this.historyList.querySelectorAll('.history-item').forEach(item => {
			// Клик на айтем
			item.addEventListener('click', e => {
				e.preventDefault();
				if (!e.target.closest('.history-item-delete')) {
					const text = item.dataset.text;
					document.getElementById('qr-text').value = text;
					// Задаёт флаг
					window.fromHistory = true;
					document.getElementById('generate-btn').click();
				}
			});
		});

		this.historyList
			.querySelectorAll('.history-item-delete')
			.forEach(button => {
				button.addEventListener('click', e => {
					e.stopPropagation();
					const timestamp = parseInt(button.dataset.timestamp);
					this.deleteItem(timestamp);
				});
			});
	}

	loadHistory() {
		const history = this.getHistory();
		if (history.length > 0) {
			this.historyContainer.classList.remove('hidden');
			this.renderHistory();
		}
	}
}

// Инициализация истории при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
	window.qrHistory = new QRHistory();
});
