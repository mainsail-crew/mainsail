export function findDirectory (folder, dirArray) {
    if (folder !== undefined && dirArray.length) {
        if (folder.childrens) folder = folder.childrens;

        let parent = folder.find(element => (element.isDirectory && element.filename === dirArray[0]));
        if (parent) {
            dirArray.shift();
            if (dirArray.length) {
                return findDirectory(parent, dirArray);
            } else return parent.childrens;
        } else return folder;
    }
}

export function caseInsensitiveNameSort(a, b) {
    let nameA = a.name.toUpperCase();
    let nameB = b.name.toUpperCase();

    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;

    return 0;
}

export function colorConsoleMessage(item) {
    if (item.message.startsWith('!! ')) return "red--text"
    if ('type' in item && item.type === 'command') return "blue--text"

    return '';
}

export function formatConsoleMessage(message) {
    message = message.replaceAll('!! ', '')
    message = message.replaceAll('// ', '')
    message = message.replace('\n// ', '<br>')
    message = message.replace(/(?:\r\n|\r|\n)/g, '<br>')

    return message;
}