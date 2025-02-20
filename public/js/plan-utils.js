// New file: public/js/plan-utils.js
export function createPlanItem(type, item, details = {}) {
    return {
        type,
        item,
        date: details.date || null,
        numberOfPeople: details.numberOfPeople || 1,
        snacks: details.snacks || [],
        drinks: details.drinks || [],
        createdAt: new Date().toISOString()
    };
}

export function formatDate(dateString) {
    if (!dateString) return 'Date not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function getCommonSnacks() {
    return [
        'Popcorn',
        'Nachos',
        'Chips',
        'Candy',
        'Chocolate',
        'Pretzels'
    ];
}

export function getCommonDrinks() {
    return [
        'Soda',
        'Water',
        'Juice',
        'Tea',
        'Coffee',
        'Beer',
        'Wine'
    ];
}