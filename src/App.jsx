import 'material-design-icons/iconfont/material-icons.css'
import "@fontsource/roboto"

import React from 'react'
import CssBaseline from '@mui/material/CssBaseline'

import { ThemeProvider, createTheme } from '@mui/material/styles'

import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'

import { fetchGz } from './tools'
import ThumbnailList from './ThumbnailList'
import { IconButton } from '@mui/material'

import { fullScreenEnter, fullScreenLeave } from './tools'



class DirEntry extends React.Component {
    render() {
        let list = []
        let style = {
            marginLeft: (this.props.depth * 1) + 'rem',
        }
        if (this.props.depth >= 0) {
            let clickable = this.props.subdirs._count > 0
            if (!clickable) {
                style.cursor = 'default'
            }
            if (this.props.dir === this.props.base) {
                style.backgroundColor = '#08045e'
            }
            if(window.isMobile){
                style.fontSize = '1.4rem'
                style.minHeight = '2rem'
            }
            list.push(
                <div
                    key={this.props.depth + 'base'}
                    className='dir-entry'
                    style={style}
                    onClick={clickable ? () => this.props.onClick(this.props.base) : null}
                >
                    {this.props.name.split('_').join(' ').split('-').join(' ')}
                </div>
            )
        }
        for (let i in this.props.subdirs) {
            if (!i.startsWith('_')) {
                list.push(
                    <DirEntry
                        key={this.props.depth + i}
                        base={this.props.base + '/' + i}
                        name={i}
                        subdirs={this.props.subdirs[i]}
                        depth={this.props.depth + 1}
                        dir={this.props.dir}
                        onClick={this.props.onClick}
                    />
                )
            }
        }
        return (<React.Fragment>
            {list}
        </React.Fragment>)
    }
}

class App extends React.Component {
    constructor(props) {
        super(props)
        let dir = []
        if ('URLSearchParams' in window) {
            var searchParams = new URLSearchParams(window.location.search)
            dir = searchParams.get("dir")
            console.info(dir)
            if (dir === undefined || dir === null) {
                dir = ''
            }
        }
        this.state = {
            dir: dir,
            dirList: {},
            fullscreen: false,
        }

        this.dirClicked = this.dirClicked.bind(this)
        this.fullscreenChange = this.fullscreenChange.bind(this)

        fetchGz('data/dirs.json.gz', (list) => this.setState({ dirList: list }))
        window.addEventListener("fullscreenchange", this.fullscreenChange)
    }

    componentWillUnmount() {
        window.removeEventListener("fullscreenchange", this.fullscreenChange)
    }

    fullscreenChange(ev) {
        this.setState({ fullscreen: !this.state.fullscreen })
    }

    dirClicked(dir) {
        this.setState({ dir: dir })
        if ('URLSearchParams' in window) {
            var searchParams = new URLSearchParams(window.location.search)
            searchParams.set("dir", dir)
            var newRelativePathQuery = window.location.pathname + '?' + searchParams.toString()
            window.history.pushState(null, '', newRelativePathQuery)
        }
        if (window.isMobile) {
            fullScreenEnter()
        }
    }

    render() {
        const theme = createTheme({
            palette: {
                mode: 'dark',
            },
            typography: {
                button: {
                    textTransform: 'none'
                },
                "fontFamily": `"Roboto", "Helvetica", "Arial", sans-serif`,
                "fontSize": 14,
                "fontWeightLight": 300,
                "fontWeightRegular": 400,
                "fontWeightMedium": 500,
            },
        })

        if (window.isMobile) {
            if (this.state.dir === '') {
                return (
                    <ThemeProvider theme={theme}>
                        <CssBaseline key="css" />
                        <div className='body-mobile'>
                            <div className='dir-list' style={{ minWidth: 'unset', width: '100%', maxWidth: '100%' }}>
                                <DirEntry base='' subdirs={this.state.dirList} depth={-1} onClick={this.dirClicked} dir={this.state.dir} />
                            </div>
                        </div>
                    </ThemeProvider>
                )
            } else {
                return (
                    <ThemeProvider theme={theme}>
                        <CssBaseline key="css" />
                        <div className='body-mobile'>
                            <div className='header'>
                                <IconButton size='small' onClick={() => {
                                    this.setState({dir : ''})
                                    if (this.state.fullscreen) {
                                        fullScreenLeave()
                                    }
                                }}>
                                    <ArrowBackIosIcon />
                                </IconButton>
                                <div className='spacer' />
                                <div className='centered-vertical header-text'>{this.state.dir}</div>
                                <div className='spacer' />
                            </div>
                            <div className='hline' />
                            <ThumbnailList dir={'data/' + this.state.dir} />
                        </div>
                    </ThemeProvider>
                )
            }
        } else {
            return (
                <ThemeProvider theme={theme}>
                    <CssBaseline key="css" />
                    <div className='body-wide'>
                        <div className='dir-list'>
                            <DirEntry base='' subdirs={this.state.dirList} depth={-1} onClick={this.dirClicked} dir={this.state.dir} />
                        </div>
                        <div className='vline' />
                        <ThumbnailList dir={'data/' + this.state.dir} />
                    </div>
                </ThemeProvider>
            )
        }
    }
}

export default App
