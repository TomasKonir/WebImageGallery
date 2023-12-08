import React from 'react'

import { fetchGz } from './tools'
import Thumbnail from './Thumbnail'
import BigImage from './BigImage'

export default class ThumbnailList extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            list: [],
            selected: undefined,
            scrollTop: undefined,
        }
        this.listLoad = this.listLoad.bind(this)
        this.listLoaded = this.listLoaded.bind(this)
        this.onThumbnailClick = this.onThumbnailClick.bind(this)
    }

    componentDidMount() {
        this.listLoad(this.props.dir)

    }

    componentDidUpdate(prevProps) {
        if (prevProps.dir !== this.props.dir) {
            this.setState({ list: [], loaded: 0 })
            this.listLoad(this.props.dir)
        }
    }

    shouldComponentUpdate(nextProps) {
        if (nextProps.dir !== this.props.dir) {
            this.setState({ list: [], loaded: 0 })
            this.listLoad(nextProps.dir)
            return (false)
        }
        return (true)
    }

    listLoad(dir) {
        fetchGz(dir + '/index.json.gz', this.listLoaded)
    }

    listLoaded(list) {
        list.sort(
            (a, b) => {
                if (a.CreateDate && b.CreateDate) {
                    a = a.CreateDate.toLowerCase()
                    b = b.CreateDate.toLowerCase()
                    if (a > b) {
                        return (1)
                    } else if (a < b) {
                        return (-1)
                    } else {
                        return (0)
                    }
                } else {
                    return (0)
                }
            }
        )

        this.setState({ list: list, selected: undefined })
    }

    onThumbnailClick(img) {
        let e = document.getElementById('big-image-thumbnails')
        this.setState({ selected: img, scrollTop: e.scrollTop })
    }

    render() {
        if (this.state.selected) {
            let bigImage = <BigImage index={this.state.selected} list={this.state.list} dir={this.props.dir} onClose={() => this.setState({ selected: undefined })} />
            return (
                <div className='thumbnail-list'>
                    {bigImage}
                </div>
            )
        } else {
            let thumbs = []
            for (let i in this.state.list) {
                const img = this.state.list[i]
                thumbs.push(<Thumbnail key={img.FileName} img={img} dir={this.props.dir} onClick={() => this.onThumbnailClick(i)} />)
            }
            if (this.state.scrollTop !== undefined) {
                setTimeout(() => {
                    let e = document.getElementById('big-image-thumbnails')
                    if (e !== null) {
                        e.scrollTo({
                            top: this.state.scrollTop,
                            behavior: "auto"
                        })
                    }
                    this.state.scrollTop = undefined
                }, 25)
            }
            return (
                <div id='big-image-thumbnails' className='thumbnail-list'>
                    {thumbs}
                </div>
            )
        }
    }
}