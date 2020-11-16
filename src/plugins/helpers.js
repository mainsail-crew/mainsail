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