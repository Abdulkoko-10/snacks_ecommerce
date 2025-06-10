// lib/clerkStyleOverrides.js
import { calculateContrastColor } from './utils'; // Assuming utils.js is in the same lib directory

export function applyUserProfileStyles(modalRootElement) {
    if (!modalRootElement) return;

    const computedStyles = getComputedStyle(document.documentElement);
    let explicitTextColor;

    if (document.documentElement.classList.contains('dark-mode')) {
        explicitTextColor = '#d1d1d1'; // New, slightly dimmer value
        console.log('[JS Override] Dark mode detected. Using explicit text color:', explicitTextColor);
    } else if (document.documentElement.classList.contains('rgb-mode')) {
        const rgbBgColor = computedStyles.getPropertyValue('--primary-background-color-rgb').trim();
        if (rgbBgColor) {
            explicitTextColor = calculateContrastColor(rgbBgColor);
            console.log('[JS Override] RGB mode detected. Background:', rgbBgColor, 'Calculated contrast text color:', explicitTextColor);

            // Add Debug Color Fallback Logic for RGB mode
            if (explicitTextColor.toLowerCase() === rgbBgColor.toLowerCase()) {
                const debugColor = (rgbBgColor.toLowerCase() === '#ffffff') ? '#ff0000' : '#00ff00'; // Red on white, Green on others
                console.error(`[JS Override] DEBUG: RGB Contrast calculation resulted in same color as background ('${rgbBgColor}'). Forcing debug color: ${debugColor}`);
                explicitTextColor = debugColor;
            }
        } else {
            explicitTextColor = '#000000'; // Fallback for RGB if bg color not found
            console.warn('[JS Override] RGB mode: --primary-background-color-rgb not found or empty. Falling back to black text.');
        }
    } else {
        // Light mode or default
        explicitTextColor = computedStyles.getPropertyValue('--text-color-light').trim() || '#333333'; // Fallback to a known light mode text color
        console.log('[JS Override] Light mode/default detected. Using text color:', explicitTextColor);
    }
    // Update the main log for the function call
    console.log('[JS Override] applyUserProfileStyles called. Determined explicitTextColor:', explicitTextColor); // This log is fine where it is.

    // Text selectors list - this will be used differently if in RGB mode block
    const textSelectors = [
        'p', 'label', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'span', 'div', 'legend', 'td', 'th',
        '.cl-formFieldLabel', '.cl-headerTitle', '.cl-headerSubtitle',
        '.cl-profileSection__titleText', '.cl-identityPreviewText',
        '.cl-formFieldInfoText', '.cl-internalHeaderTitle', '.cl-internalHeaderSubtitle',
        '.cl-profileItemList__itemTitle', '.cl-profileItemList__itemSubtitle',
        '.cl-accordionTriggerButton', '.cl-badgeText', '.cl-verificationText',
        'button:not(.cl-button--primary):not(.cl-button--secondary):not(.cl-button--danger)' // Text on other buttons
    ];

    const glassBgColor = computedStyles.getPropertyValue('--glass-background-color').trim();
    const glassBorderColor = computedStyles.getPropertyValue('--glass-border-color').trim();
    const glassBoxShadowColor = computedStyles.getPropertyValue('--glass-box-shadow-color').trim();
    const primaryColor = computedStyles.getPropertyValue('--primary-color').trim();
    const primaryColorHover = computedStyles.getPropertyValue('--primary-color-hover').trim(); // Assuming this exists
    const btnPrimaryBg = computedStyles.getPropertyValue('--clr-btn-primary-bg').trim();
    const btnPrimaryText = computedStyles.getPropertyValue('--clr-btn-primary-text').trim();
    const btnPrimaryHoverBg = computedStyles.getPropertyValue('--clr-btn-primary-hover-bg').trim();

    // ... (rest of computedStyle fetches)

    setTimeout(() => {
        console.log('[JS Override] Applying styles inside setTimeout(0) for modal:', modalRootElement);

        // Determine theme-specific solid background color
        let themeSpecificSolidBg;
        if (document.documentElement.classList.contains('dark-mode')) {
            themeSpecificSolidBg = computedStyles.getPropertyValue('--background-dark').trim() || '#1a1a1a';
        } else if (document.documentElement.classList.contains('rgb-mode')) {
            themeSpecificSolidBg = computedStyles.getPropertyValue('--primary-background-color-rgb').trim();
            if (!themeSpecificSolidBg) {
                themeSpecificSolidBg = '#ffffff'; // Default to white for RGB if var is missing
                console.warn('[JS Override] RGB mode: --primary-background-color-rgb not found or empty for solid background. Falling back to white.');
            }
        } else { // Light mode or default
            themeSpecificSolidBg = computedStyles.getPropertyValue('--background-light').trim() || '#ffffff';
        }

        // Apply the determined solid background color first
        if (themeSpecificSolidBg) {
            console.log('[JS Override] Setting solid background-color for modal wrapper:', themeSpecificSolidBg);
            modalRootElement.style.setProperty('background-color', themeSpecificSolidBg, 'important');
        }

        // Then apply the potentially semi-transparent glass effect background over it
        // The modalRootElement IS the element we want to apply glassmorphism to.
        console.log('[Clerk Style Override] Applying glass effect background to modal wrapper:', modalRootElement);
        modalRootElement.style.setProperty('background', glassBgColor, 'important'); // This might override background-color if glassBgColor is opaque. Order might matter or glassBgColor needs to be only for filter effects.
                                                                                // For true layering, glassBgColor should be an rgba with transparency, or use background-image.
                                                                                // Re-applying background-color after 'background' if 'background' shorthand resets it.
        if (themeSpecificSolidBg) {
             modalRootElement.style.setProperty('background-color', themeSpecificSolidBg, 'important');
        }


        modalRootElement.style.setProperty('backdrop-filter', 'blur(10px)', 'important');
        modalRootElement.style.setProperty('-webkit-backdrop-filter', 'blur(10px)', 'important');
        modalRootElement.style.setProperty('border', `1px solid ${glassBorderColor}`, 'important');
        modalRootElement.style.setProperty('box-shadow', `0 8px 32px 0 ${glassBoxShadowColor}`, 'important');
        modalRootElement.style.setProperty('border-radius', '10px', 'important');

    // Now, ensure any .cl-card elements *inside* this main wrapper are made transparent
    // to avoid double-glass or opaque panel effects.
    const innerCardElements = modalRootElement.querySelectorAll('.cl-card');
    if (innerCardElements.length > 0) {
        console.log('[Clerk Style Override] Found inner .cl-card elements. Making transparent.');
        innerCardElements.forEach(innerCard => {
            innerCard.style.setProperty('background', 'transparent', 'important');
            innerCard.style.setProperty('backdrop-filter', 'none', 'important');
            innerCard.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
            innerCard.style.setProperty('border', 'none', 'important');
            innerCard.style.setProperty('box-shadow', 'none', 'important');
        });
    }


        // Apply styles to text elements
        if (document.documentElement.classList.contains('rgb-mode')) {
            console.log('[JS Override RGB] Starting text styling. explicitTextColor to be used:', explicitTextColor);
            console.log('[JS Override RGB] Number of textSelectors to iterate:', textSelectors.length);

            textSelectors.forEach(selector => {
                console.log('[JS Override RGB] Querying for selector:', selector, 'within modalRootElement:', modalRootElement);
                const elementsFound = modalRootElement.querySelectorAll(selector);
                if (elementsFound.length === 0) {
                    console.warn('[JS Override RGB] No elements found for selector:', selector);
                } else {
                    elementsFound.forEach(el => {
                        console.log('[JS Override RGB] Found element:', el, 'for selector:', selector);

                        const isTextTag = ['P', 'LABEL', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'STRONG', 'SPAN', 'LEGEND', 'TD', 'TH'].includes(el.tagName);
                        const isSpecificClerkTextClass = el.matches('.cl-formFieldLabel, .cl-headerTitle, .cl-headerSubtitle, .cl-profileSection__titleText, .cl-identityPreviewText, .cl-formFieldInfoText, .cl-internalHeaderTitle, .cl-internalHeaderSubtitle, .cl-profileItemList__itemTitle, .cl-profileItemList__itemSubtitle, .cl-accordionTriggerButton, .cl-badgeText, .cl-verificationText');

                        if (isTextTag || isSpecificClerkTextClass || (el.tagName === 'DIV' && el.children.length === 0 && el.textContent.trim().length > 0) ) {
                            const originalComputedColor = getComputedStyle(el).color;
                            console.log('[JS Override RGB] Intending to apply color:', explicitTextColor, 'to element:', el, 'Current computed color:', originalComputedColor);
                            el.style.setProperty('color', explicitTextColor, 'important');
                            console.log('[JS Override RGB] Applied inline style el.style.color:', el.style.getPropertyValue('color'), 'Priority:', el.style.getPropertyPriority('color'));
                            console.log('[JS Override RGB] Computed color immediately after setProperty:', getComputedStyle(el).color);

                            // Remove Diagnostic Styles (outline, text-decoration)
                            // el.style.removeProperty('outline'); // Or set to 'none'
                            // el.style.removeProperty('text-decoration'); // Or set to 'none'
                            // Forcing removal by setting to none for high specificity cases
                            el.style.setProperty('outline', 'none', 'important');
                            el.style.setProperty('text-decoration', 'none', 'important');
                            // console.log('[JS Override RGB] Removed debug outline and text-decoration from:', el);


                            // Implement "Double Tap" Color Application
                            const checkerTimeoutMs = 100;
                            setTimeout(() => {
                                const currentColor = getComputedStyle(el).color;
                                const targetRgbColor = explicitTextColor; // Capture for closure
                                let needsReapplication = false;

                                const inlineColorAfterInitialSet = el.style.getPropertyValue('color');

                                if (inlineColorAfterInitialSet.toLowerCase() !== targetRgbColor.toLowerCase()) {
                                     console.warn(`[JS Override RGB Inner Check - ${checkerTimeoutMs}ms] Color for element:`, el, `seems to have changed from "${targetRgbColor}" to computed "${currentColor}" (inline: "${inlineColorAfterInitialSet}"). Re-applying.`);
                                     needsReapplication = true;
                                } else if (getComputedStyle(el).opacity === '0' || getComputedStyle(el).visibility === 'hidden') {
                                    console.warn(`[JS Override RGB Inner Check - ${checkerTimeoutMs}ms] Element became hidden/transparent:`, el, `Re-applying color and forcing visibility.`);
                                    needsReapplication = true;
                                }

                                if (needsReapplication) {
                                    el.style.setProperty('color', targetRgbColor, 'important');
                                    el.style.setProperty('opacity', '1', 'important');
                                    el.style.setProperty('visibility', 'visible', 'important');
                                    console.log(`[JS Override RGB Inner Check - ${checkerTimeoutMs}ms] Re-applied color "${targetRgbColor}" and visibility to element:`, el);
                                } else {
                                    // console.log(`[JS Override RGB Inner Check - ${checkerTimeoutMs}ms] Color for element:`, el, `seems to have stuck at "${targetRgbColor}" (computed: "${currentColor}").`);
                                }
                            }, checkerTimeoutMs);
                        }
                    });
                }
            });
            console.log(`[Clerk Style Override] Finished applying RGB text color "${explicitTextColor}" and debug styles.`);

        } else { // For Dark mode or Light mode (non-RGB)
            textSelectors.forEach(selector => {
                modalRootElement.querySelectorAll(selector).forEach(el => {
                    const isTextTag = ['P', 'LABEL', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'STRONG', 'SPAN', 'LEGEND', 'TD', 'TH'].includes(el.tagName);
                    const isSpecificClerkTextClass = el.matches('.cl-formFieldLabel, .cl-headerTitle, .cl-headerSubtitle, .cl-profileSection__titleText, .cl-identityPreviewText, .cl-formFieldInfoText, .cl-internalHeaderTitle, .cl-internalHeaderSubtitle, .cl-profileItemList__itemTitle, .cl-profileItemList__itemSubtitle, .cl-accordionTriggerButton, .cl-badgeText, .cl-verificationText');

                    if (isTextTag || isSpecificClerkTextClass || (el.tagName === 'DIV' && el.children.length === 0 && el.textContent.trim().length > 0) ) {
                        const originalComputedColor = getComputedStyle(el).color;
                        console.log('[JS Override] Intending to apply color:', explicitTextColor, 'to element:', el, 'Current computed color:', originalComputedColor);
                        el.style.setProperty('color', explicitTextColor, 'important');
                        console.log('[JS Override] Applied inline style el.style.color:', el.style.getPropertyValue('color'), 'Priority:', el.style.getPropertyPriority('color'));
                        console.log('[JS Override] Computed color immediately after setProperty:', getComputedStyle(el).color);
                    }
                });
            });
            console.log(`[Clerk Style Override] Finished applying text color "${explicitTextColor}" to text elements.`);
        }

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

    console.log('[JS Override] Style application complete for this modal instance (inside setTimeout).');
    }, 0); // End of setTimeout
}

let observer = null;

export function observeUserProfileModal() {
    if (observer) {
        // console.log('[Clerk Style Override] Observer already active.');
        return; // Already observing
    }

    const targetNode = document.body;
    // Ensure attributeFilter includes 'style' and 'class'
    const config = {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
    };

    const callback = function(mutationsList, obs) {
        for(const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const userProfileModalRoot = node.matches('.cl-userProfile-root') ? node : node.querySelector('.cl-userProfile-root');
                        const userProfileSheetRoot = node.matches('.cl-userProfileSheet') ? node : node.querySelector('.cl-userProfileSheet');
                        const genericModalRoot = node.matches('div[data-clerk-modal="userProfile"] .cl-modal-content') ? node : node.querySelector('div[data-clerk-modal="userProfile"] .cl-modal-content');

                        let actualModalRoot = null;
                        if (genericModalRoot) actualModalRoot = genericModalRoot;
                        else if (userProfileSheetRoot) actualModalRoot = userProfileSheetRoot;
                        else if (userProfileModalRoot) actualModalRoot = userProfileModalRoot;

                        if (actualModalRoot) {
                            console.log('[JS Override] User Profile modal type detected/added:', actualModalRoot.className);
                            applyUserProfileStyles(actualModalRoot);
                        }
                    }
                });
            } else if (mutation.type === 'attributes') {
                // Enhanced logic for attribute mutations
                const modalRootElement = mutation.target.closest('.cl-userProfile-root, .cl-userProfileSheet, div[data-clerk-modal="userProfile"] .cl-modal-content');

                if (modalRootElement) {
                    // Check if the modal is currently visible
                    if (getComputedStyle(modalRootElement).display !== 'none' &&
                        getComputedStyle(modalRootElement).visibility !== 'hidden' &&
                        getComputedStyle(modalRootElement).opacity !== '0') {

                        console.log('[JS Override] Attribute mutation detected on target:', mutation.target, 'Attribute changed:', mutation.attributeName, '. Re-applying styles to modal:', modalRootElement);
                        applyUserProfileStyles(modalRootElement);
                    } else {
                        // console.log('[JS Override] Attribute mutation on hidden User Profile modal. Styles not reapplied.');
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
