export const DB_PATHS = {
    // Global
    lastDeviceNumber: "NexInnovation-config/lastDeviceNumber",

    // User-specific
    userMapping: (uid) => `users/${uid}`,
    userProfile: (homeId, uid) => `automation/${homeId}/user/${uid}`,
    userList: (homeId, uid) => `automation/${homeId}/user-list/${uid}`,

    // Wi-Fi configuration
    wifiConfig: (homeId) => `automation/${homeId}/home-config/wifi-config`,

    // Automation device path
    deviceRelay: (homeId, deviceId, relayId) => `automation/${homeId}/automation/${deviceId}/${relayId}`,
    deviceMeta: (homeId, deviceId) => `automation/${homeId}/automation/${deviceId}/deviceData`,

    deviceWiFiConfig: (homeId, deviceId) => `automation/${homeId}/automation/${deviceId}/wifi-config`,
    deviceRelayRoot: (homeId, deviceId) => `automation/${homeId}/automation/${deviceId}`,
    deviceLastNumberInHome: (homeId) => `automation/${homeId}/home-config/lastDeviceNumber`
};