import dashboardModules from './modules/modules-config.js';

document.addEventListener('DOMContentLoaded', () => {
    initClockEngine();
    buildDynamicSidebar();
    initMobileNavigation();
    
    // Auto-load the very first module on initial handshake
    if (dashboardModules.length > 0) {
        const firstModule = dashboardModules[0];
        if (firstModule.hasSubmenu && firstModule.submenuItems.length > 0) {
            loadModuleContent(firstModule.submenuItems[0].file, firstModule.submenuItems[0].id);
        } else {
            loadModuleContent(firstModule.file, firstModule.id);
        }
    }
});

/* ==========================================================================
   🛸 DYNAMIC SIDEBAR RENDER GENERATOR
   ========================================================================== */
function buildDynamicSidebar() {
    const navNode = document.getElementById('sidebar-navigation-node');
    if (!navNode) return;

    let sidebarHTML = '';

    dashboardModules.forEach(mod => {
        if (!mod.hasSubmenu) {
            // Standard Single Row Item Block
            sidebarHTML += `
                <div class="menu-item-group" id="group-${mod.id}">
                    <button class="nav-item-btn" onclick="window.handleModuleClick('${mod.file}', '${mod.id}', false)">
                        <span class="nav-item-left">
                            <i class="${mod.icon}"></i>
                            <span>${mod.title}</span>
                        </span>
                    </button>
                </div>
            `;
        } else {
            // Complex Expandable Dropdown Structure Block
            let submenuHTML = '';
            mod.submenuItems.forEach(sub => {
                submenuHTML += `
                    <button class="sub-nav-item" id="sub-${sub.id}" onclick="window.handleModuleClick('${sub.file}', '${sub.id}', true)">
                        ${sub.title}
                    </button>
                `;
            });

            sidebarHTML += `
                <div class="menu-item-group" id="group-${mod.id}">
                    <button class="nav-item-btn" onclick="window.toggleSubmenuGroup('${mod.id}')">
                        <span class="nav-item-left">
                            <i class="${mod.icon}"></i>
                            <span>${mod.title}</span>
                        </span>
                        <i class="fa-solid fa-chevron-down chevron-icon"></i>
                    </button>
                    <div class="submenu-list">
                        ${submenuHTML}
                    </div>
                </div>
            `;
        }
    });

    navNode.innerHTML = sidebarHTML;
}

/* ==========================================================================
   🎯 ROUTING CONTROLLER & ASYNC CONTENT INJECTOR
   ========================================================================== */
window.handleModuleClick = function(filePath, id, isSubmenuItem) {
    // Reset all global active layouts
    document.querySelectorAll('.menu-item-group').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.sub-nav-item').forEach(el => el.classList.remove('active'));

    if (isSubmenuItem) {
        const subItem = document.getElementById(`sub-${id}`);
        if (subItem) {
            subItem.classList.add('active');
            // Parent group container tracking highlights
            const parentGroup = subItem.closest('.menu-item-group');
            if (parentGroup) parentGroup.classList.add('active');
        }
    } else {
        const standardGroup = document.getElementById(`group-${id}`);
        if (standardGroup) standardGroup.classList.add('active');
        
        // Close any other open submenus if a core single item is targeted
        document.querySelectorAll('.menu-item-group').forEach(el => {
            if (el.id !== `group-${id}`) el.classList.remove('open');
        });
    }

    // Auto-collapse navigation panel state on mobile layouts post selection
    closeMobileSidebar();

    // Trigger async parsing chain
    loadModuleContent(filePath, id);
};

window.toggleSubmenuGroup = function(groupId) {
    const targetGroup = document.getElementById(`group-${groupId}`);
    if (!targetGroup) return;

    const isOpen = targetGroup.classList.contains('open');
    
    // Close other dropdown modules for single focused tree pathing
    document.querySelectorAll('.menu-item-group').forEach(el => el.classList.remove('open'));

    if (!isOpen) {
        targetGroup.classList.add('open');
    }
};

async function loadModuleContent(filePath, id) {
    const targetViewport = document.getElementById('module-content-target');
    if (!targetViewport) return;

    // Trigger elegant shimmer loader element state inside viewport
    targetViewport.innerHTML = `
        <div class="content-loading-shimmer">
            <i class="fa-solid fa-circle-notch fa-spin text-4xl text-amber-500"></i>
            <p class="text-slate-400 mt-4 text-sm tracking-widest uppercase">Fetching Channel Variables [${id}]...</p>
        </div>
    `;

    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`HTTP network mapping failure status: ${response.status}`);
        
        const htmlSnippet = await response.text();
        // Injecting core module cleanly inside layout boundary
        targetViewport.innerHTML = htmlSnippet;
    } catch (error) {
        targetViewport.innerHTML = `
            <div class="text-center py-20">
                <i class="fa-solid fa-triangle-exclamation text-red-500 text-5xl mb-4"></i>
                <h3 class="text-xl font-bold text-slate-200">Interface Loading Failure</h3>
                <p class="text-slate-400 mt-2 text-sm">Target module source file context was not found or unreachable.</p>
                <code class="block mt-4 text-xs text-red-400 bg-red-950/30 p-3 rounded border border-red-900/40 max-w-md mx-auto">${error.message}</code>
            </div>
        `;
    }
}

/* ==========================================================================
   📱 MOBILE DRAWER NAVIGATION INTERFACE LAYER
   ========================================================================== */
function initMobileNavigation() {
    const trigger = document.getElementById('mobile-menu-trigger');
    const overlay = document.getElementById('sidebar-overlay');
    
    if (trigger) trigger.addEventListener('click', openMobileSidebar);
    if (overlay) overlay.addEventListener('click', closeMobileSidebar);
}

function openMobileSidebar() {
    const sidebar = document.getElementById('dynamic-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar && overlay) {
        sidebar.classList.add('mobile-open');
        overlay.classList.add('active');
    }
}

function closeMobileSidebar() {
    const sidebar = document.getElementById('dynamic-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar && overlay) {
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('active');
    }
}

/* ==========================================================================
   ⏰ SECURE DIGITAL CLOCK METRICS
   ========================================================================== */
function initClockEngine() {
    const clockNode = document.getElementById('digital-clock');
    if (!clockNode) return;

    const runClock = () => {
        const now = new Date();
        clockNode.textContent = now.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });
    };
    
    runClock();
    setInterval(runClock, 1000);
}
