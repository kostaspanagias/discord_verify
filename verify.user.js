// ==UserScript==
// @name         Discord Staff Verifier MVP
// @namespace    http://tampermonkey.net/
// @version      1.7
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
    GM_xmlhttpRequest({
        method: "GET",
        url: DATA_URL,
        onload: function(res) {
            try {
                trustedIds = JSON.parse(res.responseText).map(id => String(id).trim());
                console.log("%c[Staff Verifier] IDs Loaded: " + trustedIds.length, "color: #23a559; font-weight: bold;");
            } catch (e) { console.error("[Staff Verifier] JSON Error"); }
        }
    });

    function inject() {
        // Target the dialog we just confirmed exists
        const dialogs = document.querySelectorAll('[role="dialog"]');

        dialogs.forEach(container => {
            if (container.querySelector('.verified-staff-banner')) return;

            // Search Strategy: Look for ANY element with data-user-id inside this dialog
            const idEl = container.querySelector('[data-user-id]') || container.querySelector('[href*="/users/"]');
            let userId = null;

            if (idEl) {
                userId = idEl.getAttribute('data-user-id');
                // If found via link, extract from URL
                if (!userId && idEl.href) {
                    const match = idEl.href.match(/\/users\/(\d+)/);
                    if (match) userId = match[1];
                }
            }

            // Fallback: Scan the whole dialog's HTML for the 18-digit ID
            if (!userId) {
                const match = container.innerHTML.match(/\b\d{17,19}\b/);
                if (match) userId = match[0];
            }

            if (userId && trustedIds.includes(String(userId))) {
                console.log("[Staff Verifier] Verified user found: " + userId);
                
                const banner = document.createElement('div');
                banner.className = 'verified-staff-banner';
                banner.innerHTML = "✅ VERIFIED MEMBER";
                banner.style = `
                    background: #23a559 !important;
                    color: white !important;
                    font-weight: 900 !important;
                    text-align: center !important;
                    padding: 10px 0 !important;
                    font-size: 14px !important;
                    border-bottom: 3px solid #1a7a42 !important;
                    display: block !important;
                    width: 100% !important;
                    z-index: 100000 !important;
                    position: relative !important;
                `;
                
                // We prepend it to the very first child of the dialog
                if (container.firstChild) {
                    container.insertBefore(banner, container.firstChild);
                } else {
                    container.appendChild(banner);
                }
            }
        });
    }

    // High-frequency check (more reliable than MutationObserver for specific popups)
    setInterval(inject, 500);
})();
