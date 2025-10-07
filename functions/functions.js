export function generateRandomId() {
    return String(Date.now()) + String(Math.floor(Math.random() * 200) + 90);
}