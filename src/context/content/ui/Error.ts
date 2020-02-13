
import { ResponseWithMetadata } from './../../../types/Messaging';

export const injectErrorMessage = (response: ResponseWithMetadata, overrideError?: string) => {

    let existing = document.body.querySelector('.plugin-err-msg');
    if(existing) document.body.removeChild(existing);

    let container = document.createElement('div');
    
    container.classList.add('plugin-err-msg');
    container.innerText = overrideError? overrideError : response.error!;
    
    document.body.appendChild(container);
    
    if(response.stack) console.warn(response.stack)
    else console.warn(overrideError ? overrideError : response.error);

    setTimeout(() => document.body.removeChild(container), 10000);

}