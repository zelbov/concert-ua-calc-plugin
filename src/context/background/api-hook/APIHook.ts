export var requestsCacheBuffer : {
    [key: number] : chrome.webRequest.WebRequestHeadersDetails & chrome.webRequest.WebRequestBodyDetails
} = {};

[
    chrome.webRequest.onBeforeRequest,
    chrome.webRequest.onBeforeSendHeaders
]
.map((evt, idx) => {

    evt.addListener( (
        details: chrome.webRequest.WebRequestHeadersDetails | chrome.webRequest.WebRequestBodyDetails
    ) => {

        if(!details.tabId) return;

        if(details.initiator)
            if(details.initiator.match(/^chrome-extension/)) 
                return;

        if(!requestsCacheBuffer[details.tabId])
            //@ts-ignore
            requestsCacheBuffer[details.tabId] = {};

        requestsCacheBuffer[details.tabId] = Object.assign(requestsCacheBuffer[details.tabId], details);
    
    }, { urls: ['https://concert.ua/api/v3/scheme/metadata'] }, 
    idx == 1 
        ? ['requestHeaders'] 
        : ['requestBody']
    );

})