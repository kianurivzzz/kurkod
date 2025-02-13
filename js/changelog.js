(() => {
    const changelogBtn = document.getElementById('changelog-btn');
    const changelogPanel = document.getElementById('changelog-panel');
    const closeChangelogBtn = document.getElementById('close-changelog-btn');
    const changelogContent = document.getElementById('changelog-content');

    // Render changelog data
    function renderChangelog() {
        changelogContent.innerHTML = changelogData.map(entry => `
            <div class="changelog-entry">
                <div class="changelog-header-entry">
                    <span class="changelog-version">v${entry.version}</span>
                    <span class="changelog-date">${entry.date}</span>
                </div>
                <ul class="changelog-list">
                    ${entry.changes.map(change => `
                        <li class="changelog-item">${change}</li>
                    `).join('')}
                </ul>
            </div>
        `).join('');
    }

    // Toggle panel visibility
    function togglePanel() {
        changelogPanel.classList.toggle('hidden');
    }

    // Close panel when clicking outside
    function handleClickOutside(event) {
        if (!changelogPanel.classList.contains('hidden') &&
            !changelogPanel.contains(event.target) &&
            !changelogBtn.contains(event.target)) {
            changelogPanel.classList.add('hidden');
        }
    }

    // Event listeners
    changelogBtn.addEventListener('click', togglePanel);
    closeChangelogBtn.addEventListener('click', () => changelogPanel.classList.add('hidden'));
    document.addEventListener('click', handleClickOutside);

    // Initial render
    renderChangelog();
})();
