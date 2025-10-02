document.addEventListener('DOMContentLoaded', () => {

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

    const screens = { auth: document.getElementById('auth-screen'), mainMenu: document.getElementById('main-menu'), levelSelect: document.getElementById('level-select-screen'), game: document.getElementById('game-screen'), stats: document.getElementById('stats-screen'), settings: document.getElementById('settings-screen') };
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
            levelCompleted: '¡Correcto! Nivel Completado.', incorrect: 'Incorrecto. ¡Sigue intentando!',
            fillAllFields: 'Por favor, rellena todas las casillas.',
            gamesCompleted: 'Juegos Completados: {count}', successRate: 'Tasa de Éxito: {rate}%',
            selectLevel: 'Selecciona un Nivel', easy: 'Fácil', medium: 'Medio', hard: 'Difícil', expert: 'Experto',
            check: 'Comprobar', removeAds: 'Eliminar Anuncios',
            premiumPurchased: '¡Membresía Premium activada! Gracias por tu apoyo.', adSupported: 'Con Anuncios',
            loginToActivate: '¡Compra detectada! Por favor, inicia sesión para activar tu membresía.',
            loginTitle: 'Iniciar Sesión', registerTitle: 'Crear Cuenta', loginButton: 'Iniciar Sesión', registerButton: 'Registrarme',
            loginSwitch: '¿No tienes cuenta? Regístrate', registerSwitch: '¿Ya tienes cuenta? Inicia Sesión',
            welcome: '¡Hola, {user}!', accountManagement: 'Gestión de Cuenta',
            deleteAccount: 'Eliminar Cuenta Permanentemente', currentUser: 'Sesión activa: {user}',
            deleteConfirm: '¿Seguro? Esta acción es PERMANENTE.', deleteSuccess: 'Tu cuenta ha sido eliminada.',
            reimbursementNote: 'NOTA: Eliminar la cuenta no genera un reembolso.',
            purchaseInstruction: 'Usa el MISMO correo en la compra que en el juego.',
            syncError: 'Error: El PIN debe ser de 6 dígitos.', syncSuccessExport: 'ÉXITO: Progreso guardado con PIN {pin}.',
            syncSuccessImport: 'ÉXITO: Datos cargados. La página se actualizará.', syncErrorNotFound: 'ERROR: No se encontró PIN.',
            syncErrorUserMismatch: 'ERROR: El PIN no corresponde a este usuario.',
            adMessage: 'Patrocinado: Espera unos segundos...', skipAdButton: 'Continuar'
        },
        en: { /* English translations */ }
    };

    function setLanguage(lang) { /* ...código sin cambios... */ }
    function switchScreen(screenId) { /* ...código sin cambios... */ }
    function updateUI() { /* ...código sin cambios... */ }
    function checkPaymentStatus() { /* ...código sin cambios... */ }
    function saveGameState() { /* ...código sin cambios... */ }
    function getLocalAccountData(email) { /* ...código sin cambios... */ }
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
    function generatePuzzle(difficulty) { /* ...código sin cambios... */ }
    function renderBoard() { /* ...código sin cambios... */ }
    function showAd() { /* ...código sin cambios... */ }

    // --- FUNCIÓN DE VALIDACIÓN CON DEPURACIÓN ---
    function checkSolution() {
        const t = translations[currentLang] || translations.es;
        let allFilled = true;
        const userBoard = gameState.boardState.map(row => {
            return row.map(cell => {
                if (cell.type === 'input') {
                    if (cell.val === '') allFilled = false;
                    return Number(cell.val);
                }
                return cell.val;
            });
        });

        if (!allFilled) {
            elements.resultMessage.textContent = t.fillAllFields;
            return;
        }

        let debugMessage = "--- REVISIÓN MATEMÁTICA ---\n";
        const equations = [];

        // Ecuaciones Horizontales
        equations.push({ name: `Fila 1: ${userBoard[0][0]} ${userBoard[0][1]} ${userBoard[0][2]} = ${userBoard[0][4]}`, result: safeCalculate(userBoard[0][0], userBoard[0][1], userBoard[0][2]) === userBoard[0][4] });
        equations.push({ name: `Fila 2: ${userBoard[2][0]} ${userBoard[2][1]} ${userBoard[2][2]} = ${userBoard[2][4]}`, result: safeCalculate(userBoard[2][0], userBoard[2][1], userBoard[2][2]) === userBoard[2][4] });
        equations.push({ name: `Fila 3: ${userBoard[4][0]} ${userBoard[4][1]} ${userBoard[4][2]} = ${userBoard[4][4]}`, result: safeCalculate(userBoard[4][0], userBoard[4][1], userBoard[4][2]) === userBoard[4][4] });
        
        // Ecuaciones Verticales
        equations.push({ name: `Col 1: ${userBoard[0][0]} ${userBoard[1][0]} ${userBoard[2][0]} = ${userBoard[4][0]}`, result: safeCalculate(userBoard[0][0], userBoard[1][0], userBoard[2][0]) === userBoard[4][0] });
        equations.push({ name: `Col 2: ${userBoard[0][2]} ${userBoard[1][2]} ${userBoard[2][2]} = ${userBoard[4][2]}`, result: safeCalculate(userBoard[0][2], userBoard[1][2], userBoard[2][2]) === userBoard[4][2] });
        equations.push({ name: `Col 3: ${userBoard[0][4]} ${userBoard[1][4]} ${userBoard[2][4]} = ${userBoard[4][4]}`, result: safeCalculate(userBoard[0][4], userBoard[1][4], userBoard[2][4]) === userBoard[4][4] });

        let isCorrect = true;
        equations.forEach(eq => {
            debugMessage += `${eq.name} -> ${eq.result ? '✅ CORRECTO' : '❌ INCORRECTO'}\n`;
            if (!eq.result) {
                isCorrect = false;
            }
        });

        if (isCorrect) {
            elements.resultMessage.textContent = t.levelCompleted;
            gameState.stats.gamesCompleted++;
            gameState.stats.gamesCorrect++;
            gameState.boardState = [];
            saveGameState();
            updateUI();
            setTimeout(() => {
                elements.resultMessage.textContent = '';
                showAd();
            }, 1500);
        } else {
            elements.resultMessage.textContent = t.incorrect;
            console.log(debugMessage); // ESTA LÍNEA IMPRIME EL REPORTE EN LA CONSOLA
            alert("La validación falló. Por favor, abre la consola (F12) para ver el detalle del error y envíame una captura de ese reporte.");
        }
    }
    
    function loadInitialState() { /* ...código sin cambios... */ }

    // --- EVENT LISTENERS ---
    elements.authForm.addEventListener('submit', (e) => { e.preventDefault(); const email = elements.authEmail.value; const password = elements.authPassword.value; if (currentAuthMode === 'login') { const userData = getLocalAccountData(email); if (userData && userData.password === password) { currentUserID = email; gameState = userData.gameState; localStorage.setItem('crossmath_last_user', email); saveGameState(); switchScreen('mainMenu'); checkPaymentStatus(); } else { elements.authStatusMessage.textContent = translations[currentLang].authFailed; } } else { if (getLocalAccountData(email)) { elements.authStatusMessage.textContent = translations[currentLang].userExists; } else { const newGameState = { stats: { gamesCompleted: 0, gamesCorrect: 0, totalTime: 0 }, isPremium: false, boardState: [], solution: [], difficulty: 'easy' }; const newUser = { password: password, gameState: newGameState }; localStorage.setItem(USER_DATA_PREFIX + email, JSON.stringify(newUser)); elements.authStatusMessage.textContent = translations[currentLang].registrationSuccess; currentAuthMode = 'login'; updateUI(); } } });
    elements.settingsButton.addEventListener('click', () => switchScreen('settings'));
    elements.statsButton.addEventListener('click', () => switchScreen('stats'));
    elements.playButton.addEventListener('click', () => switchScreen('levelSelect'));
    elements.logoutButton.addEventListener('click', () => { saveGameState(); currentUserID = null; gameState = { stats: { gamesCompleted: 0, gamesCorrect: 0, totalTime: 0 }, isPremium: false, boardState: [], solution: [], difficulty: 'easy' }; localStorage.removeItem('crossmath_last_user'); switchScreen('auth'); });
    elements.backFromLevelsButton.addEventListener('click', () => switchScreen('mainMenu'));
    elements.backFromStatsButton.addEventListener('click', () => switchScreen('mainMenu'));
    elements.backFromSettingsButton.addEventListener('click', () => switchScreen('mainMenu'));
    elements.backToMenuButton.addEventListener('click', () => switchScreen('levelSelect'));
    elements.levelButtons.forEach(btn => btn.addEventListener('click', () => generatePuzzle(btn.dataset.difficulty)));
    elements.checkButton.addEventListener('click', checkSolution);

    loadInitialState();
});


