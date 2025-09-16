// Firebase SDK modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    updatePassword
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import {
    getFirestore,
    collection,
    doc,
    setDoc,
    getDoc,
    deleteDoc,
    query,
    where,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";


// --- Firebase Configuration ---
// IMPORTANT: Replace this with your actual Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyCed8mBXQ-bPsR3GntjW0QGXjaTV11E2jE",
    authDomain: "gym-manage-c08e0.firebaseapp.com",
    projectId: "gym-manage-c08e0",
    storageBucket: "gym-manage-c08e0.firebasestorage.app",
    messagingSenderId: "920006709226",
    appId: "1:920006709226:web:70312b8845d3173a896c93",
    measurementId: "G-11YJPE4H9V"
  };

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- DOM Elements ---
const loginSection = document.getElementById('login-section');
const dashboard = document.getElementById('dashboard');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('error-message');
const welcomeMessage = document.getElementById('welcome-message');

// Views
const adminView = document.getElementById('admin-view');
const memberView = document.getElementById('member-view');

// Admin Elements
const memberForm = document.getElementById('member-form');
const memberFormTitle = document.getElementById('member-form-title');
const memberIdInput = document.getElementById('member-id');
const memberNameInput = document.getElementById('member-name');
const memberEmailInput = document.getElementById('member-email');
const feePackageInput = document.getElementById('fee-package');
const submitMemberBtn = document.getElementById('submit-member-btn');
const cancelUpdateBtn = document.getElementById('cancel-update-btn');
const memberList = document.getElementById('member-list');

// Member Elements
const billReceipts = document.getElementById('bill-receipts');
const notifications = document.getElementById('notifications');
const dietPlanView = document.getElementById('diet-plan-view');
const supplementStore = document.getElementById('supplement-store');
const changePasswordBtn = document.getElementById('change-password-btn');


// Modal Elements
const customModal = document.getElementById('custom-modal');
const modalTitle = document.getElementById('modal-title');
const modalText = document.getElementById('modal-text');
const modalConfirmBtn = document.getElementById('modal-confirm-btn');
const modalCancelBtn = document.getElementById('modal-cancel-btn');

// Diet Plan Modal Elements
const dietPlanModal = document.getElementById('diet-plan-modal');
const dietModalTitle = document.getElementById('diet-modal-title');
const dietPlanForm = document.getElementById('diet-plan-form');
const dietMemberIdInput = document.getElementById('diet-member-id');
const dietBreakfastInput = document.getElementById('diet-breakfast');
const dietLunchInput = document.getElementById('diet-lunch');
const dietDinnerInput = document.getElementById('diet-dinner');
const dietModalCancelBtn = document.getElementById('diet-modal-cancel-btn');

// Change Password Modal Elements
const changePasswordModal = document.getElementById('change-password-modal');
const changePasswordForm = document.getElementById('change-password-form');
const newPasswordInput = document.getElementById('new-password');
const confirmPasswordInput = document.getElementById('confirm-password');
const passwordErrorMessage = document.getElementById('password-error-message');
const passwordModalCancelBtn = document.getElementById('password-modal-cancel-btn');


// --- Logging Utility ---
const log = (level, module, message) => {
    console.log(`[${new Date().toISOString()}] [${level.toUpperCase()}] [${module}] ${message}`);
};

// --- Modal Functionality ---
let onConfirmCallback = null;

function showModal(title, text, confirmCallback, showCancel = false) {
    modalTitle.textContent = title;
    modalText.textContent = text;
    onConfirmCallback = confirmCallback;

    modalCancelBtn.classList.toggle('hidden', !showCancel);
    customModal.classList.remove('hidden');
    customModal.classList.remove('opacity-0');

}

function hideModal() {
    customModal.classList.add('opacity-0');
    setTimeout(() => {
        customModal.classList.add('hidden');
        onConfirmCallback = null;
    }, 300); // Match transition duration
}

modalConfirmBtn.addEventListener('click', () => {
    if (onConfirmCallback) {
        onConfirmCallback();
    }
    hideModal();
});

modalCancelBtn.addEventListener('click', hideModal);


// --- Authentication State Observer ---
onAuthStateChanged(auth, user => {
    if (user) {
        log('info', 'Auth', `User logged in: ${user.uid}`);
        showDashboard(user);
    } else {
        log('info', 'Auth', 'User logged out.');
        showLogin();
    }
});

// --- Login Functionality ---
loginBtn.addEventListener('click', async () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    if (!email || !password) {
        errorMessage.textContent = "Please enter both email and password.";
        return;
    }

    try {
        await signInWithEmailAndPassword(auth, email, password);
        errorMessage.textContent = "";
        log('info', 'Auth', 'Login successful.');
    } catch (error) {
        errorMessage.textContent = error.message;
        log('error', 'Auth', `Login failed: ${error.message}`);
    }
});

// --- Logout Functionality ---
logoutBtn.addEventListener('click', () => {
    signOut(auth);
});

// --- UI View Management ---
const showLogin = () => {
    loginSection.classList.remove('hidden');
    dashboard.classList.add('hidden');
};

const showDashboard = async (user) => {
    loginSection.classList.add('hidden');
    dashboard.classList.remove('hidden');
    
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists() && userDocSnap.data().role === 'member' && userDocSnap.data().mustChangePassword === true) {
        log('info', 'Auth', `User ${user.uid} must change their password.`);
        forcePasswordChange(user);
    } else if (userDocSnap.exists() && userDocSnap.data().role === 'admin') {
        welcomeMessage.textContent = `Welcome, Admin!`;
        adminView.classList.remove('hidden');
        memberView.classList.add('hidden');
        log('info', 'UI', 'Displaying Admin Dashboard.');
        loadMembers();
    } else {
        welcomeMessage.textContent = `Welcome, ${userDocSnap.data().name || user.email}!`;
        adminView.classList.add('hidden');
        memberView.classList.remove('hidden');
        log('info', 'UI', 'Displaying Member Dashboard.');
        loadMemberData(user.uid, userDocSnap.data());
    }
};

function forcePasswordChange(user) {
    welcomeMessage.textContent = `Welcome, ${user.email}!`;
    adminView.classList.add('hidden');
    memberView.classList.add('hidden');
    logoutBtn.classList.add('hidden');

    showModal('Update Your Password', 'For security, you must update your temporary password before proceeding.', null, false);
    
    changePasswordModal.classList.remove('hidden');
    passwordModalCancelBtn.classList.add('hidden'); 
    passwordErrorMessage.textContent = '';
    changePasswordForm.reset();
}


// --- Admin Functionality ---
async function loadMembers() {
    log('info', 'Admin', 'Loading all members.');
    const membersCollection = collection(db, "users");
    const q = query(membersCollection, where("role", "==", "member"));

    onSnapshot(q, (querySnapshot) => {
        memberList.innerHTML = '';
        if (querySnapshot.empty) {
            memberList.innerHTML = `<p class="text-slate-400">No members have been added yet.</p>`;
        }
        querySnapshot.forEach((doc) => {
            const member = doc.data();
            const memberDiv = document.createElement('div');
            memberDiv.className = 'flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-700/50 rounded-lg border border-slate-600';
            memberDiv.innerHTML = `
                <div>
                    <p class="font-bold text-lg text-indigo-300">${member.name}</p>
                    <p class="text-sm text-slate-400">${member.email}</p>
                </div>
                <div class="flex items-center space-x-2 mt-3 sm:mt-0">
                    <button class="p-2 bg-green-600 text-white rounded-md hover:bg-green-500 transition-all diet-btn" title="Diet Plan" data-id="${doc.id}" data-name="${member.name}">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" /></svg>
                    </button>
                    <button class="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-all edit-btn" title="Edit Member" data-id="${doc.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                    </button>
                    <button class="p-2 bg-red-600 text-white rounded-md hover:bg-red-500 transition-all delete-btn" title="Delete Member" data-id="${doc.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.033-2.134H8.033c-1.12 0-2.033.954-2.033 2.134v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                    </button>
                </div>
            `;
            memberList.appendChild(memberDiv);
        });
    });
}

memberList.addEventListener('click', (e) => {
    const target = e.target.closest('button');
    if (!target) return;

    if (target.classList.contains('edit-btn')) {
        editMember(target.dataset.id);
    }
    if (target.classList.contains('delete-btn')) {
        deleteMember(target.dataset.id);
    }
    if (target.classList.contains('diet-btn')) {
        openDietModal(target.dataset.id, target.dataset.name);
    }
});

memberForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const memberId = memberIdInput.value;
    const name = memberNameInput.value;
    const email = memberEmailInput.value;
    const feePackage = feePackageInput.value;

    if (memberId) {
        try {
            const memberDocRef = doc(db, 'users', memberId);
            await setDoc(memberDocRef, { name, email, feePackage, role: 'member' }, { merge: true });
            log('info', 'Admin', `Member updated: ${memberId}`);
            resetMemberForm();
        } catch (error) {
            log('error', 'Admin', `Error updating member: ${error.message}`);
            showModal('Error', `Error updating member: ${error.message}`);
        }
    } else {
        const tempPassword = '123456';
        try {
            const { user } = await createUserWithEmailAndPassword(auth, email, tempPassword);
            const newMember = {
                uid: user.uid,
                name,
                email,
                feePackage,
                role: 'member',
                mustChangePassword: true
            };
            await setDoc(doc(db, "users", user.uid), newMember);
            log('info', 'Admin', `New member added: ${email}. Temp password: ${tempPassword}`);
            showModal('Success', `Successfully added ${email}. Their temporary password is: 123456`);
            memberForm.reset();
        } catch (error) {
            log('error', 'Admin', `Error adding member: ${error.message}`);
            showModal('Error', `Could not add member: ${error.message}. Maybe the user already exists.`);
        }
    }
});

async function editMember(id) {
    log('info', 'Admin', `Editing member: ${id}`);
    const memberDocRef = doc(db, 'users', id);
    const docSnap = await getDoc(memberDocRef);
    if (docSnap.exists()) {
        const member = docSnap.data();
        memberFormTitle.textContent = "Update Member";
        submitMemberBtn.textContent = "Update Member";
        submitMemberBtn.classList.replace('bg-green-600', 'bg-blue-600');
        submitMemberBtn.classList.replace('hover:bg-green-500', 'hover:bg-blue-500');
        cancelUpdateBtn.classList.remove('hidden');

        memberIdInput.value = id;
        memberNameInput.value = member.name;
        memberEmailInput.value = member.email;
        feePackageInput.value = member.feePackage;
    }
}

function deleteMember(id) {
    showModal('Confirm Deletion', 'Are you sure you want to delete this member? This action cannot be undone.', async () => {
        try {
            await deleteDoc(doc(db, 'users', id));
            log('info', 'Admin', `Member deleted: ${id}`);
        } catch (error) {
            log('error', 'Admin', `Error deleting member: ${error.message}`);
            showModal('Error', `Error deleting member: ${error.message}`);
        }
    }, true);
}

cancelUpdateBtn.addEventListener('click', resetMemberForm);

function resetMemberForm() {
    memberFormTitle.textContent = "Add New Member";
    submitMemberBtn.textContent = "Add Member";
    submitMemberBtn.classList.replace('bg-blue-600', 'bg-green-600');
    submitMemberBtn.classList.replace('hover:bg-blue-500', 'hover:bg-green-500');
    cancelUpdateBtn.classList.add('hidden');
    memberForm.reset();
    memberIdInput.value = '';
}

// --- Diet Plan Functionality ---
async function openDietModal(memberId, memberName) {
    log('info', 'Diet', `Opening diet plan modal for ${memberName} (${memberId})`);
    dietPlanForm.reset();
    dietModalTitle.textContent = `Diet Plan for ${memberName}`;
    dietMemberIdInput.value = memberId;

    const memberDocRef = doc(db, 'users', memberId);
    const docSnap = await getDoc(memberDocRef);
    if (docSnap.exists() && docSnap.data().dietPlan) {
        const plan = docSnap.data().dietPlan;
        dietBreakfastInput.value = plan.breakfast || '';
        dietLunchInput.value = plan.lunch || '';
        dietDinnerInput.value = plan.dinner || '';
    }

    dietPlanModal.classList.remove('hidden');
}

dietPlanForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const memberId = dietMemberIdInput.value;
    const dietPlan = {
        breakfast: dietBreakfastInput.value,
        lunch: dietLunchInput.value,
        dinner: dietDinnerInput.value
    };

    try {
        const memberDocRef = doc(db, 'users', memberId);
        await setDoc(memberDocRef, { dietPlan }, { merge: true });
        log('info', 'Diet', `Diet plan saved for member ${memberId}`);
        dietPlanModal.classList.add('hidden');
        showModal('Success', 'Diet plan has been saved successfully.');
    } catch (error) {
        log('error', 'Diet', `Error saving diet plan: ${error.message}`);
        showModal('Error', 'Could not save diet plan.');
    }
});

dietModalCancelBtn.addEventListener('click', () => {
    dietPlanModal.classList.add('hidden');
});

// --- Member Functionality ---
function loadMemberData(uid, memberData) {
    log('info', 'Member', `Loading data for user: ${uid}`);
    
    memberView.classList.remove('hidden');
    logoutBtn.classList.remove('hidden');

    // Render Diet Plan
    if (memberData && memberData.dietPlan && (memberData.dietPlan.breakfast || memberData.dietPlan.lunch || memberData.dietPlan.dinner)) {
        const plan = memberData.dietPlan;
        dietPlanView.innerHTML = `
            <div class="p-4 bg-slate-700 border border-slate-600 rounded-lg">
                <h5 class="font-semibold text-indigo-300 mb-1">Breakfast</h5>
                <p class="text-slate-300 whitespace-pre-line">${plan.breakfast || 'Not set'}</p>
            </div>
            <div class="p-4 bg-slate-700 border border-slate-600 rounded-lg">
                <h5 class="font-semibold text-indigo-300 mb-1">Lunch</h5>
                <p class="text-slate-300 whitespace-pre-line">${plan.lunch || 'Not set'}</p>
            </div>
            <div class="p-4 bg-slate-700 border border-slate-600 rounded-lg">
                <h5 class="font-semibold text-indigo-300 mb-1">Dinner</h5>
                <p class="text-slate-300 whitespace-pre-line">${plan.dinner || 'Not set'}</p>
            </div>
        `;
    } else {
        dietPlanView.innerHTML = `<div class="p-4 bg-slate-700/50 rounded-lg text-slate-400">No diet plan has been assigned to you yet.</div>`;
    }
    
    // For this example, add some dummy data for other sections
    billReceipts.innerHTML = `
        <div class="bg-slate-700 border border-slate-600 p-4 rounded-lg space-y-1">
            <p><span class="font-medium text-slate-400">Date:</span> <span class="text-slate-100">2025-08-01</span></p>
            <p><span class="font-medium text-slate-400">Amount:</span> <span class="text-slate-100">₹8,000</span></p>
            <p><span class="font-medium text-slate-400">Package:</span> <span class="text-slate-100">Monthly</span></p>
        </div>
         <div class="bg-slate-700 border border-slate-600 p-4 rounded-lg space-y-1">
            <p><span class="font-medium text-slate-400">Date:</span> <span class="text-slate-100">2025-07-01</span></p>
            <p><span class="font-medium text-slate-400">Amount:</span> <span class="text-slate-100">₹8,000</span></p>
            <p><span class="font-medium text-slate-400">Package:</span> <span class="text-slate-100">Monthly</span></p>
        </div>
    `;

    notifications.innerHTML = `
        <div class="p-4 bg-indigo-900/50 border border-indigo-700 rounded-lg text-indigo-200">
            <p><strong class="font-semibold">From Admin:</strong> Your monthly fee is due next week.</p>
        </div>
    `;

    // Render Supplement Store
    renderSupplementStore();
}

function renderSupplementStore() {
    const supplements = [
        { name: 'Whey Protein', price: '₹4,500', desc: '24g Protein per serving for muscle growth.', img: 'https://placehold.co/400x400/1e293b/a78bfa?text=Whey' },
        { name: 'Creatine', price: '₹1,200', desc: 'Increases strength and performance.', img: 'https://placehold.co/400x400/1e293b/a78bfa?text=Creatine' },
        { name: 'BCAA', price: '₹1,800', desc: 'Supports muscle recovery during workouts.', img: 'https://placehold.co/400x400/1e293b/a78bfa?text=BCAA' },
    ];
    supplementStore.innerHTML = '';
    supplements.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'bg-slate-700/50 rounded-lg border border-slate-700 overflow-hidden group transition-transform transform hover:-translate-y-1';
        itemDiv.innerHTML = `
            <img src="${item.img}" alt="${item.name}" class="w-full h-48 object-cover">
            <div class="p-4">
                <h5 class="font-bold text-lg text-white">${item.name}</h5>
                <p class="text-slate-400 text-sm mb-3">${item.desc}</p>
                <div class="flex justify-between items-center">
                    <span class="text-indigo-400 font-semibold text-lg">${item.price}</span>
                    <button class="bg-indigo-600 text-white px-4 py-2 text-sm rounded-md hover:bg-indigo-500 transition-all buy-btn">Buy Now</button>
                </div>
            </div>
        `;
        supplementStore.appendChild(itemDiv);
    });
}

supplementStore.addEventListener('click', (e) => {
    if (e.target.classList.contains('buy-btn')) {
        showModal('Notice', 'Purchase functionality is currently in development. Please check back later!');
    }
});

// --- Change Password Functionality ---
changePasswordBtn.addEventListener('click', () => {
    changePasswordModal.classList.remove('hidden');
    passwordErrorMessage.textContent = '';
    changePasswordForm.reset();
});

passwordModalCancelBtn.addEventListener('click', () => {
    changePasswordModal.classList.add('hidden');
});

changePasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (newPassword.length < 6) {
        passwordErrorMessage.textContent = 'Password must be at least 6 characters long.';
        return;
    }

    if (newPassword !== confirmPassword) {
        passwordErrorMessage.textContent = 'Passwords do not match.';
        return;
    }

    passwordErrorMessage.textContent = '';

    try {
        const user = auth.currentUser;
        if (user) {
            await updatePassword(user, newPassword);
            log('info', 'Auth', 'Password updated successfully.');

            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(userDocRef, { mustChangePassword: false }, { merge: true });
            log('info', 'Firestore', `mustChangePassword flag removed for user ${user.uid}.`);

            changePasswordModal.classList.add('hidden');
            passwordModalCancelBtn.classList.remove('hidden');
            
            showModal('Success', 'Your password has been updated successfully.', async () => {
                 const userDocSnap = await getDoc(userDocRef);
                 showDashboard(user);
            });
        } else {
            throw new Error("No user is currently signed in.");
        }
    } catch (error) {
        log('error', 'Auth', `Error updating password: ${error.message}`);
        passwordErrorMessage.textContent = `Error: ${error.message}. You may need to log out and log back in to change your password.`;
    }
});

