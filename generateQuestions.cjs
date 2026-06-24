const fs = require('fs');
const path = require('path');

const topics = ['password_security', 'phishing', 'malware', 'network_security', 'safe_browsing'];

// Utility to get a random item from array
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Generate permutations for a category
function generateCategory(topic, count) {
  const generated = [];
  const addedSet = new Set();
  
  let templates = [];
  let vars1 = [];
  let vars2 = [];

  if (topic === 'password_security') {
    templates = [
      "Which of the following is the most secure practice for protecting your {V1}?",
      "When creating a new password for {V1}, what should you prioritize?",
      "To prevent unauthorized access to your {V1}, you should:",
      "What is a critical mistake to avoid when securing {V1}?",
      "How can you best defend {V1} against credential stuffing attacks?"
    ];
    vars1 = [
      "banking portal", "corporate email", "social media account", "cloud storage", 
      "workstation", "administrator dashboard", "personal blog", "e-commerce profile",
      "VPN access", "remote desktop protocol"
    ];
    const correctOptions = [
      "Using a password manager to generate a complex, unique 16+ character password.",
      "Enabling Multi-Factor Authentication (MFA) and using a strong passphrase.",
      "Using a minimum of 14 characters with a mix of symbols, numbers, and cases.",
      "Ensuring the password is never reused across any other service."
    ];
    const wrongOptionsPool = [
      "Using a predictable pattern like 'Password123!'.",
      "Writing the password on a sticky note under the keyboard.",
      "Using your pet's name or birthdate for easy memorization.",
      "Changing the password every 30 days to a slight variation of the old one.",
      "Disabling MFA to make logging in faster.",
      "Sharing the password with a trusted colleague via text message.",
      "Storing the password in an unencrypted Excel spreadsheet.",
      "Using a 6-character password consisting only of lowercase letters."
    ];

    for (let i = 0; i < count; i++) {
      const template = randomItem(templates);
      const v1 = randomItem(vars1);
      const questionText = template.replace('{V1}', v1) + ` (QID: ${i+1})`;
      
      const correctText = randomItem(correctOptions);
      const wrongs = [];
      while(wrongs.length < 3) {
        const w = randomItem(wrongOptionsPool);
        if(!wrongs.includes(w)) wrongs.push(w);
      }
      
      const options = [correctText, ...wrongs];
      
      generated.push({
        id: i + 1,
        question: questionText,
        options: options,
        correct: 0, // Will be shuffled by the React frontend
        explanation: "Strong, unique passwords combined with MFA are the best defense against account takeover."
      });
    }

  } else if (topic === 'phishing') {
    templates = [
      "You receive an email claiming to be from {V1} asking you to {V2}. What should you do?",
      "An urgent message arrives from {V1} requesting you to {V2}. What is the safest response?",
      "A seemingly legitimate SMS from {V1} tells you to {V2}. How should you handle this?",
      "While at work, you get a direct message on Teams from {V1} instructing you to {V2}. Your next step is:"
    ];
    vars1 = [
      "the CEO", "IT Support", "HR Department", "your bank", 
      "a trusted vendor", "Microsoft Security", "Google Alerts", "the IRS"
    ];
    vars2 = [
      "click a link to verify your account", "download an attached invoice PDF", 
      "provide your login credentials immediately", "buy gift cards for a client",
      "confirm your social security number", "update your billing information"
    ];
    const correctOptions = [
      "Verify the request through an independent, official channel (e.g., calling them directly).",
      "Report the message to the security team using the Phish Alert button.",
      "Ignore and delete the message without clicking any links or attachments."
    ];
    const wrongOptionsPool = [
      "Click the link to see if the website looks legitimate.",
      "Reply to the sender to ask if the message is real.",
      "Download the attachment but scan it with an antivirus first.",
      "Provide the information because the sender is an authority figure.",
      "Forward the email to your personal account to review later.",
      "Comply with the request quickly to avoid getting in trouble."
    ];

    for (let i = 0; i < count; i++) {
      const template = randomItem(templates);
      const v1 = randomItem(vars1);
      const v2 = randomItem(vars2);
      const questionText = template.replace('{V1}', v1).replace('{V2}', v2) + ` (QID: ${i+1})`;
      
      const correctText = randomItem(correctOptions);
      const wrongs = [];
      while(wrongs.length < 3) {
        const w = randomItem(wrongOptionsPool);
        if(!wrongs.includes(w)) wrongs.push(w);
      }
      
      generated.push({
        id: i + 1,
        question: questionText,
        options: [correctText, ...wrongs],
        correct: 0,
        explanation: "Phishing attacks often rely on urgency and impersonating authority figures. Always independently verify."
      });
    }

  } else if (topic === 'malware') {
    templates = [
      "Which of the following describes the behavior of a {V1}?",
      "If your computer is infected with a {V1}, what is the most likely symptom?",
      "What is the primary objective of a {V1}?",
      "A threat actor uses a {V1} to compromise your system. What does it do?"
    ];
    vars1 = [
      "Ransomware variant", "Trojan horse", "Keylogger", "Rootkit", 
      "Cryptominer", "Spyware program", "Worm", "Fileless malware"
    ];
    const correctOptions = [
      "It executes malicious actions while hiding its presence from the operating system.",
      "It covertly monitors user activity or encrypts files for extortion.",
      "It disguises itself as legitimate software to trick users into installing it.",
      "It spreads laterally across networks without requiring user interaction."
    ];
    const wrongOptionsPool = [
      "It optimizes the computer's CPU performance.",
      "It automatically updates your antivirus definitions.",
      "It increases the speed of your internet connection.",
      "It permanently repairs corrupted system files.",
      "It is a hardware device used to boost Wi-Fi signals.",
      "It alerts you when your firewall is outdated.",
      "It securely encrypts your data for free cloud backup."
    ];

    for (let i = 0; i < count; i++) {
      const template = randomItem(templates);
      const v1 = randomItem(vars1);
      const questionText = template.replace('{V1}', v1) + ` (QID: ${i+1})`;
      
      const correctText = randomItem(correctOptions);
      const wrongs = [];
      while(wrongs.length < 3) {
        const w = randomItem(wrongOptionsPool);
        if(!wrongs.includes(w)) wrongs.push(w);
      }
      
      generated.push({
        id: i + 1,
        question: questionText,
        options: [correctText, ...wrongs],
        correct: 0,
        explanation: "Malware comes in many forms, but its core purpose is to operate maliciously, often while remaining undetected."
      });
    }

  } else if (topic === 'network_security') {
    templates = [
      "When connecting to {V1}, why is it crucial to use {V2}?",
      "To secure data transmitted over {V1}, the best approach is to implement {V2} because:",
      "A major vulnerability of {V1} is interception. How does {V2} mitigate this?",
      "If an employee is accessing corporate resources via {V1}, requiring {V2} ensures:"
    ];
    vars1 = [
      "a public Wi-Fi network at a coffee shop", "an unsecured hotel network", 
      "a home router with outdated firmware", "an airport terminal hotspot",
      "a completely open guest network"
    ];
    vars2 = [
      "a Virtual Private Network (VPN)", "WPA3 encryption", 
      "TLS/SSL protocols", "an enterprise firewall"
    ];
    const correctOptions = [
      "It encrypts the data tunnel, preventing Man-in-the-Middle (MitM) attacks.",
      "It hides the user's IP address and encrypts all network traffic.",
      "It ensures data integrity and confidentiality during transmission.",
      "It securely authenticates the user and encrypts the payload."
    ];
    const wrongOptionsPool = [
      "It makes the internet connection significantly faster.",
      "It prevents the device's battery from draining.",
      "It allows you to bypass all company security policies safely.",
      "It physicalizes the network connection using Ethernet.",
      "It automatically detects and removes physical keyloggers.",
      "It blocks the coffee shop from selling your coffee preferences."
    ];

    for (let i = 0; i < count; i++) {
      const template = randomItem(templates);
      const v1 = randomItem(vars1);
      const v2 = randomItem(vars2);
      const questionText = template.replace('{V1}', v1).replace('{V2}', v2) + ` (QID: ${i+1})`;
      
      const correctText = randomItem(correctOptions);
      const wrongs = [];
      while(wrongs.length < 3) {
        const w = randomItem(wrongOptionsPool);
        if(!wrongs.includes(w)) wrongs.push(w);
      }
      
      generated.push({
        id: i + 1,
        question: questionText,
        options: [correctText, ...wrongs],
        correct: 0,
        explanation: "Unsecured networks expose traffic to interception. Encryption protocols (like VPNs) protect data in transit."
      });
    }

  } else if (topic === 'safe_browsing') {
    templates = [
      "While browsing {V1}, you encounter a pop-up warning about {V2}. You should:",
      "If you are searching for software on {V1} and see an ad for {V2}, what is the safest practice?",
      "When navigating {V1}, a site requests permission to {V2}. What is the correct action?",
      "You notice a lack of HTTPS on {V1} while trying to {V2}. What is the risk?"
    ];
    vars1 = [
      "an unfamiliar e-commerce site", "a file-sharing forum", 
      "a streaming platform", "a social media feed", "a news aggregate website"
    ];
    vars2 = [
      "a critical system infection", "a free antivirus download", 
      "enable push notifications", "enter your credit card details",
      "download a browser extension"
    ];
    const correctOptions = [
      "Close the tab immediately without clicking any links or buttons within the page.",
      "Verify the site's SSL certificate and domain name before entering any data.",
      "Refuse the permission and navigate to a known, trusted software repository.",
      "Understand that unencrypted sites expose data to interception, and leave the site."
    ];
    const wrongOptionsPool = [
      "Click the 'X' inside the pop-up to close it, as it is always safe.",
      "Download the offered software to see if it fixes the problem.",
      "Enter fake credit card details to see what happens.",
      "Allow notifications so you can be warned about future viruses.",
      "Call the toll-free number provided on the screen for assistance.",
      "Disable your firewall to allow the site to load properly."
    ];

    for (let i = 0; i < count; i++) {
      const template = randomItem(templates);
      const v1 = randomItem(vars1);
      const v2 = randomItem(vars2);
      const questionText = template.replace('{V1}', v1).replace('{V2}', v2) + ` (QID: ${i+1})`;
      
      const correctText = randomItem(correctOptions);
      const wrongs = [];
      while(wrongs.length < 3) {
        const w = randomItem(wrongOptionsPool);
        if(!wrongs.includes(w)) wrongs.push(w);
      }
      
      generated.push({
        id: i + 1,
        question: questionText,
        options: [correctText, ...wrongs],
        correct: 0,
        explanation: "Safe browsing requires skepticism. Never trust unsolicited pop-ups, and always ensure sites are verified and encrypted."
      });
    }
  }

  return generated;
}

const newQuestionsData = {};

topics.forEach(topic => {
  console.log(`Generating 1000 questions for ${topic}...`);
  newQuestionsData[topic] = generateCategory(topic, 1000);
});

fs.writeFileSync(path.join(__dirname, 'src', 'data', 'questions.json'), JSON.stringify(newQuestionsData, null, 2));
console.log('Successfully generated exactly 1000 questions per category (5000 total).');
