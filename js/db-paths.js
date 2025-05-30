// db-paths.js

const DB_PATHS = {
    // Global config
    lastHomeNumber: "NexInnovation-config/lastNumber",

    // User-specific
    userProfile: (uid) => `users/${uid}`,
    userHomeId: (uid) => `users/${uid}/homeId`,
    userRole: (uid) => `users/${uid}/role`,

    // Home-level paths
    homeRoot: (homeId) => `automation/${homeId}/`,
    homeData: (homeId) => `automation/${homeId}/home-data`,
    totalMembers: (homeId) => `automation/${homeId}/home-data/total member`,
    totalDevices: (homeId) => `automation/${homeId}/home-data/total device`,

    // Users inside home
    homeAdminUser: (homeId, uid) => `automation/${homeId}/user/admin/${uid}`,
    homeMemberUser: (homeId, uid) => `automation/${homeId}/user/member/${uid}`,
    userList: (homeId) => `automation/${homeId}/user-list`,

    // Devices
    deviceRoot: (homeId) => `automation/${homeId}/automation/`,
    deviceById: (homeId, deviceId) => `automation/${homeId}/automation/${deviceId}`,
    deviceWifi: (homeId, deviceId) => `automation/${homeId}/automation/${deviceId}/wifi-config`,
    deviceData: (homeId, deviceId) => `automation/${homeId}/automation/${deviceId}/deviceData`,
    deviceRelay: (homeId, deviceId, relayKey) => `automation/${homeId}/automation/${deviceId}/${relayKey}`,
    relayState: (homeId, deviceId, relayKey) => `automation/${homeId}/automation/${deviceId}/${relayKey}/state`,
    relayName: (homeId, deviceId, relayKey) => `automation/${homeId}/automation/${deviceId}/${relayKey}/name`,
};

export default DB_PATHS;