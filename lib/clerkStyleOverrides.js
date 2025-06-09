// lib/clerkStyleOverrides.js

export function applyUserProfileStyles(modalRootElement) {
    if (!modalRootElement) return;

    console.log('[Clerk Style Override] Applying styles to User Profile modal:', modalRootElement);

    const computedStyles = getComputedStyle(document.documentElement);
    const textColor = computedStyles.getPropertyValue('--text-color').trim();
    const glassBgColor = computedStyles.getPropertyValue('--glass-background-color').trim();
    const glassBorderColor = computedStyles.getPropertyValue('--glass-border-color').trim();
    const glassBoxShadowColor = computedStyles.getPropertyValue('--glass-box-shadow-color').trim();
    const primaryColor = computedStyles.getPropertyValue('--primary-color').trim();
    const primaryColorHover = computedStyles.getPropertyValue('--primary-color-hover').trim(); // Assuming this exists
    const btnPrimaryBg = computedStyles.getPropertyValue('--clr-btn-primary-bg').trim();
    const btnPrimaryText = computedStyles.getPropertyValue('--clr-btn-primary-text').trim();
    const btnPrimaryHoverBg = computedStyles.getPropertyValue('--clr-btn-primary-hover-bg').trim();

    // Apply styles to the main card
    // Common selectors for the modal's main card structure
    const cardSelectors = [
        '.cl-card',
        '.cl-userProfileSheetContent', // Clerk may use different classes for sheet components
        '.cl-modal-content' // General modal content class
    ];

    let cardElement;
    for (const selector of cardSelectors) {
        cardElement = modalRootElement.querySelector(selector);
        if (cardElement) break;
    }

    if (cardElement) {
        console.log('[Clerk Style Override] Found card element:', cardElement);
        cardElement.style.setProperty('background', glassBgColor, 'important');
        cardElement.style.setProperty('backdrop-filter', 'blur(10px)', 'important');
        cardElement.style.setProperty('-webkit-backdrop-filter', 'blur(10px)', 'important');
        cardElement.style.setProperty('border', `1px solid ${glassBorderColor}`, 'important');
        cardElement.style.setProperty('box-shadow', `0 8px 32px 0 ${glassBoxShadowColor}`, 'important');
        cardElement.style.setProperty('border-radius', '10px', 'important');
    } else {
        console.log('[Clerk Style Override] Main card element not found with selectors:', cardSelectors.join(', '));
        // As a fallback, apply to modalRootElement itself if it's the direct card
        if (modalRootElement.matches('.cl-card, .cl-userProfileSheetContent, .cl-modal-content')) {
             modalRootElement.style.setProperty('background', glassBgColor, 'important');
             modalRootElement.style.setProperty('backdrop-filter', 'blur(10px)', 'important');
             // ... and other glassmorphism styles
             console.log('[Clerk Style Override] Applied glassmorphism to modalRootElement itself.');
        }
    }

    // Apply styles to text elements
    const textSelectors = [
        'p', 'label', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'span', 'div', 'legend', 'td', 'th',
        '.cl-formFieldLabel', '.cl-headerTitle', '.cl-headerSubtitle',
        '.cl-profileSection__titleText', '.cl-identityPreviewText',
        '.cl-formFieldInfoText', '.cl-internalHeaderTitle', '.cl-internalHeaderSubtitle',
        '.cl-profileItemList__itemTitle', '.cl-profileItemList__itemSubtitle',
        '.cl-accordionTriggerButton', '.cl-badgeText', '.cl-verificationText',
        'button:not(.cl-button--primary):not(.cl-button--secondary):not(.cl-button--danger)' // Text on other buttons
    ];

    textSelectors.forEach(selector => {
        modalRootElement.querySelectorAll(selector).forEach(el => {
            // More targeted check: only apply if the element itself is likely to display text directly
            // or if it's a specific Clerk class known for text.
            const isTextTag = ['P', 'LABEL', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'STRONG', 'SPAN', 'LEGEND', 'TD', 'TH'].includes(el.tagName);
            const isSpecificClerkTextClass = el.matches('.cl-formFieldLabel, .cl-headerTitle, .cl-headerSubtitle, .cl-profileSection__titleText, .cl-identityPreviewText, .cl-formFieldInfoText, .cl-internalHeaderTitle, .cl-internalHeaderSubtitle, .cl-profileItemList__itemTitle, .cl-profileItemList__itemSubtitle, .cl-accordionTriggerButton, .cl-badgeText, .cl-verificationText');

            if (isTextTag || isSpecificClerkTextClass || (el.tagName === 'DIV' && el.children.length === 0 && el.textContent.trim().length > 0) ) {
                 el.style.setProperty('color', textColor, 'important');
            }
        });
    });
    console.log(`[Clerk Style Override] Applied text color "${textColor}" to text elements.`);

    // Apply styles to transparent intermediate containers
    const transparentSelectors = [
        '.cl-internal-card', '.cl-profileSection', '.cl-profilePage',
        '.cl-pageContent', '.cl-scrollableContent', '.cl-actionCard',
        '.cl-accordionContent', '.cl-accordionItem', '.cl-navbar', '.cl-profileSidebar'
    ];
    transparentSelectors.forEach(selector => {
        modalRootElement.querySelectorAll(selector).forEach(el => {
            el.style.setProperty('background', 'transparent', 'important');
            el.style.setProperty('background-color', 'transparent', 'important');
        });
    });
     console.log('[Clerk Style Override] Applied transparent backgrounds to intermediate containers.');

    // Apply styles to buttons
    modalRootElement.querySelectorAll('.cl-button--primary, .cl-formButtonPrimary, .cl-profileSectionPrimaryButton').forEach(el => {
        el.style.setProperty('background-color', btnPrimaryBg, 'important');
        el.style.setProperty('color', btnPrimaryText, 'important');
        el.style.setProperty('border', 'none', 'important');
    });
    // Add hover for primary buttons if needed - requires mouseenter/mouseleave or CSS class toggling

    // Apply styles to links
     modalRootElement.querySelectorAll('a, .cl-link').forEach(el => {
        el.style.setProperty('color', primaryColor, 'important');
    });
    // Add hover for links if needed

    console.log('[Clerk Style Override] Style application complete for this modal instance.');
}

let observer = null;

export function observeUserProfileModal() {
    if (observer) {
        // console.log('[Clerk Style Override] Observer already active.');
        return; // Already observing
    }

    const targetNode = document.body;
    const config = { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] };

    const callback = function(mutationsList, obs) {
        for(const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if the added node itself is the modal root or contains it
                        const userProfileModalRoot = node.matches('.cl-userProfile-root') ? node : node.querySelector('.cl-userProfile-root');
                        const userProfileSheetRoot = node.matches('.cl-userProfileSheet') ? node : node.querySelector('.cl-userProfileSheet');
                        // General modal selector (more specific for userProfile if possible)
                        const genericModalRoot = node.matches('div[data-clerk-modal="userProfile"] .cl-modal-content') ? node : node.querySelector('div[data-clerk-modal="userProfile"] .cl-modal-content');


                        if (userProfileModalRoot) {
                            console.log('[Clerk Style Override] User Profile modal (.cl-userProfile-root) added to DOM.');
                            applyUserProfileStyles(userProfileModalRoot);
                        } else if (userProfileSheetRoot) {
                            console.log('[Clerk Style Override] User Profile sheet (.cl-userProfileSheet) added to DOM.');
                            applyUserProfileStyles(userProfileSheetRoot);
                        } else if (genericModalRoot) {
                            console.log('[Clerk Style Override] Generic User Profile modal content added to DOM.');
                            applyUserProfileStyles(genericModalRoot);
                        }
                    }
                });
            } else if (mutation.type === 'attributes') {
                // If a style or class attribute changes on an already present modal, reapply styles
                // This is broad; could be narrowed if specific attribute changes are known
                if (mutation.target.nodeType === Node.ELEMENT_NODE) {
                    const userProfileModalRoot = mutation.target.closest('.cl-userProfile-root, .cl-userProfileSheet, div[data-clerk-modal="userProfile"] .cl-modal-content');
                    if (userProfileModalRoot && userProfileModalRoot.contains(mutation.target)) {
                         // Check if it's visible - Clerk might keep it in DOM but hidden
                        if (getComputedStyle(userProfileModalRoot).display !== 'none' && getComputedStyle(userProfileModalRoot).visibility !== 'hidden') {
                            console.log('[Clerk Style Override] Attribute change detected on User Profile modal or its child. Reapplying styles.');
                            applyUserProfileStyles(userProfileModalRoot);
                        }
                    }
                }
            }
        }
    };

    observer = new MutationObserver(callback);
    observer.observe(targetNode, config);
    console.log('[Clerk Style Override] MutationObserver started for User Profile modal.');

    // Initial check in case modal is already present
    const existingModal = document.querySelector('.cl-userProfile-root, .cl-userProfileSheet, div[data-clerk-modal="userProfile"] .cl-modal-content');
    if (existingModal) {
        console.log('[Clerk Style Override] Found existing User Profile modal on initial load.');
        applyUserProfileStyles(existingModal);
    }
}

// Optional: Function to stop observing if needed
export function stopObservingUserProfileModal() {
    if (observer) {
        observer.disconnect();
        observer = null;
        console.log('[Clerk Style Override] MutationObserver stopped.');
    }
}
