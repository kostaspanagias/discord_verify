# Discord Staff Verifier 🛡️

Scammers often impersonate staff members by using "lookalike" usernames (e.g., using a Cyrillic `а` instead of a Latin `a`, or adding a hidden dot). This script adds a **visual trust layer** to the Discord web client to ensure you are talking to the real deal.

## 🚀 How it Works
This tool doesn't look at usernames. It checks the user's **unique, 18-digit Discord ID** against our official staff database. 

- **Verified Members:** A bright green "✅ VERIFIED MEMBER" banner appears at the top of their profile.
- **Impersonators:** No banner will appear, even if their name and avatar look identical to a moderator's.

## 📥 Quick Installation (30 Seconds)

1. **Install a Userscript Manager:**
   - [Tampermonkey for Chrome/Edge](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - [Tampermonkey for Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)

2. **Install the Script:**
   - Click here: **[INSTALL VERIFIER SCRIPT](placeholder)**
   - Click the **"Install"** button in the Tampermonkey tab that opens.

3. **Verify:**
   - Refresh your Discord tab. Click on an official staff member's profile to see the new verification banner!

---

## 🛠️ For Administrators
To manage the list of verified users, edit the `staff_ids.json` file in this repository. 

1. Copy the User ID of your staff (Enable **Developer Mode** in Discord > Settings > Advanced).
2. Add the ID to the JSON array.
3. The changes will reflect for all users automatically within a few minutes (no script re-install required).

## ⚠️ Disclaimer
*This is a third-party modification for the Discord Web Client. This project is not affiliated with or endorsed by Discord Inc. Use at your own discretion.*
