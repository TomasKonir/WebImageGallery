import React from 'react'

import { IconButton } from '@mui/material'

import FileDownloadIcon from '@mui/icons-material/FileDownload'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit'
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'

import Thumbnail from './Thumbnail'
import { clickA, downloadUrl, fullScreenEnter, fullScreenLeave } from './tools'

export default class BigImage extends React.Component {
    constructor(props) {
        super(props)

        let realDisplayVh = window.innerHeight * 0.01
        realDisplayVh = (realDisplayVh * 100) + "px"

        this.state = {
            index: props.index,
            list: props.list,
            vh: realDisplayVh,
            fullscreen: false,
            touchStartEvent: undefined,
        }
        this.fullscreenChange = this.fullscreenChange.bind(this)
        this.reload = this.reload.bind(this)
        this.keyDown = this.keyDown.bind(this)
        this.next = this.next.bind(this)
        this.prev = this.prev.bind(this)
        this.touchStart = this.touchStart.bind(this)
        this.touchEnd = this.touchEnd.bind(this)
        window.addEventListener("resize", this.reload)
        window.addEventListener('keydown', this.keyDown)
        window.addEventListener("fullscreenchange", this.fullscreenChange)
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.reload)
        window.removeEventListener('keydown', this.keyDown)
        window.removeEventListener("fullscreenchange", this.fullscreenChange)
        if (this.state.fullscreen) {
            fullScreenLeave()
        }
    }

    fullscreenChange(ev) {
        this.setState({ fullscreen: !this.state.fullscreen })
    }

    reload() {
        let realDisplayVh = window.innerHeight * 0.01
        realDisplayVh = (realDisplayVh * 100) + "px"
        this.setState({ vh: realDisplayVh })
    }

    keyDown(ev) {
        if (ev.key === 'ArrowUp' || ev.key === 'ArrowLeft') {
            this.prev()
        } else if (ev.key === 'ArrowDown' || ev.key === 'ArrowRight') {
            this.next()
        } else if (ev.key === 'Escape') {
            this.props.onClose()
        } else if (ev.key === 'd') {
            downloadUrl(this.props.dir + "/" + this.state.list[this.state.index].FileName)
        } else if (ev.key === 'f') {
            if (this.state.fullscreen) {
                fullScreenLeave()
            } else {
                fullScreenEnter()
            }
        }
    }

    next() {
        let id = parseInt(this.state.index) + 1
        if (id >= this.state.list.length) {
            id = 0
        }
        id = '' + id
        this.setState({ index: id })
    }

    prev() {
        let id = parseInt(this.state.index) - 1
        if (id < 0) {
            id = this.state.list.length - 1
        }
        id = '' + id
        this.setState({ index: id })
    }

    touchStart(ev) {
        this.setState({ touchStartEvent: ev })
    }

    touchEnd(ev) {
        if (this.state.touchStartEvent !== undefined) {
            if ((ev.timeStamp - this.state.touchStartEvent.timeStamp) < 2000) {
                let tt1 = this.state.touchStartEvent.targetTouches
                let tt2 = ev.changedTouches
                if (tt1 && tt2 && tt1.length > 0 && tt2.length > 0) {
                    let diff = tt2[0].screenX - tt1[0].screenX
                    if ((window.innerWidth / 10) < Math.abs(diff)) {
                        if (diff < 0) {
                            this.next()
                        } else {
                            this.prev()
                        }
                    }
                }
            }
        }
        this.setState({ touchStartEvent: undefined })
    }

    render() {
        let thumbs = []
        const row = window.innerWidth > window.innerHeight
        const img = this.state.list[this.state.index]
        const src = this.props.dir + "/" + img.FileName
        for (let i in this.state.list) {
            const img = this.state.list[i]
            thumbs.push(
                <Thumbnail
                    key={img.FileName}
                    img={img}
                    dir={this.props.dir}
                    onClick={() => this.setState({ index: i })}
                    className={row ? 'big-image-thumbnail-row' : 'big-image-thumbnail'}
                    selected={i === this.state.index}
                />
            )
        }

        let small = src.split(".")
        if (small.length > 1) {
            small.splice(small.length - 1, 1)
        }
        let thumbnail = small.join('.') + '_thumbnail.webp'
        if (src.endsWith('.mp4')) {
            small = small.join('.') + '_small.mp4'
        } else {
            small = small.join('.') + '_small.webp'
        }

        let ee = document.getElementById('big-image-img-waiting')
        if (ee !== null) {
            ee.style.display = 'block'
        }

        let bigImageControls = <React.Fragment>
            <div className='top-left'>
                <IconButton onClick={this.props.onClose} size='small'>
                    <ArrowBackIosIcon />
                </IconButton>
            </div>
            <div className='top-right'>
                {!window.isMobile ?
                    (this.state.fullscreen ?
                        <IconButton onClick={fullScreenLeave} size='small'>
                            <FullscreenExitIcon />
                        </IconButton>
                        :
                        <IconButton onClick={fullScreenEnter} size='small'>
                            <FullscreenIcon />
                        </IconButton>
                    ) : ''
                }
                <IconButton onClick={() => downloadUrl(src)} size='small'>
                    <FileDownloadIcon />
                </IconButton>
            </div>
        </React.Fragment>

        let bigImage
        if (small.endsWith('mp4')) {
            bigImage = <div className='big-image-content' onTouchStart={this.touchStart} onTouchEnd={this.touchEnd}>
                {bigImageControls}
                <video className="big-image-img" src={small} controls autoPlay={true}>
                    Your browser does not support the video tag.
                </video>
            </div>
        } else {
            bigImage = <div className='big-image-content' onTouchStart={this.touchStart} onTouchEnd={this.touchEnd}>
                {bigImageControls}
                <img
                    id='big-image-img'
                    className='big-image-img'
                    src={thumbnail}
                    onLoad={() => {
                        let e = document.getElementById('big-image-img')
                        if (e.src.endsWith('small.webp')) {
                            let ee = document.getElementById('big-image-img-waiting')
                            ee.style.display = 'none'
                        } else {
                            e.src = small
                        }
                    }}
                    alt={this.state.list[this.state.index].FileName} onClick={() => {
                        clickA(src)
                    }} />
                <img
                    id='big-image-img-waiting'
                    alt='waiting icon'
                    src='waiting.svg'
                    style={{
                        width: '2rem',
                        height: '2rem',
                        position: 'absolute',
                        top: 'calc( 50% - 1rem )',
                        left: 'calc( 50% - 1rem )',
                    }}
                />
            </div>
        }

        if (row) {
            return (
                <div id='big-image' className='big-image' style={{ height: this.state.vh, flexDirection: 'row' }}>
                    {bigImage}
                    <div className='vline' />
                    <div className='big-image-thumbnails-vertical' id='big-image-thumbnails'>
                        <div className='big-image-thumbnails-row'>
                            {thumbs}
                        </div>
                    </div>
                </div>
            )
        } else {
            return (
                <div id='big-image' className='big-image' style={{ height: this.state.vh }}>
                    {bigImage}
                    <div className='hline' />
                    <div className='big-image-thumbnails-horizontal' id='big-image-thumbnails'>
                        <div className='big-image-thumbnails'>
                            {thumbs}
                        </div>
                    </div>
                </div>
            )
        }
    }
}