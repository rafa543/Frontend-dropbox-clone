import React, { Component } from 'react'
import api from '../../services/api'
import formatDistanceStrict from 'date-fns/formatDistanceStrict'
import pt from 'date-fns/locale/pt'
import Dropzone from 'react-dropzone'
import socket from 'socket.io-client'

import { MdInsertDriveFile } from 'react-icons/md'

import logo from '../../assets/logo.svg'
import './style.css'

export default class Box extends Component {
  state = { box: {}}

  async componentDidMount() {
    this.subscribeToNewFiles()

    const box = this.props.match.params.id
    const response = await api.get(`boxes/${box}`)

    this.setState({ box: response.data})
  }

  subscribeToNewFiles = () => {
    const box = this.props.match.params.id
    const io = socket('https://ropbox--backend.herokuapp.com')
    console.log(box, io)

    io.emit('connectRoom', box)

    io.on('file', data => {
      console.log(data)
      this.setState({ 
        box: { ...this.state.box, files: [data, ...this.state.box.files] } })
    })

  }

  handleUpload = (files) => {
    files.forEach(file => {
      const data = new FormData()
      const box = this.props.match.params.id

      data.append('file', file)

      api.post(`boxes/${box}/files`, data)
    })
  }

  render() {
    return (
      <div id="box-container">
        <header>
          <img src={logo} alt=""/>
        <h1>{this.state.box.title}</h1>
        </header>

          <Dropzone onDropAccepted={this.handleUpload}>
          {({getRootProps, getInputProps}) => (
            <section>
              <div className="upload" {...getRootProps()}>
                <input {...getInputProps()} />
                <p>Arraste arquivos ou clique aqui</p>
              </div>
            </section>
          )}
        </Dropzone>

        <ul>
          { this.state.box.files && this.state.box.files.map(file => (
            <li key={file._id}>
              <a className="fileInfo" href={file.url} target="_blank">
              <MdInsertDriveFile size={24} color="#a5cfff"/>
                <strong>{file.title}</strong>
            </a>

          <span>há {formatDistanceStrict(Date.parse(file.createdAt), new Date(), {
            locale: pt
          })}</span>
          {/* <span>{new Date(file.createdAt)}</span> */}
          </li>
          )) }
          
        </ul>
      </div>
    )
  }
}
