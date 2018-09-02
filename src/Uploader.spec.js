import React from 'react'
import TestRenderer from 'react-test-renderer'
import { shallow } from 'enzyme'
import Uploader from './Uploader'

jest.unmock('./utilities')
import * as utilities from './utilities'

const propz = {
	auth: {},
	type: "test",
	title: "Test Uploader"
}

utilities.storage = {
	ref: () => ({
		child: path => ({
			fullPath: path,
			bucket: propz.type,
			toString: () => `gs://${propz.type}/${path}`,
			put: async file => {
				await setTimeout(() => console.log("waiting"), 1000)
				return "put file successfully"
			}
		})
	})
}

utilities.db = {
	collection: collection => ({
		doc: () => ({
			set: file => {
				// console.log(collection, file)
				return null
			}
		})
	})
}

const files = {
	"horse.jpg": { name: "horse.jpg" },
	"cow.jpg": { name: "cow.jpg" },
	"pig.jpg": { name: "pig.jpg" },
	"goat.jpg": { name: "goat.jpg" }
}

const items = Object.entries(files).map(([k, v]) => {
	const tmp = Object.assign({}, v, {
		kind: "file",
		getAsFile: () => v
	})
	
	return tmp
})

const itemsNotFiles = Object.entries(files).map(([k, v]) => {
	const tmp = Object.assign({}, v, {
		kind: "something",
		getAsFile: () => v
	})
	
	return tmp
})

describe('Uploader', () => {
	let t = null

	it('renders', () => {
		t = shallow(<Uploader { ...propz } />)
	})

	it('upload', async () => {
		await t.instance().upload(Object.values(files))
		expect(t.state()).toEqual({ files, uploaded: {} })
	})
	
	it('saveFiles', async () => {
		await t.instance().saveFiles(files)
		expect(t.state()).toEqual({ files: {}, uploaded: files })
	})
	
	it('dragover', () => {
		const e = { preventDefault: jest.fn() }
		expect(e.preventDefault.mock.calls.length).toEqual(0)
		t.instance().dragover(e)
		expect(e.preventDefault.mock.calls.length).toEqual(1)
	})
	
	it('drop', () => {
		const upload = t.instance().upload
		t.instance().upload = jest.fn()
		const e = {
			preventDefault: jest.fn(),
			dataTransfer: { items, files }
		}
		
		expect(e.preventDefault.mock.calls.length).toEqual(0)
		t.instance().drop(e)
		expect(t.instance().upload.mock.calls.length).toEqual(1)
		
		expect(e.preventDefault.mock.calls.length).toEqual(1)
		
		
		delete e.dataTransfer.items
		t.instance().drop(e)
		expect(t.instance().upload.mock.calls.length).toEqual(2)
		
		e.dataTransfer.items = itemsNotFiles
		t.instance().drop(e)
		expect(t.instance().upload.mock.calls.length).toEqual(3)
		
	})
})