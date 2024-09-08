function createDateInIST() {
    const date = Date.now();

    date.setHours(date.getHours() + 5);
    date.setMinutes(date.getMinutes() + 30);

    return date;
}

module.exports = { createDateInIST };