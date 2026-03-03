// ==UserScript==
// @name         Discord Staff Verifier MVP
// @namespace    http://tampermonkey.net/
// @version      1.5
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

    // 1. Load the IDs
    GM_xmlhttpRequest({
        method: "GET",
        url: DATA_URL,
        onload: function(res) {
            try {
                trustedIds = JSON.parse(res.responseText).map(id => String(id).trim());
                console.log("%c[Staff Verifier] IDs Loaded: " + trustedIds.length, "color: #23a559; font-weight: bold;");
            } catch (e) { console.error("Failed to load IDs"); }
        }
    });

    function doVerification() {
        // Target: Discord's "Layers" (where all popouts live)
        const layers = document.querySelectorAll('[class*="layer_"], [role="dialog"], [class*="userProfile"]');
        
        layers.forEach(container => {
            if (container.querySelector('.verified-staff-banner')) return;

            // Search for ID in any child attribute or text
            const idElement = container.querySelector('[data-user-id]');
            let userId = idElement ? idElement.getAttribute('data-user-id') : null;

            // Fallback: Check for internal links with ID
            if (!userId) {
                const link = container.querySelector('a[href*="/users/"]');
                if (link) userId = link.href.split('/').pop();
            }

            if (userId && trustedIds.includes(String(userId))) {
                console.log("[Staff Verifier] Verifying ID: " + userId);
                
                const banner = document.createElement('div');
                banner.className = 'verified-staff-banner';
                banner.innerHTML = "✅ VERIFIED MEMBER";
                banner.style = `
                    background: #23a559 !important;
                    color: white !important;
                    font-weight: 900 !important;
                    text-align: center !important;
                    padding: 12px !important;
                    font-size: 15px !important;
                    border-bottom: 4px solid #1a7a42 !important;
                    display: block !important;
                    width: 100% !important;
                    box-sizing: border-box !important;
                    border-radius: 8px 8px 0 0 !important;
                `;
                
                // Try to find the actual 'outer' container to prepend
                const outer = container.querySelector('[class*="userProfileOuter"]') || container;
                outer.prepend(banner);
            }
        });
    }

    // Run every time the screen changes
    const observer = new MutationObserver(() => {
        setTimeout(doVerification, 100);
    });
    observer.observe(document.body, { childList: true, subtree: true });
})();
