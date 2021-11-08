export function sortCommitsByName(current_state, all_data) {
    return current_state.sort((a, b) => a.toString() > b.toString())
}

export function sortCommitsByDate(current_state, all_data) {
    return current_state.sort((a, b) => a.getDate() > b.getDate())
}