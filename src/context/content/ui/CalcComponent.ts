
import { ResponseWithMetadata, Metadata } from './../../../types/Messaging';

var prices : {[key: number]: number} = {};

const restoreMissingPricesLegend = () => {

    let legendsContainer = document.querySelector('.legend-control .legend-container .tickets-types-content')!;

    for(let tt of metadata.ticketTypes){
        let id = parseInt(tt.id);
        if(!prices[id]) {

            prices[id] = parseInt(tt.price);

            let legendRow = document.createElement('div'),
                marker = document.createElement('svg'),
                circle = document.createElement('circle'),
                descr = document.createElement('span');

            legendRow.classList.add('legend-control-list-item');

            marker.classList.add('legend-control-list-item-color');
            marker.classList.add('ticket-type-'+tt.id);

            //this stuff does not apply colors with "fill" so just used HAX!
            marker.style.boxShadow = 'inset 0px 0px 0px 20px '+tt.color;

            circle.setAttribute('r', "7");
            circle.setAttribute('cx', "7");
            circle.setAttribute('cy', "7");

            descr.classList.add('legend-control-list-item-description');
            descr.innerHTML = tt.price+' '+tt.currencyCode;
            descr.style.paddingLeft = '4px';

            marker.appendChild(circle);
            legendRow.appendChild(marker);
            legendRow.appendChild(descr);
            legendsContainer.appendChild(legendRow);

        }
    }

    let newSet = legendsContainer.querySelectorAll<HTMLElement>('.legend-control-list-item'),
        newSetArray : HTMLElement[] = [];
    newSet.forEach((elem) => newSetArray.push(elem));

    const getLegendRowPrice = (row: HTMLElement) => {
        let price = row.querySelector('.legend-control-list-item-description')!
        .innerHTML.match(/\d+(\.\d+)?/)![0];
        return parseFloat(price);
    }

    newSetArray.sort((elem1, elem2) => {

        let price1 = getLegendRowPrice(elem1), 
            price2 = getLegendRowPrice(elem2);

        if(price1 >= price2){
            //console.log(elem1, ' > ', elem2);
            //legendsContainer.insertBefore(elem2, elem1);
            return 1;
        } else return price1 < price2 ? -1 : 0;

    }).map((elem) => {
        legendsContainer.insertBefore(elem, legendsContainer.firstChild);
    });



}

const parsePrices = () => {

    let legendRows = document.querySelectorAll<HTMLElement>('.legend-control-list-item');

    for(let lg of legendRows){

        let typeContainer = lg.querySelector<HTMLElement>('svg')!;

        if(!typeContainer.classList.contains('seat-default')){

            let priceLabel = lg.querySelector<HTMLElement>('.legend-control-list-item-description')!,
                priceStr = priceLabel.innerText.match(/(?<price>\d+(\.\d+)?)/)![0],
                price = parseInt(priceStr),
                typeId = 0;

            typeContainer.classList.forEach((val) => {
                let match = val.match(/ticket-type-(?<id>\d+)/);
                if(match) typeId = parseInt(match.groups!.id);
            })

            prices[typeId] = price;

        }
        
    }

    restoreMissingPricesLegend();

}

const calculateSeatsAvailTotalSum = (data: Metadata) => {
    let total = 0;
    for(let seat of data.seats) total += prices[parseInt(seat.ticketTypeId)];
    return total;
}

interface LayoutSeat {
    element: Element;
    busy: boolean;
    row: LayoutRow;
}

interface LayoutRow {
    element: Element;
    seats: LayoutSeat[];
    container: LayoutContainer;
    ticketTypeId: number;
}

interface LayoutContainer {
    element: Element;
    rows: LayoutRow[];
}

const getTicketTypeIdFromClassList = (elem: Element | HTMLElement) => {

    let typeId = 0;
    elem.classList.forEach((val) => {
        let match = val.match(/ticket-type-(?<id>\d+)/);
        if(match) typeId = parseInt(match.groups!.id);
    })
    return typeId;

}

var layout : LayoutContainer[] = [];

const parseLayout = () => {
    let all = document.querySelector<HTMLElement>('svg#Слой_1')!, // LOL
        children = all.children,
        containers : LayoutContainer[] = [];

    for(let child of children){
        if(child.nodeName == 'g' && child.id != 'curves')
            containers.push({
                element: child, rows: []
            });
    }

    for(let container of containers){
        let childRows = container.element.children;
        for(let cr of childRows){
            if(cr.nodeName == 'g') container.rows.push({
                element: cr,
                seats: [],
                container, ticketTypeId: 0
            })
        }
        for(let row of container.rows){
            let seatElements = row.element.querySelectorAll('g');
            for(let seat of seatElements){
                row.seats.push({
                    row, element: seat, busy: !seat.classList.contains('seat-available')
                });
                if(seat.classList.contains('seat-available')){
                    row.ticketTypeId = getTicketTypeIdFromClassList(seat);
                }
            }
        }
        layout = containers;
    }
}

interface CalcResult {

    availCount: number;
    availSum: number;
    busyCount: number;
    busySum: number;
    undefRows: number;
    undefSeats: number;
    currency: string;

}

const getInitialCircleSize = () => {
    //not the best way ever though...
    return document.querySelector('circle[r="10"]')!.getBoundingClientRect().width;
}

let switchesOpen = false;

const initPriceSwitches = (ctrl: HTMLElement, row: LayoutRow) => {

    let size = getInitialCircleSize();

    for(let ticketData of metadata.ticketTypes){
        let priceSwitch = document.createElement('div');

        priceSwitch.classList.add('switch-price');
        priceSwitch.classList.add('hidden');
        priceSwitch.style.width = priceSwitch.style.height = priceSwitch.style.borderRadius = size+'px';
        priceSwitch.style.background = ticketData.color;
        priceSwitch.innerText = ' ';

        priceSwitch.addEventListener('click', () => {
            if(!switchesOpen){
                for(let sw of ctrl.querySelectorAll('.switch-price')){
                    sw.classList.remove('hidden');
                }
                switchesOpen = true;
            } else {
                row.ticketTypeId = parseInt(ticketData.id);
                for(let sw of ctrl.querySelectorAll('.switch-price')){
                    sw.classList.add('hidden');
                }
                priceSwitch.classList.remove('hidden');
                updateCondition();
                switchesOpen = false;
            }
        })

        ctrl.appendChild(priceSwitch);

    }

    let unknownSwitch = document.createElement('div');
    
    unknownSwitch.classList.add('switch-price');
    unknownSwitch.style.width = unknownSwitch.style.height = unknownSwitch.style.borderRadius = size+'px';
    unknownSwitch.style.background = '#AAAAAA';
    unknownSwitch.innerText = '?';

    unknownSwitch.addEventListener('click', () => {
        console.log('unknown switch click');
        if(!switchesOpen){
            for(let sw of ctrl.querySelectorAll('.switch-price')){
                sw.classList.remove('hidden');
            }
            switchesOpen = true;
        } else {
            row.ticketTypeId = 0;
            for(let sw of ctrl.querySelectorAll('.switch-price')){
                sw.classList.add('hidden');
            }
            unknownSwitch.classList.remove('hidden');
            updateCondition();
            switchesOpen = false;
        }
    })

    ctrl.appendChild(unknownSwitch);

}

const initDefControllers = (row: LayoutRow) => {

    let ctrl = document.createElement('div');
    initPriceSwitches(ctrl, row);
    ctrl.style.top = (row.element.getBoundingClientRect().top)+'px';
    
    let rowRect = row.element.getBoundingClientRect(), 
        clientRect = document.body.getBoundingClientRect();

    if(rowRect.width > rowRect.height) { //horizontal
        ctrl.style.right = (clientRect.width - rowRect.left + 20)+'px';
        ctrl.style.top = rowRect.top+'px';
    } else { //vertical
        ctrl.style.top = (rowRect.top - 20)+'px';
        ctrl.style.left = (rowRect.left)+'px';
        ctrl.style.maxWidth = rowRect.width+'px';
        //TODO: yet untested with really sold out rows
        //TODO: maybe attach to bottom instead top?
    }

    ctrl.classList.add('plugin-row-ext');
    ctrl.id = row.element.id;

    document.body.appendChild(ctrl);
}

const calculateResultsFromLayout : (data: Metadata) => CalcResult 
= (data: Metadata) => {
    let result : CalcResult = {
        availCount: 0, availSum: 0, busyCount: 0, busySum: 0,
        undefRows: 0, undefSeats: 0, currency: data.ticketTypes[0].currencyCode.toUpperCase()
    };

    result.availCount = data.seats.length;
    result.availSum = calculateSeatsAvailTotalSum(data);

    for(let l of layout){
        for(let r of l.rows){
            if(r.ticketTypeId == 0){
                initDefControllers(r);
                result.undefRows++;
                result.undefSeats += r.seats.length;
            } else {
                for(let s of r.seats) {
                    if(s.busy) {
                        result.busyCount++;
                        result.busySum += prices[r.ticketTypeId];
                    }
                }
            }
        }
    }
    
    return result;
}

const fillComponentWithContent = (component: HTMLElement, result: CalcResult) => {
    //TODO: localize on demand
    component.innerHTML = `Свободных мест: ${
        result.availCount
    }<br/>Стоимость свободных мест: ${
        result.availSum+' '+result.currency
    }<br/>Купленных билетов (опр.): ${
        result.busyCount
    }<br/>Стоимость купленных билетов (опр.): ${
        result.busySum+' '+result.currency
    }<br/>${
        result.undefRows ? `Не определено: мест: ${
            result.undefSeats
        }, рядов: ${result.undefRows}` : ''
    }`
}


let component = document.createElement('div'),
    metadata: Metadata;

const updateCondition = () => {

    fillComponentWithContent(component, calculateResultsFromLayout(metadata));

}

export const injectUiComponent = (response: ResponseWithMetadata) => {

    metadata = response.metadata!;

    parsePrices();
    parseLayout();
    
    component.classList.add('plugin-ui-component');

    updateCondition();

    document.body.appendChild(component);

}