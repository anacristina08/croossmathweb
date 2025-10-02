const firebaseConfig = {
    apiKey: "AIzaSyCKIUkOfSMOLIhuYcQ30rm1Uc6hg8MFJ04",
    authDomain: "crossmath-sync-db.firebaseapp.com",
    projectId: "crossmath-sync-db",
    storageBucket: "crossmath-sync-db.appspot.com",
    messagingSenderId: "170459630175",
    appId: "1:170459630175:web:6a2a4ccba5dad1fa0ee9ea",
    measurementId: "G-BBJKKN96SV"
};
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const GUMROAD_PAYMENT_URL = "https://anacristinacz.gumroad.com/l/rnlle";
const USER_DATA_PREFIX = 'crossmath_user_';

let currentUserID = null;
let currentAuthMode = 'login';
let currentLang = 'es';
let gameState = {
    stats: { gamesCompleted: 0, gamesCorrect: 0, totalTime: 0 },
    isPremium: false,
    boardState: [],
    solution: [],
    difficulty: 'easy'
};

const screens = {
    auth: document.getElementById('auth-screen'),
    mainMenu: document.getElementById('main-menu'),
    levelSelect: document.getElementById('level-select-screen'),
    game: document.getElementById('game-screen'),
    stats: document.getElementById('stats-screen'),
    settings: document.getElementById('settings-screen')
};

const elements = {
    title: document.getElementById('title'), authTitle: document.getElementById('auth-title'),
    authStatusMessage: document.getElementById('auth-status-message'), authForm: document.getElementById('auth-form'),
    authEmail: document.getElementById('auth-email'), authPassword: document.getElementById('auth-password'),
    authSubmitButton: document.getElementById('auth-submit-button'), switchAuthModeButton: document.getElementById('switch-auth-mode-button'),
    welcomeMessage: document.getElementById('welcome-message'), playButton: document.getElementById('play-button'),
    statsButton: document.getElementById('stats-button'), settingsButton: document.getElementById('settings-button'),
    logoutButton: document.getElementById('logout-button'), levelSelectTitle: document.getElementById('level-select-title'),
    levelButtons: document.querySelectorAll('.level-button'), gameBoard: document.getElementById('game-board'),
    resultMessage: document.getElementById('result-message'), checkButton: document.getElementById('check-button'),
    statsTitle: document.getElementById('stats-title'), gamesCompleted: document.getElementById('games-completed'),
    successRate: document.getElementById('success-rate'), languageSelect: document.getElementById('language-select'),
    purchaseInstruction: document.getElementById('purchase-instruction'), premiumButton: document.getElementById('premium-button'),
    premiumStatus: document.getElementById('premium-status'), syncInput: document.getElementById('sync-input'),
    exportButton: document.getElementById('export-button'), importButton: document.getElementById('import-button'),
    syncMessage: document.getElementById('sync-message'), accountManagementTitle: document.getElementById('account-management-title'),
    currentUserDisplay: document.getElementById('current-user-display'), deleteAccountButton: document.getElementById('delete-account-button'),
    reimbursementNote: document.getElementById('reimbursement-note'), adPopup: document.getElementById('ad-popup'),
    adMessage: document.getElementById('ad-message'), realAdContainer: document.getElementById('real-ad-container'),
    skipAdButton: document.getElementById('skip-ad-button'),
    backToMenuButton: document.getElementById('back-to-menu-button'), backFromLevelsButton: document.getElementById('back-from-levels-button'),
    backFromStatsButton: document.getElementById('back-from-stats-button'), backFromSettingsButton: document.getElementById('back-from-settings-button')
};

const translations = {
    es: {
        mainMenu: 'Menú Principal', play: 'Jugar', viewStats: 'Estadísticas', settings: 'Ajustes',
        levelCompleted: '¡Nivel Completado!', incorrect: 'Incorrecto. ¡Sigue intentando!',
        fillAllFields: 'Por favor, rellena todas las casillas.',
        gamesCompleted: 'Juegos Completados: {count}', successRate: 'Tasa de Éxito: {rate}%',
        selectLevel: 'Selecciona un Nivel', easy: 'Fácil', medium: 'Medio', hard: 'Difícil', expert: 'Experto',
        check: 'Comprobar', removeAds: 'Eliminar Anuncios',
        premiumPurchased: '¡Premium Activo! Disfruta sin anuncios.', adSupported: 'Con Anuncios',
        loginTitle: 'Iniciar Sesión', registerTitle: 'Crear Cuenta', loginButton: 'Iniciar Sesión',
        registerButton: 'Registrarme', loginSwitch: '¿No tienes cuenta? Regístrate',
        registerSwitch: '¿Ya tienes cuenta? Inicia Sesión', authSuccess: '¡Bienvenido(a)!',
        authFailed: 'Credenciales inválidas.', userExists: 'El correo ya está registrado.',
        registrationSuccess: 'Cuenta creada. ¡Inicia Sesión!', logout: 'Cerrar Sesión',
        welcome: '¡Hola, {user}!', accountManagement: 'Gestión de Cuenta',
        deleteAccount: 'Eliminar Cuenta Permanentemente', currentUser: 'Sesión activa: {user}',
        deleteConfirm: '¿Estás seguro de que quieres ELIMINAR tu cuenta? Esta acción es PERMANENTE y borrará todo tu progreso.',
        deleteSuccess: 'Tu cuenta ha sido eliminada.',
        reimbursementNote: 'NOTA: La eliminación de la cuenta no conlleva el reembolso de la membresía Premium.',
        purchaseInstruction: 'Para activar Premium, la compra debe hacerse con el MISMO correo que usas en el juego.',
        syncError: 'Error: El PIN debe tener 6 dígitos y la cuenta debe estar activa.',
        syncSuccessExport: 'ÉXITO: Progreso guardado en la nube con PIN {pin}.',
        syncSuccessImport: 'ÉXITO: Datos cargados. La página se actualizará.',
        syncErrorNotFound: 'ERROR: No se encontraron datos para ese PIN o el PIN es incorrecto.',
        syncErrorUserMismatch: 'ERROR: Los datos de este PIN no corresponden a tu usuario actual.',
        adMessage: 'Patrocinado: Espera unos segundos...', skipAdButton: 'Continuar'
    },
    en: { 
        mainMenu: 'Main Menu', play: 'Play', viewStats: 'Statistics', settings: 'Settings',
        levelCompleted: 'Level Completed!', incorrect: 'Incorrect. Keep trying!',
        fillAllFields: 'Please fill all fields.',
        gamesCompleted: 'Games Completed: {count}', successRate: 'Success Rate: {rate}%',
        selectLevel: 'Select a Level', easy: 'Easy', medium: 'Medium', hard: 'Hard', expert: 'Expert',
        check: 'Check', removeAds: 'Remove Ads',
        premiumPurchased: 'Premium Active! Enjoy ad-free.', adSupported: 'Ad Supported',
        loginTitle: 'Login', registerTitle: 'Create Account', loginButton: 'Login',
        registerButton: 'Register', loginSwitch: "Don't have an account? Register",
        registerSwitch: 'Already have an account? Login', authSuccess: 'Welcome!',
        authFailed: 'Invalid credentials.', userExists: 'Email already registered.',
        registrationSuccess: 'Account created. Please log in!', logout: 'Logout',
        welcome: 'Hello, {user}!', accountManagement: 'Account Management',
        deleteAccount: 'Permanently Delete Account', currentUser: 'Active session: {user}',
        deleteConfirm: 'Are you sure you want to DELETE your account? This action is PERMANENT and will erase all your progress.',
        deleteSuccess: 'Your account has been deleted.',
        reimbursementNote: 'NOTE: Deleting your account does not issue a refund for the Premium membership.',
        purchaseInstruction: 'To activate Premium, the purchase must be made with the SAME email you use in the game.',
        syncError: 'Error: PIN must be 6 digits and account must be active.',
        syncSuccessExport: 'SUCCESS: Progress saved to the cloud with PIN {pin}.',
        syncSuccessImport: 'SUCCESS: Data loaded. The page will refresh.',
        syncErrorNotFound: 'ERROR: No data found for that PIN or the PIN is incorrect.',
        syncErrorUserMismatch: "ERROR: This PIN's data does not match your current user.",
        adMessage: 'Sponsored: Please wait a few seconds...', skipAdButton: 'Continue'
     }
};

function setLanguage(lang) {
    currentLang = lang;
    const t = translations[lang] || translations.es;
    elements.title.textContent = t.mainMenu;
    elements.playButton.textContent = t.play;
    elements.statsButton.textContent = t.viewStats;
    elements.settingsButton.textContent = t.settings;
    elements.levelSelectTitle.textContent = t.selectLevel;
    elements.levelButtons.forEach(btn => btn.textContent = t[btn.dataset.difficulty]);
    elements.checkButton.textContent = t.check;
    elements.statsTitle.textContent = t.viewStats;
    elements.premiumButton.textContent = t.removeAds;
    elements.logoutButton.textContent = t.logout;
    elements.accountManagementTitle.textContent = t.accountManagement;
    elements.deleteAccountButton.textContent = t.deleteAccount;
    elements.reimbursementNote.textContent = t.reimbursementNote;
    elements.purchaseInstruction.textContent = t.purchaseInstruction;
    elements.adMessage.textContent = t.adMessage;
    elements.skipAdButton.textContent = t.skipAdButton;
    updateUI();
}

function switchScreen(screenId) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[screenId].classList.add('active');
}

function updateUI() {
    const t = translations[currentLang] || translations.es;
    elements.authTitle.textContent = currentAuthMode === 'login' ? t.loginTitle : t.registerTitle;
    elements.authSubmitButton.textContent = currentAuthMode === 'login' ? t.loginButton : t.registerButton;
    elements.switchAuthModeButton.textContent = currentAuthMode === 'login' ? t.loginSwitch : t.registerSwitch;
    if (currentUserID) {
        elements.welcomeMessage.textContent = t.welcome.replace('{user}', currentUserID.split('@')[0]);
        elements.currentUserDisplay.textContent = t.currentUser.replace('{user}', currentUserID);
    }
    elements.premiumStatus.textContent = gameState.isPremium ? t.premiumPurchased : t.adSupported;
    elements.premiumButton.style.display = gameState.isPremium ? 'none' : 'block';
    elements.gamesCompleted.textContent = t.gamesCompleted.replace('{count}', gameState.stats.gamesCompleted);
    const rate = gameState.stats.gamesCompleted > 0 ? ((gameState.stats.gamesCorrect / gameState.stats.gamesCompleted) * 100).toFixed(0) : '0';
    elements.successRate.textContent = t.successRate.replace('{rate}', rate);
}

function safeCalculate(n1, op, n2) {
    n1 = Number(n1); n2 = Number(n2);
    switch (op) {
        case '+': return n1 + n2;
        case '-': return n1 - n2;
        case '*': return n1 * n2;
        case '/': return n2 !== 0 ? n1 / n2 : NaN;
        default: return NaN;
    }
}

function generatePuzzle(difficulty) {
    gameState.difficulty = difficulty;
    const numberRange = difficulty === 'hard' || difficulty === 'expert' ? [10, 50] : [1, 10];
    const allowedOps = difficulty === 'easy' ? ['+', '-'] : ['+', '-', '*', '/'];
    const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    
    let validSolutionFound = false;
    let finalSolution;
    let attempts = 0;
    while (!validSolutionFound && attempts < 500) {
        attempts++;
        try {
            let h1_n1 = getRandomInt(numberRange[0], numberRange[1]);
            let h1_op = allowedOps[getRandomInt(0, allowedOps.length - 1)];
            let h1_n2 = getRandomInt(numberRange[0], numberRange[1]);
            let h1_res = safeCalculate(h1_n1, h1_op, h1_n2);
            if (!Number.isInteger(h1_res) || h1_res < 0) continue;

            let h2_n1 = getRandomInt(numberRange[0], numberRange[1]);
            let h2_op = allowedOps[getRandomInt(0, allowedOps.length - 1)];
            let h2_n2 = getRandomInt(numberRange[0], numberRange[1]);
            let h2_res = safeCalculate(h2_n1, h2_op, h2_n2);
            if (!Number.isInteger(h2_res) || h2_res < 0) continue;
            
            let v1_op = allowedOps[getRandomInt(0, allowedOps.length - 1)];
            let v1_res = safeCalculate(h1_n1, v1_op, h2_n1);
            if (!Number.isInteger(v1_res) || v1_res < 0) continue;

            let v2_op = allowedOps[getRandomInt(0, allowedOps.length - 1)];
            let v2_res = safeCalculate(h1_n2, v2_op, h2_n2);
            if (!Number.isInteger(v2_res) || v2_res < 0) continue;

            let v3_op = allowedOps[getRandomInt(0, allowedOps.length - 1)];
            let v3_res = safeCalculate(h1_res, v3_op, h2_res);
            if (!Number.isInteger(v3_res) || v3_res < 0) continue;

            let h3_op = allowedOps[getRandomInt(0, allowedOps.length - 1)];
            let h3_res_check = safeCalculate(v1_res, h3_op, v2_res);

            if (h3_res_check === v3_res) {
                finalSolution = [
                    [h1_n1, h1_op, h1_n2, '=', h1_res],
                    [v1_op, '', v2_op, '', v3_op],
                    [h2_n1, h2_op, h2_n2, '=', h2_res],
                    ['=', '', '=', '', '='],
                    [v1_res, h3_op, v2_res, '=', v3_res]
                ];
                validSolutionFound = true;
            }
        } catch(e) { /* ignore and retry */ }
    }
    
    if (!validSolutionFound) {
         finalSolution = [
            [1, '+', 2, '=', 3], ['+', '', '+', '', '+'], [4, '+', 5, '=', 9],
            ['=', '', '=', '', '='], [5, '+', 7, '=', 12]
        ];
    }
    gameState.solution = finalSolution;

    const inputsToHide = difficulty === 'expert' ? 6 : difficulty === 'hard' ? 5 : difficulty === 'medium' ? 4 : 3;
    const numberCells = [
        {r:0,c:0},{r:0,c:2},{r:0,c:4},
        {r:2,c:0},{r:2,c:2},{r:2,c:4},
        {r:4,c:0},{r:4,c:2},{r:4,c:4}
    ];
    numberCells.sort(() => 0.5 - Math.random());
    const inputPositions = numberCells.slice(0, inputsToHide);

    gameState.boardState = gameState.solution.map((row, r) => {
        return row.map((cell, c) => {
            const isInput = inputPositions.some(pos => pos.r === r && pos.c === c);
            if (isInput) return { type: 'input', val: '' };
            if (typeof cell === 'number') return { type: 'given', val: cell };
            if (cell === '=') return { type: 'equals', val: '=' };
            if (typeof cell === 'string' && cell.trim() !== '') return { type: 'op', val: cell };
            return { type: 'empty' };
        });
    });

    renderBoard();
    switchScreen('game');
}

function renderBoard() {
    elements.gameBoard.innerHTML = '';
    elements.gameBoard.style.gridTemplateColumns = `repeat(5, 50px)`;
    gameState.boardState.forEach((row, r) => {
        row.forEach((cell, c) => {
            const cellEl = document.createElement('div');
            cellEl.classList.add('cell');
            if (cell.type === 'input') {
                const input = document.createElement('input');
                input.type = 'number';
                input.value = cell.val;
                input.addEventListener('input', (e) => {
                    gameState.boardState[r][c].val = e.target.value;
                });
                cellEl.classList.add('empty');
                cellEl.appendChild(input);
            } else if (cell.type !== 'empty') {
                cellEl.textContent = cell.val;
                cellEl.classList.add(cell.type);
            } else {
                cellEl.style.visibility = 'hidden';
            }
            elements.gameBoard.appendChild(cellEl);
        });
    });
}

function checkSolution() {
    const t = translations[currentLang];
    let allFilled = true;
    let userSolution = [];

    gameState.boardState.forEach((row, r) => {
        let userRow = [];
        row.forEach((cell, c) => {
            let val = cell.val;
            if (cell.type === 'input') {
                if(cell.val === '') allFilled = false;
                val = Number(cell.val);
            }
            userRow.push(val);
        });
        userSolution.push(userRow);
    });

    if (!allFilled) {
        elements.resultMessage.textContent = t.fillAllFields;
        return;
    }

    const isCorrect = JSON.stringify(userSolution) === JSON.stringify(gameState.solution);

    if (isCorrect) {
        elements.resultMessage.textContent = t.levelCompleted;
        gameState.stats.gamesCompleted++;
        gameState.stats.gamesCorrect++;
        gameState.boardState = [];
        gameState.solution = [];
        saveGameState();
        updateUI();
        setTimeout(() => {
            elements.resultMessage.textContent = '';
            showAd();
        }, 1500);
    } else {
        elements.resultMessage.textContent = t.incorrect;
    }
}

function showAd() {
    if (gameState.isPremium) {
        switchScreen('levelSelect');
        return;
    }
    elements.adPopup.style.display = 'flex';
    try {
        elements.realAdContainer.innerHTML = '<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-6018346455368636" data-ad-format="auto" data-full-width-responsive="true"></ins>';
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch(e) { console.error("AdSense error:", e); }
    
    const skipTimer = setTimeout(() => elements.skipAdButton.click(), 8000);
    elements.skipAdButton.onclick = () => {
        clearTimeout(skipTimer);
        elements.adPopup.style.display = 'none';
        elements.realAdContainer.innerHTML = '';
        switchScreen('levelSelect');
    };
}

function saveGameState() {
    if (!currentUserID) return;
    const accountData = getLocalAccountData(currentUserID);
    if (accountData) {
        const updatedData = { ...accountData, gameState: gameState };
        localStorage.setItem(USER_DATA_PREFIX + currentUserID, JSON.stringify(updatedData));
    }
}

function getLocalAccountData(email) {
    const data = localStorage.getItem(USER_DATA_PREFIX + email);
    return data ? JSON.parse(data) : null;
}

function loadInitialState() {
    const lastUser = localStorage.getItem('crossmath_last_user');
    if (lastUser) {
        const userData = getLocalAccountData(lastUser);
        if (userData) {
            currentUserID = lastUser;
            gameState = userData.gameState;
            switchScreen('mainMenu');
        } else { switchScreen('auth'); }
    } else { switchScreen('auth'); }
    setLanguage(elements.languageSelect.value);
}

elements.authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = elements.authEmail.value;
    const password = elements.authPassword.value;
    const t = translations[currentLang];

    if (currentAuthMode === 'login') {
        const userData = getLocalAccountData(email);
        if (userData && userData.password === password) {
            currentUserID = email;
            gameState = userData.gameState;
            localStorage.setItem('crossmath_last_user', email);
            switchScreen('mainMenu');
            updateUI();
        } else { elements.authStatusMessage.textContent = t.authFailed; }
    } else {
        if (getLocalAccountData(email)) {
            elements.authStatusMessage.textContent = t.userExists;
        } else {
            const newGameState = { stats: { gamesCompleted: 0, gamesCorrect: 0, totalTime: 0 }, isPremium: false, boardState: [], solution: [], difficulty: 'easy' };
            const newUser = { password: password, gameState: newGameState };
            localStorage.setItem(USER_DATA_PREFIX + email, JSON.stringify(newUser));
            elements.authStatusMessage.textContent = t.registrationSuccess;
            currentAuthMode = 'login';
            updateUI();
        }
    }
});

elements.switchAuthModeButton.addEventListener('click', () => {
    currentAuthMode = currentAuthMode === 'login' ? 'register' : 'login';
    elements.authStatusMessage.textContent = '';
    updateUI();
});

elements.logoutButton.addEventListener('click', () => {
    saveGameState();
    currentUserID = null;
    localStorage.removeItem('crossmath_last_user');
    gameState = { stats: { gamesCompleted: 0, gamesCorrect: 0, totalTime: 0 }, isPremium: false, boardState: [], solution: [], difficulty: 'easy' };
    switchScreen('auth');
});

elements.deleteAccountButton.addEventListener('click', () => {
    const t = translations[currentLang];
    if (currentUserID && confirm(t.deleteConfirm)) {
        localStorage.removeItem(USER_DATA_PREFIX + currentUserID);
        alert(t.deleteSuccess);
        elements.logoutButton.click();
    }
});

elements.exportButton.addEventListener('click', async () => {
    const pin = elements.syncInput.value;
    const t = translations[currentLang];
    if (!currentUserID || !pin || pin.length !== 6) {
        elements.syncMessage.textContent = t.syncError;
        elements.syncMessage.style.display = 'block';
        return;
    }
    try {
        await db.collection("SyncCodes").doc(pin).set({ userId: currentUserID, gameState: gameState });
        elements.syncMessage.textContent = t.syncSuccessExport.replace('{pin}', pin);
        elements.syncMessage.style.display = 'block';
    } catch (e) { console.error(e); }
});

elements.importButton.addEventListener('click', async () => {
    const pin = elements.syncInput.value;
    const t = translations[currentLang];
    if (!currentUserID || !pin || pin.length !== 6) {
        elements.syncMessage.textContent = t.syncError;
        elements.syncMessage.style.display = 'block';
        return;
    }
    try {
        const doc = await db.collection("SyncCodes").doc(pin).get();
        if (!doc.exists) {
            elements.syncMessage.textContent = t.syncErrorNotFound;
            elements.syncMessage.style.display = 'block';
            return;
        }
        const data = doc.data();
        if (data.userId !== currentUserID) {
            elements.syncMessage.textContent = t.syncErrorUserMismatch;
            elements.syncMessage.style.display = 'block';
            return;
        }
        gameState = data.gameState;
        saveGameState();
        alert(t.syncSuccessImport);
        window.location.reload();
    } catch(e) { console.error(e); }
});

elements.playButton.addEventListener('click', () => {
    if (gameState.boardState.length > 0) {
        switchScreen('game');
    } else {
        switchScreen('levelSelect');
    }
});
elements.statsButton.addEventListener('click', () => switchScreen('stats'));
elements.settingsButton.addEventListener('click', () => switchScreen('settings'));
elements.checkButton.addEventListener('click', checkSolution);
elements.levelButtons.forEach(btn => btn.addEventListener('click', () => generatePuzzle(btn.dataset.difficulty)));
elements.backToMenuButton.addEventListener('click', () => switchScreen('levelSelect'));
elements.backFromLevelsButton.addEventListener('click', () => switchScreen('mainMenu'));
elements.backFromStatsButton.addEventListener('click', () => switchScreen('mainMenu'));
elements.backFromSettingsButton.addEventListener('click', () => switchScreen('mainMenu'));
elements.languageSelect.addEventListener('change', (e) => setLanguage(e.target.value));

loadInitialState();
