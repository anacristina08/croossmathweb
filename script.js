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
            premiumPurchased: '¡Membresía Premium activada! Gracias por tu apoyo.', adSupported: 'Con Anuncios',
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
        en: { /* ... English translations ... */ }
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

    // --- FUNCIÓN DE VERIFICACIÓN DE PAGO (RESTAURADA) ---
    function checkPaymentStatus() {
        const urlParams = new URLSearchParams(window.location.search);
        const paymentConfirmed = urlParams.get('premium');
        const purchaseEmail = urlParams.get('user');
        const t = translations[currentLang] || translations.es;

        if (paymentConfirmed === 'true' && purchaseEmail) {
            // Si el usuario correcto ya está logueado, activamos Premium.
            if (currentUserID && currentUserID === purchaseEmail) {
                gameState.isPremium = true;
                saveGameState();
                alert(t.premiumPurchased);
                updateUI();
            } 
            // Si nadie está logueado, guardamos el email para activarlo después.
            else if (!currentUserID) {
                localStorage.setItem('crossmath_pending_premium_user', purchaseEmail);
                alert(`¡Compra detectada! Por favor, inicia sesión con el correo ${purchaseEmail} para activar el Premium.`);
            }
            
            // Limpiamos la URL para no volver a activar el mensaje en cada recarga.
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    function safeCalculate(n1, op, n2) {
        n1 = Number(n1); n2 = Number(n2);
        switch (op) {
            case '+': return n1 + n2; case '-': return n1 - n2;
            case '*': return n1 * n2; case '/': return n2 !== 0 ? n1 / n2 : NaN;
            default: return NaN;
        }
    }

    function generatePuzzle(difficulty) { /* ...código de la función sin cambios... */ }
    function renderBoard() { /* ...código de la función sin cambios... */ }
    function checkSolution() { /* ...código de la función sin cambios... */ }
    function showAd() { /* ...código de la función sin cambios... */ }

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
        checkPaymentStatus(); // <-- SE LLAMA A LA FUNCIÓN AL CARGAR LA PÁGINA

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

                // --- LÓGICA DE ACTIVACIÓN AL INICIAR SESIÓN ---
                const pendingUser = localStorage.getItem('crossmath_pending_premium_user');
                if (pendingUser === email) {
                    gameState.isPremium = true;
                    localStorage.removeItem('crossmath_pending_premium_user');
                    alert(t.premiumPurchased);
                }
                
                saveGameState();
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

    elements.switchAuthModeButton.addEventListener('click', () => { /* ...código sin cambios... */ });
    elements.logoutButton.addEventListener('click', () => { /* ...código sin cambios... */ });
    elements.deleteAccountButton.addEventListener('click', () => { /* ...código sin cambios... */ });
    elements.exportButton.addEventListener('click', async () => { /* ...código sin cambios... */ });
    elements.importButton.addEventListener('click', async () => { /* ...código sin cambios... */ });
    elements.playButton.addEventListener('click', () => { /* ...código sin cambios... */ });
    elements.premiumButton.addEventListener('click', () => { window.open(GUMROAD_PAYMENT_URL, '_blank'); });
    elements.statsButton.addEventListener('click', () => switchScreen('stats'));
    elements.settingsButton.addEventListener('click', () => switchScreen('settings'));
    elements.checkButton.addEventListener('click', checkSolution);
    elements.levelButtons.forEach(btn => btn.addEventListener('click', () => generatePuzzle(btn.dataset.difficulty)));
    elements.backToMenuButton.addEventListener('click', () => switchScreen('levelSelect'));
    elements.backFromLevelsButton.addEventListener('click', () => switchScreen('mainMenu'));
    elements.backFromStatsButton.addEventListener('click', () => switchScreen('mainMenu'));
    elements.backFromSettingsButton.addEventListener('click', () => switchScreen('mainMenu'));
    elements.languageSelect.addEventListener('change', (e) => setLanguage(e.target.value));

    // --- INICIALIZACIÓN DEL JUEGO ---
    loadInitialState();
});
