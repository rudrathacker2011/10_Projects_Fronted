let standups = JSON.parse(localStorage.getItem('proStandups')) || [];

const standupForm = document.getElementById('standup-form');
const feedContainer = document.getElementById('feed-container');
const dateDisplay = document.getElementById('current-date');

dateDisplay.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

function renderFeed() {
    feedContainer.innerHTML = '';
    standups.forEach(post => {
        const card = document.createElement('div');
        card.className = `standup-card ${post.hasBlocker ? 'has-blocker' : ''}`;
        
        card.innerHTML = `
            <div class="card-top">
                <div class="avatar-name"><span>${post.avatar}</span> ${post.name}</div>
                <small style="color:#9ca3af">${post.time}</small>
            </div>
            <div class="status-section">
                <strong>Yesterday</strong>
                <p>${post.yesterday}</p>
            </div>
            <div class="status-section">
                <strong>Today</strong>
                <p>${post.today}</p>
            </div>
            ${post.hasBlocker ? `
                <div class="blocker-box">
                    <strong>⚠️ Blocker:</strong> ${post.blockers}
                </div>` : ''}
            <button onclick="deletePost(${post.id})" class="text-btn" style="margin-top:1rem">Delete</button>
        `;
        feedContainer.appendChild(card);
    });
}

standupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('user-name').value;
    const avatar = document.getElementById('user-avatar').value;
    const yesterday = document.getElementById('yesterday').value;
    const today = document.getElementById('today').value;
    const blockers = document.getElementById('blockers').value;

    const hasBlocker = blockers.toLowerCase() !== 'none' && blockers.trim() !== '';

    const newUpdate = {
        id: Date.now(),
        name, avatar, yesterday, today, blockers, hasBlocker,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    standups.unshift(newUpdate);
    saveAndRefresh();
    standupForm.reset();
});

// FEATURE: Copy for Slack/Discord
document.getElementById('copy-report-btn').addEventListener('click', () => {
    if (standups.length === 0) return alert("No updates to copy!");

    const report = standups.map(p => 
        `*${p.avatar} ${p.name} - Standup*\n` +
        `• Yesterday: ${p.yesterday}\n` +
        `• Today: ${p.today}\n` +
        (p.hasBlocker ? `• ⚠️ BLOCKER: ${p.blockers}` : `• No blockers`)
    ).join('\n\n---\n\n');

    navigator.clipboard.writeText(report).then(() => {
        alert("Daily report copied to clipboard!");
    });
});

function deletePost(id) {
    standups = standups.filter(p => p.id !== id);
    saveAndRefresh();
}

document.getElementById('clear-all').addEventListener('click', () => {
    if(confirm("Clear all updates?")) {
        standups = [];
        saveAndRefresh();
    }
});

function saveAndRefresh() {
    localStorage.setItem('proStandups', JSON.stringify(standups));
    renderFeed();
}

renderFeed();