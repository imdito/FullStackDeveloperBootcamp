
export interface IGlobalResponse<T = unknown>{
    status : boolean;
    message : string;
    data? : T;
    pagination? : IPagination;
    error? : IErrorDetail | IErrorDetail[];
}

export interface IPagination {
    current_page: number;
    per_page: number;
    total: number;
    total_page: number;
}

export interface IErrorDetail {
    message: string;
    field?: string;
}

export interface ILoginResponse {
    token: string;
    admin:{
        id: number;
        email: string;
        username: string;
        name: string;
    };
}

export type TGlobalResponse<T = unknown> = IGlobalResponse<T>;