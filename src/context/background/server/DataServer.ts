import { MetadataResponse } from './../../../types/Messaging';
import { requestsCacheBuffer } from "../api-hook/APIHook";

chrome.runtime.onConnect.addListener((senderPort) => {

    senderPort.onMessage.addListener(
        async (message, port) => {
            if(message.command != 'concert_ua_metadata_request') return;
            
            let sender = port.sender!;
            
            try {
    
                let req = requestsCacheBuffer[sender.tab!.id!];
    
                if(!req) return port.postMessage({
                    error: 'Invalid source URL of requester'
                });
    
                let reqHeaders = req.requestHeaders!, 
                    reqBody = req.requestBody!,
                    headers: {[key: string]: string} = {},
                    method = 'POST', 
                    body : ArrayBuffer;
    
                reqHeaders.map((header) => {
                    headers[header.name] = header.value || '';
                });
                
                body = reqBody.raw![0].bytes!;
    
                fetch(req.url, {method, headers, body})
                    .then((response) => response.json())
                    .then((metadata: MetadataResponse) => port.postMessage(metadata.response));
    
            } catch(ex) {
    
                port.postMessage({
                    error: ex.message,
                    stack: ex.stack
                })
    
            }
    
        }
    );

});



