// db-paths.js

const DB_PATHS = {
    // Global config
    lastHomeNumber: "NexInnovation-config/lastHomeNumber",

    // User-specific (stored outside home-level, to link users to homes)
    userProfileLink: (uid) => `users/${uid}`, // Contains homeId + role
    userHomeId: (uid) => `users/${uid}/homeId`,
    userRole: (uid) => `users/${uid}/role`,

    // Home-level root
    homeRoot: (homeId) => `automation/${homeId}/`,

    // Home-level metadata
    homeData: (homeId) => `automation/${homeId}/home-data`,
    totalMembers: (homeId) => `automation/${homeId}/home-data/total member`,
    totalDevices: (homeId) => `automation/${homeId}/home-data/total device`,
    lastDevicesNumber: (homeId) => `automation/${homeId}/home-data/last device Number`,

    // Home-level user management
    userList: (homeId) => `automation/${homeId}/user-list`,
    homeAdminUser: (homeId, uid) => `automation/${homeId}/user/admin/${uid}`,
    homeMemberUser: (homeId, uid) => `automation/${homeId}/user/member/${uid}`,

    // Devices
    deviceRoot: (homeId) => `automation/${homeId}/automation/`,
    deviceById: (homeId, deviceId) => `automation/${homeId}/automation/${deviceId}`,
    deviceWifi: (homeId, deviceId) => `automation/${homeId}/automation/${deviceId}/wifi-config`,
    deviceData: (homeId, deviceId) => `automation/${homeId}/automation/${deviceId}/deviceData`,

    // Relays (per device)
    deviceRelay: (homeId, deviceId, relayKey) => `automation/${homeId}/automation/${deviceId}/${relayKey}`,
    relayState: (homeId, deviceId, relayKey) => `automation/${homeId}/automation/${deviceId}/${relayKey}/state`,
    relayType: (homeId, deviceId, relayKey) => `automation/${homeId}/automation/${deviceId}/${relayKey}/type`,
    relayName: (homeId, deviceId, relayKey) => `automation/${homeId}/automation/${deviceId}/${relayKey}/name`,
};

export default DB_PATHS;