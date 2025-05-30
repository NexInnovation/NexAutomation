/**
 * 🔧 Log all localStorage data to the console
 */
export function logAllLocalStorageData() {
    console.log("🟡 Logging all localStorage data:");
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);

        let parsedValue;
        try {
            parsedValue = JSON.parse(value);
        } catch (e) {
            parsedValue = value; // Fallback to plain string
        }

        console.log(`🔹 ${key}:`, parsedValue);
    }
}