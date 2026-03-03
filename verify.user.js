// ==UserScript==
// @name         Discord Staff Verifier MVP
// @namespace    http://tampermonkey.net/
// @version      1.4
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

    console.log("%c[Staff Verifier] Active and watching...", "color: #23a559; font-weight: bold;");

    function updateStaffList() {
        GM_xmlhttpRequest({
            method: "GET",
            url: DATA_URL,
            onload: function(response) {
                try {
                    trustedIds = JSON.parse(response.responseText);
                    console.log(`[Staff Verifier] Verified list:`, trustedIds);
                } catch (e) { console.error("[Staff Verifier] JSON Parse Error"); }
            }
        });
    }
    updateStaffList();

    function injectBadge() {
        // Look for the User Popout or the Full Modal
        // Discord usually uses role="dialog" or specific container classes for these
        const profileContainers = document.querySelectorAll('[class*="userPopout"], [class*="userProfileModal"], [role="dialog"]');
        
        profileContainers.forEach(container => {
            // Avoid double injection
            if (container.querySelector('.verified-staff-banner')) return;

            // Deep search for the ID
            // We check the container, all children, and look for ID-like strings in the HTML
            const idElement = container.querySelector('[data-user-id]');
            let userId = idElement ? idElement.getAttribute('data-user-id') : null;

            if (!userId) {
                const html = container.innerHTML;
                const match = html.match(/\b\d{17,19}\b/);
                userId = match ? match[0] : null;
            }

            if (userId && trustedIds.includes(userId)) {
                console.log("[Staff Verifier] Found Trusted User:", userId);
                const banner = document.createElement('div');
                banner.className = 'verified-staff-banner';
                banner.innerHTML = "✅ VERIFIED MEMBER";
                banner.style = `
                    background: #23a559 !important;
                    color: white !important;
                    font-weight: 800 !important;
                    text-align: center !important;
                    padding: 12px !important;
                    font-size: 14px !important;
                    border-bottom: 3px solid #1a7a42 !important;
                    display: block !important;
                    width: 100% !important;
                    z-index: 10000 !important;
                `;
                container.prepend(banner);
            }
        });
    }

    // Backup 1: Mutation Observer (The standard way)
    const observer = new MutationObserver(() => injectBadge());
    observer.observe(document.body, { childList: true, subtree: true });

    // Backup 2: Click Listener (The fail-safe way)
    // Runs the check specifically when you click, just in case the observer misses it
    document.addEventListener('click', () => {
        setTimeout(injectBadge, 100);
    });

})();
