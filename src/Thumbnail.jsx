import React from 'react'
import { scrollToElement } from './tools'

export default class Thumbnail extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            visible: false,
        }
        this.ref = React.createRef()
        this.visibility = this.visibility.bind(this)
    }

    componentDidMount() {
        this.observer = new IntersectionObserver(this.visibility, { rootMargin: "10% 0px 10% 0px", root: document.getElementById('big-image-thumbnails') })
        this.observer.observe(this.ref.current)
    }

    visibility(ev) {
        if(ev[0].isIntersecting){
            this.setState({visible : true})
        }
    }

    render() {
        //console.info("render thumbnail: " + this.props.img.FileName)
        let file = this.props.img.FileName.split(".")
        if (file.length > 1) {
            file.splice(file.length - 1, 1)
        }
        file = file.join('.')
        let imgClassName = 'thumbnail-img'
        let className = 'thumbnail'
        if (this.props.className) {
            imgClassName += ' ' + this.props.className
        }
        if (this.props.selected) {
            className += ' selected'
            setTimeout(() => scrollToElement(file), 50)
        }

        let width = this.props.img.ImageWidth
        let height = this.props.img.ImageHeight

        if (this.props.img.Orientation !== null) {
            const orient = this.props.img.Orientation
            if (orient.includes('90') || orient.includes('270')) {
                height = this.props.img.ImageWidth
                width = this.props.img.ImageHeight
            }
        }

        width /= height / 128
        height = 128

        let src = ''
        if(this.state.visible){
            src = this.props.dir + "/" + file + '_thumbnail.webp'
        }
        let style = {}
        if(window.isMobile && width < (height * 3)){
            style.maxWidth = 'calc( 33vw - 10px )'
        }
        return (
            <div ref={this.ref} id={file} className={className} onClick={this.props.onClick}>
                <img className={imgClassName} src={src} alt={file} loading="lazy" width={width} height={height} style={style}/>
            </div>
        )
    }
}