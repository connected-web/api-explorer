import EventEmitter from '../actions/EventEmitter'
import { LGraphNode } from 'litegraph.js'

export class NodeEventBus extends EventEmitter<LGraphNode> {

}

export const singleton = new NodeEventBus()
