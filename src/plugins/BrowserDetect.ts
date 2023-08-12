export const browserDetect = () => {
    const browserAgent = navigator.userAgent
    let browserName = navigator.appName
    let browserVersion = '' + parseFloat(navigator.appVersion)
    let browserMajorVersion: number
    let Offset, OffsetVersion, ix

    // For Chrome
    if ((OffsetVersion = browserAgent.indexOf('Chrome')) != -1) {
        browserName = 'Chrome'
        browserVersion = browserAgent.substring(OffsetVersion + 7)
    }

    // For Microsoft internet explorer
    else if ((OffsetVersion = browserAgent.indexOf('MSIE')) != -1) {
        browserName = 'Microsoft Internet Explorer'
        browserVersion = browserAgent.substring(OffsetVersion + 5)
    }

    // For Firefox
    else if ((OffsetVersion = browserAgent.indexOf('Firefox')) != -1) {
        browserName = 'Firefox'
    }

    // For Safari
    else if ((OffsetVersion = browserAgent.indexOf('Safari')) != -1) {
        browserName = 'Safari'
        browserVersion = browserAgent.substring(OffsetVersion + 7)
        if ((OffsetVersion = browserAgent.indexOf('Version')) != -1)
            browserVersion = browserAgent.substring(OffsetVersion + 8)
    }

    // For other browser "name/version" is at the end of userAgent
    else if ((Offset = browserAgent.lastIndexOf(' ') + 1) < (OffsetVersion = browserAgent.lastIndexOf('/'))) {
        browserName = browserAgent.substring(Offset, OffsetVersion)
        browserVersion = browserAgent.substring(OffsetVersion + 1)
        if (browserName.toLowerCase() == browserName.toUpperCase()) {
            browserName = navigator.appName
        }
    }

    // Trimming the fullVersion string at
    // semicolon/space if present
    if ((ix = browserVersion.indexOf(';')) != -1) browserVersion = browserVersion.substring(0, ix)
    if ((ix = browserVersion.indexOf(' ')) != -1) browserVersion = browserVersion.substring(0, ix)

    browserMajorVersion = parseInt('' + browserVersion, 10)
    if (isNaN(browserMajorVersion)) {
        browserVersion = '' + parseFloat(navigator.appVersion)
        browserMajorVersion = parseInt(navigator.appVersion, 10)
    }

    return {
        name: browserName,
        version: browserVersion,
        majorVersion: browserMajorVersion,
        appName: navigator.appName ?? null,
        userAgent: navigator.userAgent ?? null,
    }
}
