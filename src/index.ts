export class LazyWebSocket{
    private queue: string[] = [];
    private socket:WebSocket;
    private url:string;
    constructor( url:string ){
        this.url = url;
    }
    private opener():any{
        var that = this;
        return function(){
            that.open();
        }
    }
    private open(){
        let queueLength = this.queue.length;
        for (let i = 0; i < queueLength; i++) {
            this.socket.send( this.queue.shift() );
        }
    }
    send(data:any):boolean {
        //case no||null data
        if( data === undefined || data === null){
            return false;
        }

        // push data into queue
        this.queue.push(JSON.stringify(data));

        // no socket
        if( this.socket === undefined ){
            this.socket = new WebSocket( this.url );
            this.socket.onopen = this.opener();
            return false;
        }

        // socket closed/closing
        else if( this.socket.readyState === this.socket.CLOSED || this.socket.readyState === this.socket.CLOSING){
            this.socket.removeEventListener("open", this.open);
            this.socket.onopen = null;
            this.socket = new WebSocket( this.url );
            this.socket.onopen = this.opener();
            return false;
        }

        // socket connecting
        else if( this.socket.readyState === this.socket.CONNECTING ){
            return false;
        }

        // socket open
        else if( this.socket.readyState === this.socket.OPEN ){
            while( this.queue.length ){
                this.socket.send( this.queue.pop() );
            }
            return true;
        }
    }
}