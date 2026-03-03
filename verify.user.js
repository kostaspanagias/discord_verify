// ==UserScript==
// @name         Discord Staff Verifier MVP
// @namespace    http://tampermonkey.net/
// @version      1.8
// @description  Adds a "Verified" banner with Diagnostic Logging.
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
    function fetchIDs() {
        GM_xmlhttpRequest({
            method: "GET",
            url: DATA_URL,
            onload: function(res) {
                try {
                    trustedIds = JSON.parse(res.responseText).map(id => String(id).trim());
                    console.log("%c[Staff Verifier] IDs Loaded: " + trustedIds.join(", "), "color: #23a559; font-weight: bold;");
                } catch (e) { console.error("[Staff Verifier] JSON Parse Error. Check your ids.json format."); }
            }
        });
    }
    fetchIDs();

    function scan() {
        // Discord profiles are usually inside a [role="dialog"]
        const dialog = document.querySelector('[role="dialog"]');
        if (!dialog) return;

        // Avoid adding multiple banners to the same dialog
        if (dialog.querySelector('.verified-staff-banner')) return;

        // THE ID SEARCH: Check multiple common Discord locations
        let userId = dialog.querySelector('[data-user-id]')?.getAttribute('data-user-id') || 
                     dialog.querySelector('img[src*="/avatars/"]')?.src.split('/')[4] ||
                     dialog.innerHTML.match(/\b\d{17,19}\b/)?.[0];

        if (userId) {
            console.log(`[Staff Verifier] Diagnostic: Found ID ${userId} in profile.`);

            if (trustedIds.includes(String(userId))) {
                console.log("%c[Staff Verifier] MATCH FOUND! Injecting banner...", "color: #23a559; font-weight: bold;");
                
                const banner = document.createElement('div');
                banner.className = 'verified-staff-banner';
                banner.innerHTML = "✅ VERIFIED MEMBER";
                banner.style = `
                    background: #23a559 !important;
                    color: white !important;
                    font-weight: 900 !important;
                    text-align: center !important;
                    padding: 12px 0 !important;
                    font-size: 14px !important;
                    border-bottom: 3px solid #1a7a42 !important;
                    width: 100% !important;
                    z-index: 999999 !important;
                    position: relative !important;
                    display: block !important;
                `;
                
                // Prepend to the very top of the dialog
                dialog.prepend(banner);
            }
        }
    }

    // Check frequently (every 400ms) for open profiles
    setInterval(scan, 400);
})();
