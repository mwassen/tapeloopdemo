module.exports = () => {
    return {
        hand: {
            active: false,
            item: null
        },
        table: {
            freePositions: [],
            usedPositions: [],
            size: []
        },
        decks: {
            container: null,
            placed: []
        }
    }
}