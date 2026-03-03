// ==UserScript==
// @name         Discord Staff Verifier MVP
// @namespace    http://tampermonkey.net/
// @version      1.9
// @description  Universal Sniffer - No classes required
// @author       Kostas Panagias
// @match        https://discord.com/*
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// ==/UserScript==

(function() {
    'use strict';

    const DATA_URL = "https://raw.githubusercontent.com/kostaspanagias/discord_verify/refs/heads/main/ids.json";
    let trustedIds = [];

    // Fetch IDs
    function fetchIDs() {
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
    }
    fetchIDs();

    function verify() {
        // Target anything that looks like a popup or a profile
        const popups = document.querySelectorAll('[role="dialog"], [class*="layer_"], [class*="userProfile"]');
        
        popups.forEach(popup => {
            if (popup.querySelector('.verified-banner')) return;

            // Search for an 18-digit ID anywhere in the popup's code
            const match = popup.innerHTML.match(/\b\d{17,19}\b/);
            const foundId = match ? match[0] : null;

            if (foundId) {
                console.log("[Verifier] Detected ID in popup: " + foundId);

                if (trustedIds.includes(String(foundId))) {
                    console.log("%c[Verifier] MATCH FOUND!", "color: #23a559; font-weight: bold;");
                    
                    const banner = document.createElement('div');
                    banner.className = 'verified-banner';
                    banner.innerHTML = "✅ OFFICIAL STAFF MEMBER";
                    banner.style = `
                        background: #23a559 !important;
                        color: white !important;
                        font-weight: 900 !important;
                        text-align: center !important;
                        padding: 15px !important;
                        font-size: 14px !important;
                        border-bottom: 4px solid #1a7a42 !important;
                        display: block !important;
                        width: 100% !important;
                        z-index: 2147483647 !important;
                        position: relative !important;
                        box-sizing: border-box !important;
                    `;
                    
                    // Force it to the top
                    popup.prepend(banner);
                }
            }
        });
    }

    // Run every 300ms so it catches the profile as soon as it renders
    setInterval(verify, 300);
})();
