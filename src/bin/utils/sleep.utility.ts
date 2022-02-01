export function sleep(delay: number) {
    let start = new Date().getTime();
    while (new Date().getTime() < start + delay);
}