export async function fetchGz(url, onOk, onErr) {
    try {
        //console.info(url)
        const result = await fetch(url, { method: 'GET', })
        const blob = await result.blob()
        const ds = new window.DecompressionStream("gzip")
        const decompressedStream = blob.stream().pipeThrough(ds)
        const json = await new Response(decompressedStream).json()
        if(onOk){
            onOk(json)
        }
    } catch (err) {
        //console.error('error:', err)
        if (onErr) {
            onErr(err)
        }
    }
}

export function downloadUrl(url) {
    const a = document.createElement('a')
    a.href = url
    a.download = url.split('/').pop()
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
}

export function clickA(url){
    const a = document.createElement('a')
    a.href = url
    a.target = '_blank'
    a.rel = 'noreferrer'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
}

export function scrollToElement(id) {
    let e = document.getElementById(id)
    if(e !== null){
        let parent = document.getElementById('big-image-thumbnails')
        parent.scrollTo({
            top: e.offsetTop - parent.offsetHeight / 2,
            left: e.offsetLeft - parent.offsetWidth / 2,
            behavior: "auto",
        })
    }
}

export function fullScreenEnter() {
    var elem = document.documentElement
    if (elem.requestFullscreen) {
        elem.requestFullscreen()
    } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen()
    }
}

export function fullScreenLeave() {
    var elem = document.documentElement
    if (elem.exitFullscreen) {
        elem.exitFullscreen()
    } else if (document.webkitExitFullscreen) { /* Safari */
        document.webkitExitFullscreen()
    }

}
