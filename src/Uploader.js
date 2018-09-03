import React from 'react'
import PropTypes from "prop-types"

import { storage, db } from './utilities'

export default class Uploader extends React.Component {
	static propTypes = {
		auth: PropTypes.object,
		type: PropTypes.string,
		title: PropTypes.string
	}

	constructor (props) {
		super(props)

		this.upload = this.upload.bind(this)
		this.saveFiles = this.saveFiles.bind(this)
	}

	state = { files: {}, uploaded: {} }

	async saveFiles (filesMap) {
		const { type } = this.props
		const storageRef = storage.ref()
		
		Object.values(filesMap).forEach(async file => {
			const fileRef = storageRef.child(`/${type}/${file.name}`)
			const snapshot = await fileRef.put(file)
			
			console.log(snapshot)
			
			const { fullPath, bucket } = fileRef
			const url = fileRef.toString()
			await db.collection("files").doc().set({ fullPath, bucket, url })
			
			const ff = this.state.files
			delete ff[file.name]
			this.setState({ uploaded: Object.assign({}, this.state.uploaded, { [file.name]: file }), files: ff })
		})
		
	}

	async upload (files) {
		let filesMap = {}
		files.forEach(f => filesMap[f.name] = f)
		await this.setState({ files: Object.assign({}, this.state.files, filesMap) })
		await this.saveFiles(filesMap)
	}

	dragover (e) { e.preventDefault() }
	
	drop (e) {
		e.preventDefault()
		const files = []

		if (e.dataTransfer.items) {
			for (let f in e.dataTransfer.items) {
				if (e.dataTransfer.items[f].kind === "file") {
					let file = e.dataTransfer.items[f].getAsFile()
					files.push(file)
				}
			}
		}
		else {
			for (let f in e.dataTransfer.files) {
				let file = e.dataTransfer.files[f]
				files.push(file)
			}
		}
		
		this.upload(files)
	}

	render () {
		const { done, drop, dragover } = this
		const { files, uploaded } = this.state
		
		return (
			<div style={ { display: "flex", flexDirection: "column", background: "transparent" } } >
				<div style={ { padding: "2em" } } >
					<div onDrop={ drop } onDragOver={ dragover } style={ { zIndex: 5, background: "transparent", padding: "3em", border: "0.1em dashed lightgrey", borderRadius: "0.5em", margin: "1em" } } >
						<div style={ { padding: "2em", fontWeight: "bold" } } >Drag and Drop Files to this Box to Upload Them</div>
						<div style={ { display: "flex", flexDirection: "column" } } >
							{ Object.keys(files).length > 0 &&
								<div>
									<div>Queued</div>
									{ Object.values(files).map((file, i) => (
										<div key={ i } style={ { display: "flex", flexDirection: "row" } } >
											<div style={ { padding: "0.5em" } } >{ file.name }</div>
											<div style={ { padding: "0.5em" } } >{ file.type }</div>
										</div>
									)) }
								</div>
							}
						</div>
						<div style={ { display: "flex", flexDirection: "column" } } >
							{ Object.keys(uploaded).length > 0 &&
								<div>
									<div>Uploaded</div>
									{ Object.values(uploaded).map((file, i) => (
										<div key={ i } style={ { display: "flex", flexDirection: "row" } } >
											<div style={ { padding: "0.5em" } } >{ file.name }</div>
											<div style={ { padding: "0.5em" } } >{ file.type }</div>
										</div>
									)) }
								</div>
							}
						</div>
					</div>
					<div style={ { display: "flex", flexDirection: "row" } } >
						<div style={ { flex: 1 } } ></div>
						<div style={ { background: "linear-gradient(#3979d2, #154c94)", color: "white", borders: "none", padding: "0.3em", flex: 1 } } onClick={ done } >Done</div>
						<div style={ { flex: 1 } } ></div>
					</div>
				</div>
			</div>
		)
	}
}

/*

import React from 'react';
// import { Link } from 'react-router-dom'
// import PropTypes from 'prop-types'

import { styles } from '../utilities'

const Upload = ({ change, next }) => (
	<div style={ { display: "flex", flexDirection: "column", backgroundColor: "rgba(0, 0, 0, 0.3)", color: "#bebfbd" } } >
		<div style={ styles.paddingTwo } >
			<div style={ { ...styles.boldText, ...styles.paddingTwo } } >Choose Some Pictures to Upload</div>
			<input style={ { ...styles.paddingTwo, width: "100%", height: "100%" } } type="file" multiple accept="image/*" onChange={ change } />
			<div style={ { ...styles.button, width: "40%" } } onClick={ next } >Done</div>
		</div>
	</div>
)

export default Upload

*/