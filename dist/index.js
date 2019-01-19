"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class LazyWebSocket {
    constructor(url) {
        this.queue = [];
        this.url = url;
    }
    opener() {
        var that = this;
        return function () {
            that.open();
        };
    }
    open() {
        let queueLength = this.queue.length;
        for (let i = 0; i < queueLength; i++) {
            this.socket.send(this.queue.shift());
        }
    }
    send(data) {
        if (data === undefined || data === null) {
            return false;
        }
        this.queue.push(JSON.stringify(data));
        if (this.socket === undefined) {
            this.socket = new WebSocket(this.url);
            this.socket.onopen = this.opener();
            return false;
        }
        else if (this.socket.readyState === this.socket.CLOSED || this.socket.readyState === this.socket.CLOSING) {
            this.socket.removeEventListener("open", this.open);
            this.socket.onopen = null;
            this.socket = new WebSocket(this.url);
            this.socket.onopen = this.opener();
            return false;
        }
        else if (this.socket.readyState === this.socket.CONNECTING) {
            return false;
        }
        else if (this.socket.readyState === this.socket.OPEN) {
            while (this.queue.length) {
                this.socket.send(this.queue.pop());
            }
            return true;
        }
    }
}
exports.LazyWebSocket = LazyWebSocket;
