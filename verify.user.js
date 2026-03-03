// ==UserScript==
// @name         Discord Staff Verifier MVP
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  Adds a "Verified" banner to official staff profiles.
// @author       Kostas Panagias
// @match        https://discord.com/*
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// ==/UserScript==

(function() {
    'use strict';

    const DATA_URL = "https://raw.githubusercontent.com/kostaspanagias/discord_verify/refs/heads/main/ids.json";
    let trustedIds = [];

    // 1. Fetch the IDs
    function updateStaffList() {
        GM_xmlhttpRequest({
            method: "GET",
            url: DATA_URL,
            onload: function(res) {
                try {
                    trustedIds = JSON.parse(res.responseText).map(id => String(id).trim());
                    console.log("%c[Staff Verifier] IDs Loaded: " + trustedIds.length, "color: #23a559; font-weight: bold;");
                } catch (e) { console.error("JSON Error"); }
            }
        });
    }
    updateStaffList();

    function inject() {
        // Discord puts profiles in "layers" or "dialogs"
        const potentialProfiles = document.querySelectorAll('[role="dialog"], [class*="layer_"], section[class*="profile"]');

        potentialProfiles.forEach(container => {
            if (container.querySelector('.verified-staff-banner')) return;

            // Deep-search for the User ID
            let userId = null;
            
            // Search 1: data-user-id attribute (most reliable if present)
            const idEl = container.querySelector('[data-user-id]') || (container.hasAttribute('data-user-id') ? container : null);
            if (idEl) userId = idEl.getAttribute('data-user-id');

            // Search 2: Look for any link containing the ID
            if (!userId) {
                const link = container.querySelector('a[href*="/users/"]');
                if (link) {
                    const parts = link.href.split('/');
                    userId = parts[parts.length - 1] || parts[parts.length - 2];
                }
            }

            // Search 3: Scrape the HTML for an 18-digit number (last resort)
            if (!userId) {
                const match = container.innerHTML.match(/\b\d{17,19}\b/);
                if (match) userId = match[0];
            }

            if (userId && trustedIds.includes(String(userId))) {
                const banner = document.createElement('div');
                banner.className = 'verified-staff-banner';
                banner.innerHTML = "✅ VERIFIED MEMBER";
                banner.style = `
                    background: #23a559 !important;
                    color: white !important;
                    font-weight: 900 !important;
                    text-align: center !important;
                    padding: 14px !important;
                    font-size: 14px !important;
                    border-bottom: 4px solid #1a7a42 !important;
                    display: block !important;
                    width: 100% !important;
                    z-index: 99999 !important;
                    box-sizing: border-box !important;
                `;
                
                // Find the first child of the profile to place the banner at the very top
                const target = container.querySelector('[class*="userProfileOuter"]') || container.firstChild;
                if (target && target.parentNode) {
                    target.parentNode.insertBefore(banner, target);
                } else {
                    container.prepend(banner);
                }
            }
        });
    }

    // Run when the DOM changes (user clicks a name)
    const observer = new MutationObserver(() => inject());
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Fail-safe: Run on every click
    window.addEventListener('click', () => setTimeout(inject, 150));
})();
