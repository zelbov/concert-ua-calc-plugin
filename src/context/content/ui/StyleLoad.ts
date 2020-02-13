

export const injectStyleComponent = async() => {

    let styleElem = document.createElement('link');
    styleElem.rel = 'stylesheet';
    styleElem.type = 'text/css';
    styleElem.href = chrome.extension.getURL('/assets/css/calc-plugin.css');
    document.body.appendChild(styleElem);
    return await new Promise((resolve) => {
        styleElem.onload = () => resolve();
    });

}