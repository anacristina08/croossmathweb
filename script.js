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
            loginToActivate: '¡Compra detectada! Por favor, inicia sesión o crea una cuenta para activar tu membresía Premium.',
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
        // ... (resto de la función sin cambios)
        updateUI();
    }

    function switchScreen(screenId) {
        Object.values(screens).forEach(s => s.classList.remove('active'));
        screens[screenId].classList.add('active');
    }

    function updateUI() {
        const t = translations[currentLang] || translations.es;
        // ... (resto de la función sin cambios)
    }
    
    // --- LÓGICA DE ACTIVACIÓN PREMIUM (NUEVA VERSIÓN) ---
    function checkPaymentStatus() {
        const urlParams = new URLSearchParams(window.location.search);
        const paymentConfirmed = urlParams.get('premium');
        const t = translations[currentLang] || translations.es;

        if (paymentConfirmed === 'true') {
            // Si hay un usuario logueado, activamos Premium para él.
            if (currentUserID) {
                if (!gameState.isPremium) {
                    gameState.isPremium = true;
                    saveGameState();
                    alert(t.premiumPurchased);
                    updateUI();
                }
            } 
            // Si NO hay nadie logueado, mostramos un mensaje en la pantalla de login.
            else {
                elements.authStatusMessage.textContent = t.loginToActivate;
                switchScreen('auth');
            }
            
            // Limpiamos la URL para no volver a activar el mensaje en cada recarga.
            window.history.replaceState({}, document.title, window.location.pathname);
        }
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
        checkPaymentStatus(); // Se llama después de cargar el estado inicial del usuario
    }
    
    // ... (El resto de las funciones como generatePuzzle, renderBoard, etc., se mantienen igual)

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
                
                saveGameState();
                switchScreen('mainMenu');
                updateUI();
                
                // Después de iniciar sesión, volvemos a comprobar por si veníamos de un enlace de pago.
                checkPaymentStatus();

            } else { elements.authStatusMessage.textContent = t.authFailed; }
        } else {
            // ... (lógica de registro sin cambios)
        }
    });

    // ... (Resto de los event listeners sin cambios)
    elements.premiumButton.addEventListener('click', () => {
        window.open(GUMROAD_PAYMENT_URL, '_blank');
    });
    // ...

    loadInitialState();
});
