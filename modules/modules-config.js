const dashboardModules = [
    {
        id: "system-home",
        title: "System Controller",
        icon: "fa-solid fa-layer-group",
        file: "modules/system-home.html",
        hasSubmenu: false
    },
    {
        id: "vahan-services",
        title: "Vahan Services",
        icon: "fa-solid fa-car",
        hasSubmenu: true,
        submenuItems: [
            { id: "vahan-token", title: "Token Registry", file: "modules/vahan-token.html" },
            { id: "vahan-status", title: "Verification Status", file: "modules/vahan-status.html" }
        ]
    }
    // 💡 FUTURE UPGRADE TIP: Jab bhi naya feature aaye, bas comma (,) laga kar aisa hi ek object niche jod dena!
];

// Browser dynamic loading ke liye export
export default dashboardModules;
