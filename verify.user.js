// ==UserScript==
// @name         Discord Staff Verifier MVP
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Adds a "Verified" banner to official staff profiles.
// @author       Kostas Panagias
// @match        https://discord.com/*
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// @updateURL    https://github.com/kostaspanagias/discord_verify/raw/refs/heads/main/verify.user.js
// @downloadURL  https://github.com/kostaspanagias/discord_verify/raw/refs/heads/main/verify.user.js
// ==/UserScript==

(function() {
    'use strict';

    // REPLACE THIS with the "Raw" link to your ids.json file
    const DATA_URL = "https://raw.githubusercontent.com/kostaspanagias/discord_verify/refs/heads/main/ids.json";
    let trustedIds = [];

    // Fetch the latest staff list
    function updateStaffList() {
        GM_xmlhttpRequest({
            method: "GET",
            url: DATA_URL,
            onload: function(response) {
                try {
                    trustedIds = JSON.parse(response.responseText);
                    console.log("Staff Verifier: List updated successfully.");
                } catch (e) {
                    console.error("Staff Verifier: Failed to parse ID list.");
                }
            }
        });
    }

    updateStaffList();

    function injectBadge(node) {
        // Find the User ID in the Discord profile data-attributes
        const idElement = node.querySelector('[data-user-id]');
        const userId = idElement ? idElement.getAttribute('data-user-id') : null;

        if (userId && trustedIds.includes(userId)) {
            if (node.querySelector('.verified-staff-banner')) return;

            const banner = document.createElement('div');
            banner.className = 'verified-staff-banner';
            banner.innerHTML = "✅ OFFICIAL STAFF MEMBER";
            banner.style = `
                background: #23a559;
                color: white;
                font-weight: 800;
                text-align: center;
                padding: 10px;
                font-size: 14px;
                border-bottom: 2px solid #1a7a42;
                letter-spacing: 0.5px;
            `;
            node.prepend(banner);
        }
    }

    // Watch for the profile popout or full modal to appear
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) {
                    // Target the popout or the full profile modal
                    const profile = node.querySelector('[class*="userPopout"], [class*="userProfileModal"]');
                    if (profile || node.matches('[class*="userPopout"], [class*="userProfileModal"]')) {
                        injectBadge(profile || node);
                    }
                }
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
