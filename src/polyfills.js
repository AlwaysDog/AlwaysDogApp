import buffer from 'buffer/'
const { Buffer } = buffer
import process from 'process'
import EventEmitter from 'events'

// Polyfill Buffer globally
window.Buffer = Buffer
globalThis.Buffer = Buffer

// Other necessary polyfills
window.global = window
window.process = process
window.EventEmitter = EventEmitter

// Ensure process.env exists
if (!process.env) {
    process.env = {
        DEBUG: undefined,
        NODE_ENV: process.env.NODE_ENV
    }
}