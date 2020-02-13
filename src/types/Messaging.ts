
export interface ResponseWithMetadata {
    
    error?: string;
    stack?: string;
    metadata?: Metadata;

}

export interface FanZone {
    [key: string]: any;
}

export interface Seat {
    [key: string]: any;
    id: string;
    seatStatusId: string;
    sectorElId: string;
    row: string;
    seat: string;
    sectorTitle: string;
    ticketTypeId: string;
    seatContainer: string;
    extraInfo: string;
}

export interface Sector {
    [key: string] : any;
}

export interface SectorContent {
    [key: string]: any;
}

export interface TicketType {
    [key: string]: any;
    id: string;
    color: string;
    price: string;
    currencyCode: string;
    titlePrint: string;
    groupId: string;
    childTypeId: number;
    childTypeMaxLimit: string;
    childTypeMinLimit: string;
}

export interface Metadata {

    seats: Seat[];
    fanZones: FanZone[];
    sectors: Sector[];
    sectorsContent: SectorContent[];
    ticketTypes: TicketType[];

}


export interface MetadataRequestMessage {

    [key: string] : any;
    command: 'concert_ua_metadata_request';

}

export interface MetadataResponse {

    response: ResponseWithMetadata;

}