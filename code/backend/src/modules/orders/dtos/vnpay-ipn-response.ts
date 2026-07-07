export class VnpayIpnResponse{
    RspCode!: string;
    Message!: string;
}

export class VnpayReturn{
    isSuccess!: boolean;
    message?: string;
    data?: DataResponse;
}

export class DataResponse{
    orderId!: number;
    amount!: number
}