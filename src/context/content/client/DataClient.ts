import { MetadataRequestMessage } from "../../../types/Messaging"
import { ResponseWithMetadata } from './../../../types/Messaging';


let connection = chrome.runtime.connect({
    name: 'concert_ua_metadata_request'
});

export const requestPageMetadata = async () => {

    //Awaiting page load - requesting main canvas existance...

    await new Promise((resolve) => {

        let interval = setInterval(() => {

            if(document.querySelector<HTMLElement>('svg.leaflet-image-layer')){
                clearInterval(interval);
                resolve();
            }

        }, 50);

    })

    console.log('CALC: page loaded, requesting metadata...');

    //Sending command...
   let command : MetadataRequestMessage = { command: 'concert_ua_metadata_request' },
        evtCb : (response: ResponseWithMetadata) => void = () => {};
   let response = await new Promise<ResponseWithMetadata>((resolve) => {
        evtCb = (response: ResponseWithMetadata) => {
            resolve(response);
        };
        connection.onMessage.addListener(evtCb)
        connection.postMessage(command);
   });
   connection.onMessage.removeListener(evtCb);
   return response;

}