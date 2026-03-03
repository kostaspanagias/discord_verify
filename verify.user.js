// ==UserScript==
// @name         Discord Staff Verifier MVP
// @namespace    http://tampermonkey.net/
// @version      1.3
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

    const DATA_URL = "https://raw.githubusercontent.com/kostaspanagias/discord_verify/refs/heads/main/ids.json";
    let trustedIds = [];

    // Log to console so you can see it's active in F12
    console.log("%c[Staff Verifier] Active and watching...", "color: #23a559; font-weight: bold;");

    function updateStaffList() {
        GM_xmlhttpRequest({
            method: "GET",
            url: DATA_URL,
            onload: function(response) {
                try {
                    trustedIds = JSON.parse(response.responseText);
                    console.log(`[Staff Verifier] Successfully loaded ${trustedIds.length} IDs.`);
                } catch (e) {
                    console.error("[Staff Verifier] Failed to parse ID list from GitHub.");
                }
            }
        });
    }

    updateStaffList();

    function findUserId(node) {
        // 1. Check the node itself
        if (node.hasAttribute('data-user-id')) return node.getAttribute('data-user-id');
        
        // 2. Look for any child with the attribute
        const childWithId = node.querySelector('[data-user-id]');
        if (childWithId) return childWithId.getAttribute('data-user-id');

        // 3. Fallback: Search for internal React links (common in newer Discord builds)
        const avatarLink = node.querySelector('a[href*="/users/"]');
        if (avatarLink) {
            const match = avatarLink.href.match(/\/users\/(\d+)/);
            if (match) return match[1];
        }

        return null;
    }

    function injectBadge(node) {
        const userId = findUserId(node);
        
        if (userId && trustedIds.includes(userId)) {
            // Prevent duplicate banners
            if (node.querySelector('.verified-staff-banner')) return;

            const banner = document.createElement('div');
            banner.className = 'verified-staff-banner';
            banner.innerHTML = "✅ VERIFIED MEMBER";
            banner.style = `
                background: #23a559;
                color: white;
                font-weight: 800;
                text-align: center;
                padding: 12px 5px;
                font-size: 13px;
                border-bottom: 3px solid #1a7a42;
                letter-spacing: 1px;
                z-index: 999;
                position: sticky;
                top: 0;
                width: 100%;
                box-sizing: border-box;
                border-radius: 4px 4px 0 0;
            `;
            
            // Discord modals can be tricky; prepending to the root of the modal/popout
            node.prepend(banner);
        }
    }

    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === 1) {
                    // Search for the popout/modal inside the newly added node
                    const profileElement = node.matches('[class*="userPopout"], [class*="userProfileModal"]') 
                        ? node 
                        : node.querySelector('[class*="userPopout"], [class*="userProfileModal"]');

                    if (profileElement) {
                        // Small delay to ensure Discord has rendered the internal ID attributes
                        setTimeout(() => injectBadge(profileElement), 50);
                    }
                }
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
