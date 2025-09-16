Apex Gym - Management Portal
🚀 Introduction
Apex Gym is a modern, web-based management portal designed to solve the common problems faced by gyms and their members. It replaces outdated paper receipts and manual communication with a streamlined digital solution. This application allows gym administrators to manage members, assign diet plans, and handle billing efficiently, while members get a secure portal to view their information, change passwords, and browse gym-related products.

✨ Key Features
The application is divided into two main roles, each with a specific set of features:

👨‍💼 Admin Features
Secure Admin Login: Access to a dedicated dashboard for gym management.

Full Member Management (CRUD):

Add New Members: Admins can easily add new members to the system. A temporary password (123456) is automatically assigned.

Update Member Details: Edit member names, emails, and fee packages.

Delete Members: Remove members from the system when required.

Custom Diet Plan Creation: Assign and update personalized diet plans (breakfast, lunch, dinner) for each member.

Fee Package Assignment: Set a monthly, quarterly, or yearly fee package for each member during registration.

💪 Member Features
Secure Member Login: Members log in with their email and password.

Mandatory Password Update: For enhanced security, new members are prompted with a mandatory pop-up on their first login to change their temporary password before they can access the dashboard.

Personalized Dashboard: A central hub to view all personal gym-related information.

View Bill Receipts & Notifications: Access a history of payments and view important notifications from the admin.

View Diet Plan: Check the personalized diet plan assigned by the admin at any time.

Supplement Store: Browse a curated list of supplements available for purchase at the gym.

Account Settings: Members can change their password at any time through their account settings.

🛠️ Tech Stack
This project is built with modern, lightweight web technologies, making it fast and easy to deploy.

Frontend: HTML5, Tailwind CSS

Logic: JavaScript (ES6 Modules)

Backend & Database: Google Firebase (Authentication & Firestore)

⚙️ Project Setup & Installation
To get this project running on your local machine, follow these simple steps.

1. Clone the Repository
First, clone the project files to your computer.

git clone <your-repository-link>
cd <repository-folder>

2. Set Up Firebase
This project requires a Firebase project to handle authentication and data storage.

Create a Firebase Project: Go to the Firebase Console and create a new project.

Add a Web App: In your project's dashboard, click the web icon (</>) to add a new web application.

Get Firebase Config: Register your app and Firebase will provide you with a firebaseConfig object. Copy this object.

Paste Config in main.js: Open the main.js file and replace the placeholder firebaseConfig object with the one you just copied.

3. Configure Firebase Services
Enable Authentication:

In the Firebase Console, navigate to Authentication.

Go to the Sign-in method tab and enable the Email/Password provider.

Set Up Firestore Database:

Navigate to Firestore Database and click Create database.

Start in Test mode for initial setup. This allows open read/write access.

Choose a location and click Enable.

4. Create Your Admin User
The first admin user needs to be created manually.

Create User in Authentication:

Go back to Authentication and click on the Users tab.

Click Add user, enter an email (e.g., admin@gym.com) and a password, then click Add user.

Copy the UID of the newly created user.

Set Admin Role in Firestore:

Go back to the Firestore Database.

Create a new collection named users.

Add a new document and paste the user's UID as the Document ID.

Add a field named role (Type: String) with the value admin.

Click Save. Your admin account is now ready.

🚀 How It Works
The application's logic is straightforward:

Login: A user enters their credentials.

Role Check: After successful authentication, the system checks the user's document in the users collection in Firestore to determine their role (admin or member).

Dashboard Rendering: The appropriate dashboard (Admin View or Member View) is displayed based on the user's role.

New Member Flow: When an admin adds a new member, an account is created in Firebase Authentication with a temporary password and a document is created in Firestore with role: 'member' and a special flag mustChangePassword: true. When that member logs in for the first time, this flag triggers the mandatory password change modal.

📂 File Structure
.
├── 📄 index.html   # Main HTML file with the entire UI structure
└── 📜 main.js      # All JavaScript for logic, Firebase, and DOM manipulation

▶️ Running the Application
After completing the setup steps, simply open the index.html file in your web browser to run the application. You can log in with the admin credentials you created to start managing the gym.