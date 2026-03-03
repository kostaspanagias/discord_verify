// ==UserScript==
// @name         Discord Staff Verifier MVP
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Single-banner verification for official members.
// @author       Kostas Panagias
// @match        https://discord.com/*
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// ==/UserScript==

(function() {
    'use strict';

    const DATA_URL = "https://raw.githubusercontent.com/kostaspanagias/discord_verify/refs/heads/main/ids.json";
    let trustedIds = [];

    // 1. Fetch IDs from GitHub
    GM_xmlhttpRequest({
        method: "GET",
        url: DATA_URL,
        onload: function(res) {
            try {
                trustedIds = JSON.parse(res.responseText).map(id => String(id).trim());
                console.log("%c[Verifier] IDs Loaded: " + trustedIds.length, "color: #23a559; font-weight: bold;");
            } catch (e) { console.error("[Verifier] JSON Error"); }
        }
    });

    function verify() {
        // Target popups and profiles
        const popups = document.querySelectorAll('[role="dialog"], [class*="userProfile"]');
        
        popups.forEach(popup => {
            // THE LOCK: Only proceed if this specific popup doesn't already have our banner
            if (popup.querySelector('.verified-banner-active')) return;

            // Search for the 18-digit ID in the HTML
            const match = popup.innerHTML.match(/\b\d{17,19}\b/);
            const foundId = match ? match[0] : null;

            if (foundId && trustedIds.includes(String(foundId))) {
                // SECOND LOCK: Check if any other banner exists on the WHOLE page already
                // This prevents the "double banner" if Discord doubles up on containers
                if (document.querySelector('.verified-banner-active')) return;

                const banner = document.createElement('div');
                banner.className = 'verified-banner-active';
                banner.innerHTML = "✅ Verified Member";
                banner.style = `
                    background: #23a559 !important;
                    color: white !important;
                    font-weight: 800 !important;
                    text-align: center !important;
                    padding: 10px !important;
                    font-size: 14px !important;
                    border-bottom: 3px solid #1a7a42 !important;
                    display: block !important;
                    width: 100% !important;
                    z-index: 9999999 !important;
                    position: relative !important;
                    box-sizing: border-box !important;
                    font-family: 'gg sans', 'Noto Sans', sans-serif !important;
                `;
                
                // Prepend to the popup
                popup.prepend(banner);
            }
        });
    }

    // Check every 300ms
    setInterval(verify, 300);
})();
