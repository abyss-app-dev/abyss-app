export function wait(ms = 50) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
